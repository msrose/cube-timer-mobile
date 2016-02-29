(function($) {
  'use strict';

  $(document).on('deviceready', function(event) {
    SolveStorage.open(function(err) {
      if(err) return alert('Could not create database: ' + err);

      var $choosePuzzle = $('#choosePuzzle');
      var $puzzleDropdown = $('#puzzleDropdown');
      var $timer = $('#timer');
      var $puzzleName = $('#puzzleName');
      var $ready = $('#ready');
      var $counter = $('#counter');
      var $counterDisplay = $('#counterDisplay');
      var $btnStart = $('#btnStart');
      var $btnSync = $('#btnSync');
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

      $btnSync.on('touch click', function(event) {
        var puzzle = $puzzleDropdown.val();
        SolveStorage.getSolves(puzzle, function(err, result) {
          if(err) return alert('Could not sync: ' + err);
          var solves = [];
          for(var i = 0; i < result.rows.length; i++) {
            var row = result.rows[i];
            delete row.id;
            solves.push(row);
          }
          if(solves.length > 0 && confirm('Sync ' + puzzle + ' now?')) {
            $.get('js/config.json', function(config) {
              $.ajax({
                url: config.syncUrl + '/solves',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ solves: solves }),
                headers: {
                  Authorization: config.authorizationToken
                },
                success: function(data) {
                  alert('Successfully synced: ' + data.message);
                  SolveStorage.deleteSolves(puzzle, function(err, result) {
                    if(err) return alert('Could not delete synced solves: ' + err.message);
                    $solves.empty();
                  });
                },
                error: function(err) {
                  alert('Could not sync: ' + err.responseText);
                }
              });
            });
          }
        });
      });

      $puzzleDropdown.on('change', viewRecords);
      viewRecords();

      function viewRecords(event) {
        $solves.empty();
        $btnSync.prop('disabled', true);
        SolveStorage.getSolves($puzzleDropdown.val(), function(err, result) {
          if(err) return alert('Could not get solves: ' + err);
          for(var i = 0; i < result.rows.length; i++) {
            var row = result.rows[i];
            addSolveRow(row.id, row.duration, row.recorded_at);
          }
          $btnSync.prop('disabled', false);
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
              if(err) return alert('Could not delete solve: ' + err);
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
          if(err) return alert('Could not save solve: ' + err);
          addSolveRow(result.insertId, duration, endTime);
        });
      }
    });
  });
})(jQuery);
