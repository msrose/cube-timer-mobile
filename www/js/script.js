(function($) {
  'use strict';

  $(document).on('deviceready', function(event) {
    var $choosePuzzle = $('#choosePuzzle');
    var $puzzleDropdown = $('#puzzleDropdown');
    var $timer = $('#timer');
    var $puzzleName = $('#puzzleName');
    var $ready = $('#ready');
    var $counter = $('#counter');
    var $counterDisplay = $('#counterDisplay');
    var $btnStart = $('#btnStart')
    var $document = $(document);
    var $body = $('body');
    var startTimeout = null;
    var timer = new Timer(10);
    var startTime;

    $btnStart.on('click', function(event) {
      $puzzleName.text($puzzleDropdown.val());
      $choosePuzzle.hide();
      $timer.show();
      $document
        .on('backbutton', back)
        .on('touchstart mousedown', ready)
        .on('touchend mouseup', cancelReady);
    });

    function back(event) {
      $timer.hide();
      $choosePuzzle.show();
      plugins.insomnia.allowSleepAgain();
      $document
        .off('backbutton', back)
        .off('touchstart mousedown', ready)
        .off('touchend mouseup', cancelReady)
        .off('touchstart mousedown', done);
      timer.unsubscribe(subscriber);
      timer.stop();
      timer.reset();
      $counterDisplay.html('&nbsp;');
    }

    function ready(event) {
      event.preventDefault();
      $body.css({ backgroundColor: '#b3ccff' });
      startTimeout = setTimeout(function() {
        startTimeout = null;
        $counter.hide();
        $ready.show();
        $body.css({ backgroundColor: '#ccff99' });
        $document.on('touchend mouseup', start);
      }, 500);
    }

    function cancelReady(event) {
      if(startTimeout) {
        clearTimeout(startTimeout);
        $body.css({ backgroundColor: 'white' });
      }
    }

    function start(event) {
      startTime = Date.now();
      plugins.insomnia.keepAwake();
      $body.css({ backgroundColor: 'white' });
      $document.off('touchend mouseup', start);
      $counter.show();
      $ready.hide();
      timer.reset();
      timer.subscribe(subscriber);
      $document.on('touchstart mousedown', done);
      timer.start();
    }

    function subscriber(ticks) {
      $counterDisplay.text(formatTime(ticks));
    }

    function done(event) {
      var endTime = Date.now();
      $document.off('touchstart mousedown', done);
      plugins.insomnia.allowSleepAgain();
      timer.stop();
      timer.unsubscribe(subscriber);
      $counterDisplay.text(formatTime(endTime - startTime));
    }

    function pad(num, size) {
      var str = num.toString();
      while(str.length < size) {
        str = '0' + str;
      }
      return str;
    }

    function formatTime(ms) {
      var mins = Math.floor(ms / 60000);
      ms %= 60000;
      var secs = Math.floor(ms / 1000);
      ms %= 1000;
      var subsecs = ms;
      return mins + ':' + pad(secs, 2) + '.' + pad(subsecs, 3);
    }
  });
})(jQuery);
