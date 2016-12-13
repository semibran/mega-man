var displays  = []
var listening = false
var resized   = false

function listen() {
  listening = true
  window.addEventListener("resize", onWindowResize)
}

function resize() {
  displays.forEach(function (display) {
    display.resize()
  })
  resized = false
}

function onWindowResize() {
  if (!resized) {
    requestAnimationFrame(resize)
  }
  resized = true
}

function Scene() {
  this.sprites = []
}

Scene.prototype = {
  add: function (sprite) {
    this.sprites.push(sprite)
  },
  remove: function (sprite) {
    var index, sprites = this.sprites
    (index = sprites.indexOf(sprite)) !== 1 && sprites.splice(index, 1)
  }
}

function Display(aspectRatio) {
  // Private variables
  var _canvas  = document.createElement("canvas")
  var _context = _canvas.getContext("2d")
  var _fill    = "black"
  var _parent  = null
  var _scene   = null
  var _scale   = 256
  var _unit    = 0

  this.aspectRatio = aspectRatio = aspectRatio || 4 / 3
  this.center = [_scale / 2, _scale * (1 / aspectRatio / 2)]
  displays.push(this)

  // Privileged methods
  Object.assign(this, {
    resize: function () {
      var parentRect       = _parent.getBoundingClientRect()
      var parentRectWidth  = parentRect.width
      var parentRectHeight = parentRect.height
      var aspectRatio      = this.aspectRatio
      var width            = parentRectWidth
      var height           = width * (1 / aspectRatio)
      if (height > parentRectHeight) {
        height = parentRectHeight
        width  = height * aspectRatio
      }
      width = Math.round(width)
      height = Math.round(height)
      if (width !== _canvas.width || height !== _canvas.height) {
        _canvas.width  = width
        _canvas.height = height
        _unit = width / _scale
        this.clear()
        this.render(_scene)
      }
      return this
    },
    clear: function (region) {
      if (region) {
        var x = region[0] - 1
        var y = region[1] - 1
        var w = region[2] + 2
        var h = region[3] + 2
      } else {
        var x = 0
        var y = 0
        var w = _canvas.width
        var h = _canvas.height
      }
      _context.fillStyle = _fill
      _context.fillRect(x, y, w, h)
    },
    render: function (scene, force) {
      scene = scene || _scene
      if (!scene) return null // throw "GraphicsError: Cannot `redraw` `Display` with an undefined `scene`."
      scene.sprites.forEach(this.redrawSprite, this)
      _scene = scene
    },
    clearSprite: function (sprite) {
      var oldRegion = sprite.region
      var newRegion = sprite.getRegion(_unit)
      if (!oldRegion) return true // throw "GraphicsError: Cannot clear `Sprite` of `region` null"
      for (var i = oldRegion.length; i--;) {
        if (oldRegion[i] !== newRegion[i]) {
          break
        }
        if (i === 0) return false
      }
      this.clear(region)
      return region
    },
    drawSprite: function (sprite) {
      region = sprite.getRegion(_unit)
      if (!region) throw "GraphicsError: Cannot draw `Sprite` of `region` null"
      var x = region[0]
      var y = region[1]
      var w = region[2]
      var h = region[3]
      _context.drawImage(sprite.element, x, y, w, h)
      sprite.region = region
    },
    redrawSprite: function (sprite) {
      var region = this.clearSprite(sprite)
      if (region) {
        this.drawSprite (sprite)
      }
    },
    mount: function (parentSelector) {
      var parent = document.querySelector(parentSelector)
      if (!parentSelector) throw "GraphicsError: `parentSelector` for `Display.mount` (`" + parentSelector + "`) was invalid."
      if (!parent)         throw "GraphicsError: `parentSelector` for `Display.mount` (`" + parentSelector + "`) provided invalid parent."
      parent.appendChild(_canvas)
      _parent = parent
      this.resize()
      return this
    }
  })

  // Listen for resize events
  if (!listening) {
    listen()
  }
}

Display.prototype = {
  addSprite: function (sprite) {
    sprite.display = this
    this.sprites.push(sprite)
  },
  removeSprite: function (sprite) {
    sprite.display = null
    var sprites = this.sprites
    var index   = sprites.indexOf(sprite)
    index !== -1 && sprites.splice(index, 1)
  }
}

function Sprite(type) {
  // Private variables
  var _width   = 0
  var _height  = 0
  var _canvas  = this.element = document.createElement("canvas")
  var _context = _canvas.getContext("2d")

  this.type  = "rect"
  this.color = "white"
  this.size  = [_width, _height]

  // Privileged methods
  Object.assign(this, {
    render: function () {
      _context.fillStyle = this.color
      _context.fillRect(0, 0, _canvas.width, _canvas.height)
    },
    resize: function (width, height) {
      this.size = [width, height]
      _canvas.width  = _width  = width
      _canvas.height = _height = height
      this.render()
      this.region = this.getRegion()
    }
  })

  Object.assign(this, type || {})
  this.region = null
  this.position  = null

  var transform = this.transform = new Transform()

  Object.assign(this, transform.getMethods(transform.translation, transform.rotation, transform.scaling))

  this.resize(this.size[0] || 0, this.size[1] || 0)
}

Sprite.prototype = {
  getRegion: function (scaling) {
    var position = this.position
    var size = this.size

    if (!position) return null // throw "GraphicsError: Cannot get `Sprite.region` with `position` null"

    var w = size[0]
    var h = size[1]
    var x = position[0] - w / 2
    var y = position[1] - h / 2
    var region = [x * scaling, y * scaling, w * scaling, h * scaling]
    return region
  }
}

function Transform(translation, rotation, scaling) {
  this.translation = translation = translation || [0, 0]
  this.rotation    = rotation    = rotation    || 0
  this.scaling     = scaling     = scaling       || [0, 0]
  Object.assign(this, this.getMethods(translation, rotation, scaling))
}

Transform.prototype = {
  getMethods: function (translation, rotation, scaling) {
    return {
      translate: function (x, y) {
        translation[0] = x
        translation[1] = y
      },
      translateX: function (x) {
        translation[0] = x
      },
      translateY: function (y) {
        translation[1] = y
      },
      rotate: function (r) {
        while (r < 0) r += 360
        while (r > 360) r -= 360
        rotation = r
      },
      scale: function (x, y) {
        scaling[0] = x
        scaling[1] = y
      },
      scaleX: function (x) {
        scaling[0] = x
      },
      scaleY: function (y) {
        scaling[1] = y
      }
    }
  }
}

Object.assign(Sprite.prototype, Transform.prototype)

export default {
  Display: Display,
  Scene: Scene,
  Sprite: Sprite
}
