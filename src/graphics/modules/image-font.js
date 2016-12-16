function ImageFont(image, config) {
  this.image = image

  var _charList   = this.charList = config.chars
  var _charSize   = this.charSize = config.charSize
  var _charWidth  = _charSize[0]
  var _charHeight = _charSize[1]
  var _styles     = this.styles   = config.styles || 1

  var _charsPerRow   = image.width  / _charWidth
  var _rowsPerStyles = image.height / _styles
  var _scale = 16

  var i = _styles
  var _chars = []
  while (i--) {
    var style = _chars[i] = []
    var j = _charList.length
    var charWidth = _charSize[0]
    var charHeight = _charSize[1]
    while (j--) {
      var canvas = document.createElement("canvas")
      canvas.width = charWidth * _scale
      canvas.height = charHeight * _scale

      var context = canvas.getContext("2d")
      context.imageSmoothingEnabled = false

      var x = j % _charsPerRow
      var y = (j - x) / _charsPerRow

      context.drawImage(image, x * charWidth, y * charHeight, charWidth, charHeight, 0, 0, charWidth * _scale, charHeight * _scale)

      style[j] = canvas
    }
  }

  this.get = function (char, style) {
    style = style || 0
    var index = _charList.indexOf(char)
    return _chars[style][index] || null
  }
}

module.exports = ImageFont
