(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var raf = require('./raf');
var rng = require('./rng');

var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');

var seed = 1;
var rand = rng(seed);

var balls = [];
var colors = [
  '#7FDBFF', '#0074D9', '#01FF70', '#001F3F', '#39CCCC',
  '#3D9970', '#2ECC40', '#FF4136', '#85144B', '#FF851B',
  '#B10DC9', '#FFDC00', '#F012BE',
];

for (var i = 0; i < 50; i++) {
  balls.push({
    x: rand.int(canvas.width),
    y: rand.int(canvas.height / 2),
    radius: rand.range(15, 35),
    dx: rand.range(-100, 100),
    dy: 0,
    color: rand.pick(colors)
  });
}

raf.start(function(elapsed) {
  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update each balls
  balls.forEach(function(ball) {
    // Gravity
    ball.dy += elapsed * 1500;

    // Handle collision against the canvas's edges
    if (ball.x - ball.radius < 0 && ball.dx < 0 || ball.x + ball.radius > canvas.width && ball.dx > 0) ball.dx = -ball.dx * 0.7;
    if (ball.y - ball.radius < 0 && ball.dy < 0 || ball.y + ball.radius > canvas.height && ball.dy > 0) ball.dy = -ball.dy * 0.7;

    // Update ball position
    ball.x += ball.dx * elapsed;
    ball.y += ball.dy * elapsed;

    // Render the ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = ball.color;
    ctx.fill();
  });
});
},{"./raf":2,"./rng":3}],2:[function(require,module,exports){
// Holds last iteration timestamp.
var time = 0;

/**
 * Calls `fn` on next frame.
 *
 * @param  {Function} fn The function
 * @return {int} The request ID
 * @api private
 */
function raf(fn) {
  return window.requestAnimationFrame(function() {
    var now = Date.now();
    var elapsed = now - time;

    if (elapsed > 999) {
      elapsed = 1 / 60;
    } else {
      elapsed /= 1000;
    }

    time = now;
    fn(elapsed);
  });
}

module.exports = {
  /**
   * Calls `fn` on every frame with `elapsed` set to the elapsed
   * time in milliseconds.
   *
   * @param  {Function} fn The function
   * @return {int} The request ID
   * @api public
   */
  start: function(fn) {
    return raf(function tick(elapsed) {
      fn(elapsed);
      raf(tick);
    });
  },
  /**
   * Cancels the specified animation frame request.
   *
   * @param {int} id The request ID
   * @api public
   */
  stop: function(id) {
    window.cancelAnimationFrame(id);
  }
};
},{}],3:[function(require,module,exports){
module.exports = function(seed) {
    function random() {
      var x = Math.sin(0.8765111159592828 + seed++) * 1e4
      return x - Math.floor(x)
    }
    
    var rng = {
      /**
       * Return an integer within [0, max).
       *
       * @param  {int} [max]
       * @return {int}
       * @api public
       */
      int: function(max) {
        return random() * (max || 0xfffffff) | 0;
      },
      /**
       * Return a float within [0.0, 1.0).
       *
       * @return {float}
       * @api public
       */
      float: function() {
        return random();
      },
      /**
       * Return a boolean.
       *
       * @return {Boolean}
       * @api public
       */
      bool: function() {
        return random() > 0.5;
      },
      /**
       * Return an integer within [min, max).
       *
       * @param  {int} min
       * @param  {int} max
       * @return {int}
       * @api public
       */
      range: function(min, max) {
        return rng.int(max - min) + min;
      },
      /**
       * Pick an element from the source.
       *
       * @param  {mixed[]} source
       * @return {mixed}
       * @api public
       */
      pick: function(source) {
        return source[rng.range(0, source.length)];
      }
    };
  
    return rng;
  };
},{}]},{},[1]);
