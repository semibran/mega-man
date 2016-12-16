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
