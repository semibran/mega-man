(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  load: function (imagePath, callback) {
    var image = new Image()
    image.src = imagePath
    image.onload = function () {
      callback.call(window, image)
    }
  },
  Scene: require("./modules/scene"),
  Display: require("./modules/display"),
  Sprite: require("./modules/sprite"),
  ImageFont: require("./modules/image-font")
}

},{"./modules/display":2,"./modules/image-font":3,"./modules/scene":4,"./modules/sprite":5}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
function Scene() {
  this.sprites = []
}

Scene.prototype = {
  add: function () {
    for (var i = arguments.length; i--; this.sprites.push(arguments[i]));
  },
  remove: function (sprite) {
    var index, sprites = this.sprites
    (index = sprites.indexOf(sprite)) !== -1 && sprites.splice(index, 1)
  }
}

module.exports = Scene

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
var isPressed   = {}
var isTapped    = {}
var isReleased  = {}
var time        = {}

var constants = {
  LEFT: "ArrowLeft",
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  RIGHT: "ArrowRight",
  P: "KeyP",
  // ...
  MOUSE_LEFT: "MouseLeft"
}

function onDown(code) {
  if (!isPressed[code]) {
    isTapped[code] = true
    time[code] = 0
  }
  isPressed[code] = true
}

function onUp(code) {
  if (isPressed[code]) {
    isReleased[code] = true
  }
  isPressed[code] = false
  time[code] = 0
}

var listening = false
function listen(types, normalize, dispatch) {
  function handler(event) {
    dispatch(event.type, normalize(event))
  }
  for (
    var i = types.length; i--;
    window.addEventListener(types[i], handler)
  );
}

var methods = {
  isPressed: function (code) {
    return isPressed[code]
  },
  isTapped: function (code) {
    return isTapped[code]
  },
  isReleased: function (code) {
    return isReleased[code]
  },
  getTime: function (code) {
    return time[code]
  },
  update: function () {
    if (!listening) {
      listen(
        ["keydown", "keyup", "mousedown", "mouseup", "touchstart", "touchend"],
        function normalize(event) {
          if (event.type.indexOf("key") !== -1) {
            return event.code
          }
          return "MouseLeft"
        },
        function dispatch(type, data) {
          switch (type) {
            // Key events
            case "keydown": return onDown(data)
            case "keyup":   return   onUp(data)

            // Mouse events
            case "mousedown": return onDown(data)
            case "mouseup":   return   onUp(data)

            // Touch events
            case "touchstart": return onDown(data)
            case "touchend":   return   onUp(data)
          }
        }
      )
      listening = true
    }
    for (var key in isPressed) {
      time[key]++
    }
    for (var key in isTapped) {
      isTapped[key] = false
    }
    for (var key in isReleased) {
      isReleased[key] = false
    }
  }
}

module.exports = Object.assign({}, constants, methods)

},{}],7:[function(require,module,exports){
var Graphics = require("./graphics/index")
var Vector   = require("./vector")
var Input    = require("./input")

var display = new Graphics.Display
display.mount("#app")

var scene = new Graphics.Scene

function createGreeting(image) {
  var font = new Graphics.ImageFont(image, {
    chars: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!*<>-'\"() ",
    charSize: [8, 8],
    styles: 2
  })
  var greeting = new Graphics.Sprite({
    size: [128, 8],
    text: "Hello World!",
    textAlign: "center",
    font: font,
    fontSize: 8
  })
  greeting.position = Vector.clone(display.center)
  scene.add(greeting)
  display.render(scene)
}

Graphics.load("images/text.png", createGreeting)

},{"./graphics/index":1,"./input":6,"./vector":8}],8:[function(require,module,exports){
module.exports = {
  LEFT:       [-1, 0],
  RIGHT:      [ 1, 0],
  UP:         [ 0,-1],
  DOWN:       [ 0, 1],
  UP_LEFT:    [-1,-1],
  UP_RIGHT:   [ 1,-1],
  DOWN_LEFT:  [-1, 1],
  DOWN_RIGHT: [ 1, 1],
  NEUTRAL:    [ 0, 0],
  add: function(a, b) {
    a[0] += b[0]
    a[1] += b[1]
    return a
  },
  added: function(a, b) {
    return [a[0] + b[0], a[1] + b[1]]
  },
  subtract: function(a, b) {
    a[0] -= b[0]
    a[1] -= b[1]
    return a
  },
  subtracted: function(a, b) {
    return [a[0] - b[0], a[1] - b[1]]
  },
  multiply: function(a, b) {
    a[0] *= b[0]
    a[1] *= b[1]
    return a
  },
  multiplied: function(a, b) {
    return [a[0] * b[0], a[1] * b[1]]
  },
  divide: function(a, b) {
    a[0] /= b[0]
    a[1] /= b[1]
    return a
  },
  divided: function(a, b) {
    return [a[0] / b[0], a[1] / b[1]]
  },
  round: function(vector) {
    vector[0] = Math.round(vector[0])
    vector[1] = Math.round(vector[1])
  },
  rounded: function(vector) {
    return [Math.round(vector[0]), Math.round(vector[1])]
  },
  floor: function(vector) {
    vector[0] = Math.floor(vector[0])
    vector[1] = Math.floor(vector[1])
  },
  floored: function(vector) {
    return [Math.floor(vector[0]), Math.floor(vector[1])]
  },
  ceil: function(vector) {
    vector[0] = Math.ceil(vector[0])
    vector[1] = Math.ceil(vector[1])
  },
  ceiled: function(vector) {
    return [Math.ceil(vector[0]), Math.ceil(vector[1])]
  },
  invert: function(vector) {
    vector[0] *= -1
    vector[1] *= -1
    return vector
  },
  inverted: function(vector) {
    return [-vector[0], -vector[1]]
  },
  scale: function(vector, scalar) {
    vector[0] *= scalar
    vector[1] *= scalar
    return vector
  },
  scaled: function(vector, scalar) {
    return [vector[0] * scalar, vector[1] * scalar]
  },
  magnitude: function(vector) {
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1])
  },
  normalize: function(vector) {
    var magnitude = this.magnitude(vector)
    if (!magnitude) return [0, 0]
    vector[0] /= magnitude
    vector[1] /= magnitude
    return vector
  },
  normalized: function(vector) {
    var magnitude = this.magnitude(vector)
    if (!magnitude) return [0, 0]
    return this.scaled(vector, 1 / magnitude)
  },
  clone: function(vector) {
    return [vector[0], vector[1]]
  },
  fromDegrees: function(degrees) {
    var radians = degrees * Math.PI / 180;
    return [Math.cos(radians), Math.sin(radians)]
  },
  toDegrees: function(vector) {
    var degrees = Math.atan2(vector[1], vector[0]) * 180 / Math.PI
    while (degrees < 0)
      degrees += 360
    return degrees
  },
  getNormal: function(direction) {
    var n, t = typeof direction
    if (t === 'number') {
      n = this.fromDegrees(direction)
    } else if (t === 'object') {
      n = this.normalized(direction)
    }
    return n
  }
}

},{}]},{},[7]);
