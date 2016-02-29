(function($) {
  'use strict';

  $(document).on('deviceready', function(event) {
    SolveStorage.open(function(err) {
      if(err) console.error(err);

      var $choosePuzzle = $('#choosePuzzle');
      var $puzzleDropdown = $('#puzzleDropdown');
      var $timer = $('#timer');
      var $puzzleName = $('#puzzleName');
      var $ready = $('#ready');
      var $counter = $('#counter');
      var $counterDisplay = $('#counterDisplay');
      var $btnStart = $('#btnStart');
      var $solves = $('#solves');
      var $document = $(document);
      var $body = $('body');
      var startTimeout = null;
      var timer = new Timer(73);
      var startTime;

      $btnStart.on('touch click', function(event) {
        $puzzleName.text($puzzleDropdown.val());
        $choosePuzzle.hide();
        $timer.show();
        $document
          .on('backbutton', back)
          .on('touchstart mousedown', ready)
          .on('touchend mouseup', cancelReady);
      });

      $puzzleDropdown.on('change', viewRecords);
      viewRecords();

      function viewRecords(event) {
        $solves.empty();
        SolveStorage.getSolves($puzzleDropdown.val(), function(err, result) {
          if(err) return console.error(err);
          for(var i = 0; i < result.rows.length; i++) {
            var row = result.rows[i];
            addSolveRow(row.id, row.duration, row.recorded_at);
          }
        });
      }

      function addSolveRow(id, duration, recordedAt) {
        var $row = $('<div>')
          .addClass('solve');
        var $duration = $('<span>')
          .text(SolveUtils.formatTime(duration))
          .addClass('duration');
        var $recordedAt = $('<span>')
          .text(SolveUtils.formatDate(new Date(recordedAt)))
          .addClass('recorded-at');
        $row.append($duration).append($recordedAt);
        $solves.prepend($row);
        $row.on('touch click', function(event) {
          if(confirm('Delete solve?')) {
            SolveStorage.deleteSolve(id, function(err, result) {
              if(err) return console.err(err);
              $row.fadeOut();
            });
          }
        });
      }

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
        $counterDisplay.text(SolveUtils.formatTime(ticks));
      }

      function done(event) {
        var endTime = Date.now();
        $document.off('touchstart mousedown', done);
        plugins.insomnia.allowSleepAgain();
        timer.stop();
        timer.unsubscribe(subscriber);
        var duration = endTime - startTime;
        $counterDisplay.text(SolveUtils.formatTime(duration));
        SolveStorage.addSolve($puzzleDropdown.val(), duration, endTime, function(err, result) {
          if(err) console.error(err);
          addSolveRow(result.insertId, duration, endTime);
        });
      }
    });
  });
})(jQuery);
