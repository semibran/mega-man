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

export default Object.assign({}, constants, methods)
