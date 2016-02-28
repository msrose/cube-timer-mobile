(function($) {
  'use strict';

  var $choosePuzzle = $('#choosePuzzle');
  var $puzzleDropdown = $('#puzzleDropdown');
  var $timer = $('#timer');
  var $puzzleName = $('#puzzleName');
  var $ready = $('#ready');
  var $counter = $('#counter');
  var $counterDisplay = $('#counterDisplay');
  var $btnTime = $('#btnTime');
  var $btnBack = $('#btnBack')
  var $document = $(document);

  $('#btnStart').on('click', function(event) {
    $puzzleName.text($puzzleDropdown.val());
    $choosePuzzle.hide();
    $timer.show();
  });

  $btnBack.on('click', function(event) {
    $timer.hide();
    $choosePuzzle.show();
  });

  var startTimeout = null;

  function timeStart(event) {
    $counterDisplay.html('&nbsp;');
    startTimeout = setTimeout(function() {
      startTimeout = null;
      $counter.css({ backgroundColor: 'green' });
      $ready.css({ visibility: 'visible' });
    }, 500);
  }

  function timeEnd(event) {
    if(startTimeout) {
      clearTimeout(startTimeout);
    } else {
      $btnTime.hide();
      $btnBack.hide();
      $counter.css({ backgroundColor: 'white' });
      $ready.css({ visibility: 'hidden' });
      var timer = new Timer(10);
      var subscriber = function(ticks) {
        $counterDisplay.text(ticks);
      };
      timer.subscribe(subscriber);
      var endEvent = function(event) {
        $document
          .off('touchstart', endEvent)
          .off('mousedown', endEvent);
        timer.stop();
        timer.unsubscribe(subscriber);
        $btnTime.show();
        $btnBack.show();
      };
      $document
        .on('touchstart', endEvent)
        .on('mousedown', endEvent);
      timer.start();
    }
  }

  $btnTime
    .on('touchstart', timeStart)
    .on('mousedown', timeStart)
    .on('touchend', timeEnd)
    .on('mouseup', timeEnd);

})(jQuery);
