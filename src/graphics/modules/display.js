var displays = []

var listening = false
function listen() {
  window.addEventListener("resize", onWindowResize)
  listening = true
}

var resized = false
function onWindowResize() {
  if (!resized) {
    requestAnimationFrame(resize)
  }
  resized = true
}

function resize() {
  for (var i = displays.length; i--; displays[i].resize());
  resized = false
}

function Display(aspectRatio) {

  // Other
  this.aspectRatio = aspectRatio = aspectRatio || 4 / 3
  this.scene       = null

  // DOM
  var _canvas       = this.canvas  = document.createElement("canvas")
  this.canvasWidth  = _canvas.width  = 0
  this.canvasHeight = _canvas.height = 0
  this.context      = _canvas.getContext("2d")
  this.parent       = null

  var width  = this.width
  var height = this.height = width * (1 / aspectRatio)
  this.center = [width / 2, height / 2]

  displays.push(this)

  // Listen for resize events (only called once)
  if (!listening) {
    listen()
  }
}

Display.prototype = {
  width: 256,
  scale: 256,
  mount: function (parentSelector) {
    if (!parentSelector) throw "GraphicsError: `parentSelector` is not defined"
    var parent = document.querySelector(parentSelector)
    if (!parent) throw "GraphicsError: `parentSelector` yielded undefined parent"
    parent.appendChild(this.canvas)
    this.parent = parent
    this.resize()
  },
  resize: function () {
    var parent = this.parent
    if (!parent) throw "GraphicsError: `Display` cannot be resized before `mount`"
    var parentRect   = parent.getBoundingClientRect()
    var parentWidth  = parentRect.width
    var parentHeight = parentRect.height
    var aspectRatio  = this.aspectRatio
    var height = parentHeight
    var width  = height * aspectRatio
    if (width > parentWidth) {
      width  = parentWidth
      height = width * (1 / aspectRatio)
    }
    if (width !== this.canvasWidth || height !== this.canvasHeight) {
      var canvas = this.canvas
      canvas.width  = this.canvasWidth  = width
      canvas.height = this.canvasHeight = height
      this.context.imageSmoothingEnabled = false
      this.unit = width / this.scale
      this.clear()
      this.render()
    }
  },
  clear: function (region) {
    var x, y, w, h
    if (region) {
      x = region[0]
      y = region[1]
      w = region[2]
      h = region[3]
    } else {
      var canvas = this.canvas
      x = 0
      y = 0
      w = canvas.width
      h = canvas.height
    }
    var context = this.context
    context.fillStyle = "black"
    context.fillRect(x, y, w, h)
  },
  render: function (scene, force) {
    this.scene = scene = scene || this.scene
    if (!scene) return null // throw "GraphicsError: Display failed to render scene `" + scene + "`"
    var sprites = scene.sprites
    for (
      var i = 0, max = sprites.length, sprite;
      sprite = sprites[i++];
      this.redrawSprite(sprite, force)
    );
  },
  clearSprite: function (sprite, force) {
    var oldRegion = sprite.region
    var newRegion = sprite.getRegion(this.unit)
    if (!oldRegion) return true // Sprite has not been drawn yet.
    if (!force) { // Ignore this step if we're forcing a redraw.
      for (var i = oldRegion.length; i--;) {
        if (oldRegion[i] !== newRegion[i]) break
        if (!i) return false // The sprite's position has not changed.
      }
    }
    this.clear(oldRegion)
    return newRegion
  },
  drawSprite: function (sprite, region) {
    var unit = this.unit
    region = region || sprite.getRegion(unit)
    if (!region) throw "GraphicsError: Cannot draw `Sprite` with `region` null"
    var context = this.context
    var x = region[0]
    var y = region[1]
    var w = region[2]
    var h = region[3]
    context.drawImage(sprite.canvas, x, y, w, h)
    sprite.region = region
  },
  redrawSprite: function (sprite, force) {
    var region = this.clearSprite(sprite, force)
    if (region) {
      this.drawSprite(sprite, region !== true ? region : null)
    }
  }
}
module.exports = Display
