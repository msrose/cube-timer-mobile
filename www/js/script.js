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
    var $btnTime = $('#btnTime');
    var $btnStart = $('#btnStart')
    var $document = $(document);
    var startTimeout = null;
    var timer = new Timer(10);
    var startTime;

    $btnStart.on('click', function(event) {
      $puzzleName.text($puzzleDropdown.val());
      $choosePuzzle.hide();
      $timer.show();
      $document.on('backbutton', back);
    });

    $btnTime
      .on('touchstart', ready)
      .on('mousedown', ready)
      .on('touchend', cancelReady)
      .on('mouseup', cancelReady);

    function back(event) {
      $timer.hide();
      $choosePuzzle.show();
      $document.off('backbutton', back);
    }

    function ready(event) {
      startTimeout = setTimeout(function() {
        startTimeout = null;
        $counter.hide();
        $ready.css({
          display: 'block',
          visibility: 'visible',
          backgroundColor: 'green'
        });
        $btnTime
          .on('touchend', start)
          .on('mouseup', start);
      }, 500);
    }

    function cancelReady(event) {
      if(startTimeout) {
        clearTimeout(startTimeout);
      }
    }

    function start(event) {
      startTime = Date.now();
      $btnTime
        .off('touchend', start)
        .off('mouseup', start);
      $btnTime.hide();
      $counter.show();
      $ready.hide();
      timer.reset();
      timer.subscribe(subscriber);
      $document
        .on('touchstart', done)
        .on('mousedown', done);
      timer.start();
    }

    function subscriber(ticks) {
      $counterDisplay.text(formatTime(ticks));
    }

    function done(event) {
      var endTime = Date.now();
      $document
        .off('touchstart', done)
        .off('mousedown', done);
      timer.stop();
      timer.unsubscribe(subscriber);
      $counterDisplay.text(formatTime(endTime - startTime));
      $btnTime.show();
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
