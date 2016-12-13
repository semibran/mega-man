export default {
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
