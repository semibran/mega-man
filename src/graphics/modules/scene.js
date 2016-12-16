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
