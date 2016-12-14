var displays  = [];
var listening = false;
var resized   = false;

function listen() {
  listening = true;
  window.addEventListener("resize", onWindowResize);
}

function resize() {
  displays.forEach(function (display) {
    display.resize();
  });
  resized = false;
}

function onWindowResize() {
  if (!resized) {
    requestAnimationFrame(resize);
  }
  resized = true;
}

function Scene() {
  this.sprites = [];
}

Scene.prototype = {
  add: function (sprite) {
    for (var i = arguments.length; i--; this.sprites.push(arguments[i]));
  },
  remove: function (sprite) {
    var index, sprites = this.sprites
    (index = sprites.indexOf(sprite)) !== 1 && sprites.splice(index, 1);
  }
};

function Display(aspectRatio) {
  // Private variables
  var _canvas  = document.createElement("canvas");
  var _context = _canvas.getContext("2d");
  var _fill    = "black";
  var _parent  = null;
  var _scene   = null;
  var _scale   = 256;
  var _unit    = 0;

  this.aspectRatio = aspectRatio = aspectRatio || 4 / 3;
  this.center = [_scale / 2, _scale * (1 / aspectRatio / 2)];
  displays.push(this);

  // Privileged methods
  Object.assign(this, {
    resize: function () {
      var parentRect       = _parent.getBoundingClientRect();
      var parentRectWidth  = parentRect.width;
      var parentRectHeight = parentRect.height;
      var aspectRatio      = this.aspectRatio;
      var width            = parentRectWidth;
      var height           = width * (1 / aspectRatio);
      if (height > parentRectHeight) {
        height = parentRectHeight;
        width  = height * aspectRatio;
      }
      width = Math.round(width);
      height = Math.round(height);
      if (width !== _canvas.width || height !== _canvas.height) {
        _canvas.width  = width;
        _canvas.height = height;
        _unit = width / _scale;
        this.clear();
        this.render(_scene);
      }
      return this
    },
    clear: function (region) {
      if (region) {
        var x = region[0] - 1;
        var y = region[1] - 1;
        var w = region[2] + 2;
        var h = region[3] + 2;
      } else {
        var x = 0;
        var y = 0;
        var w = _canvas.width;
        var h = _canvas.height;
      }
      _context.fillStyle = _fill;
      _context.fillRect(x, y, w, h);
    },
    render: function (scene, force) {
      scene = scene || _scene;
      if (!scene) return null // throw "GraphicsError: Cannot `redraw` `Display` with an undefined `scene`."
      scene.sprites.forEach(this.redrawSprite, this);
      _scene = scene;
    },
    clearSprite: function (sprite) {
      var oldRegion = sprite.region;
      var newRegion = sprite.getRegion(_unit);
      if (!oldRegion) return true // throw "GraphicsError: Cannot clear `Sprite` of `region` null"
      for (var i = oldRegion.length; i--;) {
        if (oldRegion[i] !== newRegion[i]) {
          break
        }
        if (i === 0) return false
      }
      this.clear(region);
      return region
    },
    drawSprite: function (sprite) {
      region = sprite.getRegion(_unit);
      if (!region) throw "GraphicsError: Cannot draw `Sprite` of `region` null"
      var x = region[0];
      var y = region[1];
      var w = region[2];
      var h = region[3];
      _context.drawImage(sprite.element, x, y, w, h);
      sprite.region = region;
    },
    redrawSprite: function (sprite) {
      var region = this.clearSprite(sprite);
      if (region) {
        this.drawSprite (sprite);
      }
    },
    mount: function (parentSelector) {
      var parent = document.querySelector(parentSelector);
      if (!parentSelector) throw "GraphicsError: `parentSelector` for `Display.mount` (`" + parentSelector + "`) was invalid."
      if (!parent)         throw "GraphicsError: `parentSelector` for `Display.mount` (`" + parentSelector + "`) provided invalid parent."
      parent.appendChild(_canvas);
      _parent = parent;
      this.resize();
      return this
    }
  });

  // Listen for resize events
  if (!listening) {
    listen();
  }
}

Display.prototype = {
  addSprite: function (sprite) {
    sprite.display = this;
    this.sprites.push(sprite);
  },
  removeSprite: function (sprite) {
    sprite.display = null;
    var sprites = this.sprites;
    var index   = sprites.indexOf(sprite);
    index !== -1 && sprites.splice(index, 1);
  }
};

function Sprite(type) {
  // Private variables
  var _width   = 0;
  var _height  = 0;
  var _canvas  = this.element = document.createElement("canvas");
  var _context = _canvas.getContext("2d");

  this.type  = "rect";
  this.color = "white";
  this.size  = [_width, _height];

  // Privileged methods
  Object.assign(this, {
    render: function () {
      _context.fillStyle = this.color;
      _context.fillRect(0, 0, _canvas.width, _canvas.height);
    },
    resize: function (width, height) {
      this.size = [width, height];
      _canvas.width  = _width  = width;
      _canvas.height = _height = height;
      this.render();
      this.region = this.getRegion();
    }
  });

  Object.assign(this, type || {});
  this.region = null;
  this.position  = null;

  var transform = this.transform = new Transform();

  Object.assign(this, transform.getMethods(transform.translation, transform.rotation, transform.scaling));

  this.resize(this.size[0] || 0, this.size[1] || 0);
}

Sprite.prototype = {
  getRegion: function (scaling) {
    var position = this.position;
    var size = this.size;

    if (!position) return null // throw "GraphicsError: Cannot get `Sprite.region` with `position` null"

    var w = size[0];
    var h = size[1];
    var x = position[0] - w / 2;
    var y = position[1] - h / 2;
    var region = [x * scaling, y * scaling, w * scaling, h * scaling];
    return region
  }
};

function Transform(translation, rotation, scaling) {
  this.translation = translation = translation || [0, 0];
  this.rotation    = rotation    = rotation    || 0;
  this.scaling     = scaling     = scaling       || [0, 0];
  Object.assign(this, this.getMethods(translation, rotation, scaling));
}

Transform.prototype = {
  getMethods: function (translation, rotation, scaling) {
    return {
      translate: function (x, y) {
        translation[0] = x;
        translation[1] = y;
      },
      translateX: function (x) {
        translation[0] = x;
      },
      translateY: function (y) {
        translation[1] = y;
      },
      rotate: function (r) {
        while (r < 0) r += 360;
        while (r > 360) r -= 360;
        rotation = r;
      },
      scale: function (x, y) {
        scaling[0] = x;
        scaling[1] = y;
      },
      scaleX: function (x) {
        scaling[0] = x;
      },
      scaleY: function (y) {
        scaling[1] = y;
      }
    }
  }
};

function Font(image, config) {
  this.image = image;
}

function Text(text, font) {
  Sprite.call(this);
  this.text = text;
  this.font = font;
}

Text.prototype = Object.assign({}, Sprite.prototype);

var Graphics = {
  load: function (imagePath) {
    var image = new window.Image();
    image.src = imagePath;
    image.onload = function () {
      console.log(image);
    };
  },
  Display: Display,
  Scene: Scene,
  Sprite: Sprite,
  Font: Font,
  Text: Text
};

var Vector = {
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
    a[0] += b[0];
    a[1] += b[1];
    return a
  },
  added: function(a, b) {
    return [a[0] + b[0], a[1] + b[1]]
  },
  subtract: function(a, b) {
    a[0] -= b[0];
    a[1] -= b[1];
    return a
  },
  subtracted: function(a, b) {
    return [a[0] - b[0], a[1] - b[1]]
  },
  multiply: function(a, b) {
    a[0] *= b[0];
    a[1] *= b[1];
    return a
  },
  multiplied: function(a, b) {
    return [a[0] * b[0], a[1] * b[1]]
  },
  divide: function(a, b) {
    a[0] /= b[0];
    a[1] /= b[1];
    return a
  },
  divided: function(a, b) {
    return [a[0] / b[0], a[1] / b[1]]
  },
  round: function(vector) {
    vector[0] = Math.round(vector[0]);
    vector[1] = Math.round(vector[1]);
  },
  rounded: function(vector) {
    return [Math.round(vector[0]), Math.round(vector[1])]
  },
  floor: function(vector) {
    vector[0] = Math.floor(vector[0]);
    vector[1] = Math.floor(vector[1]);
  },
  floored: function(vector) {
    return [Math.floor(vector[0]), Math.floor(vector[1])]
  },
  ceil: function(vector) {
    vector[0] = Math.ceil(vector[0]);
    vector[1] = Math.ceil(vector[1]);
  },
  ceiled: function(vector) {
    return [Math.ceil(vector[0]), Math.ceil(vector[1])]
  },
  invert: function(vector) {
    vector[0] *= -1;
    vector[1] *= -1;
    return vector
  },
  inverted: function(vector) {
    return [-vector[0], -vector[1]]
  },
  scale: function(vector, scalar) {
    vector[0] *= scalar;
    vector[1] *= scalar;
    return vector
  },
  scaled: function(vector, scalar) {
    return [vector[0] * scalar, vector[1] * scalar]
  },
  magnitude: function(vector) {
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1])
  },
  normalize: function(vector) {
    var magnitude = this.magnitude(vector);
    if (!magnitude) return [0, 0]
    vector[0] /= magnitude;
    vector[1] /= magnitude;
    return vector
  },
  normalized: function(vector) {
    var magnitude = this.magnitude(vector);
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
    var degrees = Math.atan2(vector[1], vector[0]) * 180 / Math.PI;
    while (degrees < 0)
      degrees += 360;
    return degrees
  },
  getNormal: function(direction) {
    var n, t = typeof direction;
    if (t === 'number') {
      n = this.fromDegrees(direction);
    } else if (t === 'object') {
      n = this.normalized(direction);
    }
    return n
  }
};

var isPressed   = {};
var isTapped    = {};
var isReleased  = {};
var time        = {};

var constants = {
  LEFT: "ArrowLeft",
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  RIGHT: "ArrowRight",
  P: "KeyP",
  // ...
  MOUSE_LEFT: "MouseLeft"
};

function onDown(code) {
  if (!isPressed[code]) {
    isTapped[code] = true;
    time[code] = 0;
  }
  isPressed[code] = true;
}

function onUp(code) {
  if (isPressed[code]) {
    isReleased[code] = true;
  }
  isPressed[code] = false;
  time[code] = 0;
}

var listening$1 = false;
function listen$1(types, normalize, dispatch) {
  function handler(event) {
    dispatch(event.type, normalize(event));
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
    if (!listening$1) {
      listen$1(
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
      );
      listening$1 = true;
    }
    for (var key in isPressed) {
      time[key]++;
    }
    for (var key in isTapped) {
      isTapped[key] = false;
    }
    for (var key in isReleased) {
      isReleased[key] = false;
    }
  }
};

var Input = Object.assign({}, constants, methods);

var Square = {
  proto: {
    type: {
      sprite: {
        color: "crimson",
        size: [16, 16]
      }
    }
  }
};

var display = new Graphics.Display;
display.mount("#app");

var scene = new Graphics.Scene;

var sprite = new Graphics.Sprite(Square.proto.type.sprite);
sprite.position = Vector.clone(display.center);

sprite.rotate(45);

scene.add(sprite);

function createGreeting(image) {
  var font = new Graphics.Font(image, {
    chars: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!*<>-'\"()",
    width: 10,
    height: 5,
    styles: 2
  });
  var greeting = new Graphics.Text("Hello World!", font);
  greeting.position = Vector.clone(display.center);
  scene.add(greeting);
}

Graphics.load("images/text.png", createGreeting);

var Game = (function () {
  var paused = false;
  function pause() {
    paused = !paused;
  }
  function start() {
    loop();
  }
  function loop() {
    update();
    if (Input.isTapped(Input.P)) {
      paused = !paused;
    }
    Input.update();
    requestAnimationFrame(loop);
  }
  function update() {
    if (paused) return
    var directions = [];
    if (Input.isPressed(Input.LEFT)) {
      directions.push(Vector.LEFT);
    }
    if (Input.isPressed(Input.UP)) {
      directions.push(Vector.UP);
    }
    if (Input.isPressed(Input.RIGHT)) {
      directions.push(Vector.RIGHT);
    }
    if (Input.isPressed(Input.DOWN)) {
      directions.push(Vector.DOWN);
    }
    if (Input.isPressed(Input.MOUSE_LEFT)) {
      console.log("zzz");
    }
    if (directions.length) {
      var direction = Vector.clone(Vector.NEUTRAL);
      directions.forEach(function (otherDirection) {
        Vector.add(direction, otherDirection);
      });
      Vector.add(sprite.position, direction);
    }
    display.render(scene);
  }
  return {
    pause: pause,
    start: start
  }
})();

Game.start();
