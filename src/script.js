import Graphics from "./graphics"

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

var sprite = new Graphics.Sprite(Square.proto.type.sprite)
sprite.position = display.center

var scene = new Graphics.Scene
scene.add(sprite)

display.mount("#app").draw(scene)
