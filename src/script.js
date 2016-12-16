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
