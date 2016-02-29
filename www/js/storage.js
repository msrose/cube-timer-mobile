window.SolveStorage = (function() {
  'use strict';

  var db = {};

  db.open = function(callback) {
    db.conn = openDatabase('Solves', '', 'Record of solves', 5 * 1024 * 1024);
    var query = 'CREATE TABLE IF NOT EXISTS solves (id INTEGER PRIMARY KEY, puzzle, duration, recorded_at)';
    executeSql(query, [], callback);
  };

  db.addSolve = function(puzzle, duration, recordedAt, callback) {
    var query = 'INSERT INTO solves (puzzle, duration, recorded_at) VALUES (?, ?, ?)';
    var params = [puzzle, duration, recordedAt];
    executeSql(query, params, callback);
  };

  db.getSolves = function(puzzle, callback) {
    var query = 'SELECT * FROM solves WHERE puzzle = ? ORDER BY recorded_at DESC';
    executeSql(query, [puzzle], callback);
  };

  db.deleteSolve = function(id, callback) {
    var query = 'DELETE FROM solves WHERE id = ?';
    executeSql(query, [id], callback);
  };

  db.deleteSolves = function(puzzle, callback) {
    var query = 'DELETE FROM solves WHERE puzzle = ?';
    executeSql(query, [puzzle], callback);
  };

  function executeSql(query, params, callback) {
    if(!db.conn) return callback(new Error('No connection made'));
    db.conn.transaction(function(t) {
      t.executeSql(query, params, function(t, r) {
        callback(null, r);
      }, callback);
    });
  }

  return db;
})();
