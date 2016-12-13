var displays  = []
var listening = false

function listen() {
  listening = true
  window.addEventListener("resize", onWindowResize)
}

function onWindowResize() {
  displays.forEach(function (display) {
    display.resize()
  })
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
  this.scene = null
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
      _canvas.width  = width
      _canvas.height = height
      _unit = width / _scale
      this.redraw()
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
    draw: function (scene, camera) {
      if (!scene) return null
      _scene = scene
      scene.sprites.forEach(this.drawSprite, this)
    },
    redraw: function (scene) {
      this.clear()

      scene = scene || _scene
      if (!scene) return null // throw "GraphicsError: Cannot `redraw` `Display` with an undefined `scene`."

      this.draw(scene)
    },
    clearSprite: function (sprite) {
      var region = sprite.getRegion()
      this.clear(region)
      return region
    },
    drawSprite: function (sprite) {
      region = sprite.getRegion()
      if (!region) throw "GraphicsError: Cannot draw `Sprite` of `region` null"
      var x = region[0] * _unit
      var y = region[1] * _unit
      var w = region[2] * _unit
      var h = region[3] * _unit
      _context.drawImage(sprite.element, x, y, w, h)
    },
    redrawSprite: function (sprite) {
      this.clearSprite(sprite)
      this.drawSprite (sprite)
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
      if (this.position)
        this.region = this.getRegion()
    }
  })

  Object.assign(this, type || {})
  this.position  = null
  this.transform = new Transform()

  this.resize(this.size[0] || 0, this.size[1] || 0)
}

Sprite.prototype = {
  getRegion: function () {
    var position = this.position
    var size = this.size

    if (!position) throw "GraphicsError: Cannot get `Sprite.region` with `position` null"

    var w = size[0]
    var h = size[1]
    var x = position[0] - w / 2
    var y = position[1] - h / 2
    var region = [x, y, w, h]
    return region
  }
}

function Transform() {
  this.translation = [0, 0]
  this.rotation = 0
  this.scale = [0, 0]
}

export default {
  Display: Display,
  Scene: Scene,
  Sprite: Sprite
}
