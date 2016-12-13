import Graphics from "./graphics"
import Vector from "./vector"
import Input from "./input"

var Square = {
  proto: {
    type: {
      sprite: {
        color: "crimson",
        size: [16, 16]
      }
    }
  }
}

var display = new Graphics.Display
display.mount("#app")

var sprite = new Graphics.Sprite(Square.proto.type.sprite)
sprite.position = Vector.clone(display.center)

sprite.transform.rotate(45)

var scene = new Graphics.Scene
scene.add(sprite)

var Game = (function () {
  var paused = false
  function pause() {
    paused = !paused
  }
  function start() {
    loop()
  }
  function loop() {
    update()
    if (Input.isTapped(Input.P)) {
      paused = !paused
    }
    Input.update()
    requestAnimationFrame(loop)
  }
  function update() {
    if (paused) return
    var directions = []
    if (Input.isPressed(Input.LEFT)) {
      directions.push(Vector.LEFT)
    }
    if (Input.isPressed(Input.UP)) {
      directions.push(Vector.UP)
    }
    if (Input.isPressed(Input.RIGHT)) {
      directions.push(Vector.RIGHT)
    }
    if (Input.isPressed(Input.DOWN)) {
      directions.push(Vector.DOWN)
    }
    if (Input.isPressed(Input.MOUSE_LEFT)) {
      console.log("zzz")
    }
    if (directions.length) {
      var direction = Vector.clone(Vector.NEUTRAL)
      directions.forEach(function (otherDirection) {
        Vector.add(direction, otherDirection)
      })
      Vector.add(sprite.position, direction)
    }
    display.render(scene)
  }
  return {
    pause: pause,
    start: start
  }
})()

Game.start()
