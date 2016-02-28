window.Timer = (function() {
  'use strict';

  function Timer(interval) {
    this._subscribers = [];
    this._interval = interval;
    this._ticks = 0;
    this._intervalId = null;
    this._started = false;
  }

  Timer.prototype.update = function() {
    var self = this;
    this._subscribers.forEach(function(subscriber) {
      subscriber(self._ticks);
    });
  };

  Timer.prototype.start = function() {
    if(!this._started) {
      this._started = true;
      var self = this;
      this._intervalId = setInterval(function() {
        self._ticks += self._interval;
        self.update();
      }, this._interval);
    }
  };

  Timer.prototype.stop = function() {
    if(this._started) {
      this._started = false;
      clearInterval(this._intervalId);
    }
  };

  Timer.prototype.getTicks = function() {
    return this._ticks;
  };

  Timer.prototype.reset = function() {
    this._ticks = 0;
    this.update();
  };

  Timer.prototype.subscribe = function(subscriber) {
    if(typeof subscriber === 'function') {
      this._subscribers.push(subscriber);
    }
  };

  Timer.prototype.unsubscribe = function(subscriber) {
    var index = this._subscribers.indexOf(subscriber);
    if(index !== -1) {
      this._subscribers.splice(index, 1);
    }
  };

  return Timer;
})();
