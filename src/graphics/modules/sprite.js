function Sprite(type) {
  this.origin = "center"
  this.fill   = null
  this.size   = [0, 0]
  Object.assign(this, type)
  var _canvas       = this.canvas  = document.createElement("canvas")
  this.canvasWidth  = _canvas.width  = 0
  this.canvasHeight = _canvas.height = 0
  this.context      = _canvas.getContext("2d")

  this.position = [0, 0]
  this.region = null

  this.resize(this.size[0] || 0, this.size[1] || 0)
}

Sprite.prototype = {
  offsets: {
    "top-left":     [0,    0],
    "top":          [-0.5, 0],
    "top-right":    [-1,   0],
    "left":         [0,    -0.5],
    "center":       [-0.5, -0.5],
    "right":        [-1,   -0.5],
    "bottom-left":  [0,    -1],
    "bottom":       [-0.5, -1],
    "bottom-right": [-1,   -1],
  },
  getRegion: function (scale) {
    scale = scale || 1
    var position = this.position
    if (!position) return null
    var origin = this.origin
    var offset = this.offsets[origin]
    if (!offset) throw "GraphicsError: Invalid origin `" + origin + "` produced offset `" + offset + "`"
    var size = this.size
    var w = size[0]
    var h = size[1]
    var x = position[0] + offset[0] * w
    var y = position[1] + offset[1] * h
    return [x * scale, y * scale, w * scale, h * scale]
  },
  render: (function () {
    var canvas, canvasWidth, canvasHeight, context
    function drawFill(sprite) {
      var fill = sprite.fill
      if (!fill) return null
      context.fillStyle = fill
      context.fillRect(0, 0, canvasWidth, canvasHeight)
    }
    function drawStroke(sprite) {
      var stroke = sprite.stroke
      if (!stroke) return null
      context.strokeStyle = stroke
      context.strokeRect(0, 0, canvasWidth, canvasHeight)
    }
    function drawText(sprite) {
      var text = sprite.text
      if (!text) return null
      var font = sprite.font
      if (!font) return null
      var fontSize = sprite.fontSize
      if (!fontSize) return null
      var image = font.image
      if (!image) return null
      var aspectRatio = font.charSize[0] / font.charSize[1]
      var side = canvasWidth < canvasHeight ? canvasWidth : canvasHeight
      var textLength = text.length
      var i = textLength
      var charWidth  = fontSize * (1 / aspectRatio)
      var charHeight = fontSize
      while (i--) {
        var char = text[i]
        var image = font.get(char.toUpperCase())
        var x = canvasWidth  / 2 - (textLength * charWidth) / 2 + charWidth * i
        var y = canvasHeight / 2 - charHeight / 2
        context.drawImage(image, x, y, charWidth, charHeight)
      }
    }
    return function () {
      canvas       = this.canvas
      canvasWidth  = canvas.width
      canvasHeight = canvas.height
      context      = this.context
      drawFill(this)
      drawStroke(this)
      drawText(this)
    }
  })(),
  resize: function (w, h) {
    this.canvas.width  = this.canvasWidth  = this.size[0] = w
    this.canvas.height = this.canvasHeight = this.size[1] = h
    this.context.imageSmoothingEnabled = false
    this.render()
  }
}

module.exports = Sprite
