window.SolveStorage = (function() {
  var db = {};

  db.open = function(callback) {
    db.conn = openDatabase('Solves', '', 'Record of solves', 5 * 1024 * 1024);
    db.conn.transaction(function(t) {
      t.executeSql('CREATE TABLE IF NOT EXISTS solves (puzzle, duration, recorded_at)', [], function(t, r) {
        callback(null, r);
      }, callback);
    });
  };

  db.addSolve = function(puzzle, duration, recordedAt, callback) {
    if(!db.conn) return callback(new Error('No connection made'));
    db.conn.transaction(function(t) {
      t.executeSql('INSERT INTO solves (puzzle, duration, recorded_at) VALUES (?, ?, ?)', [puzzle, duration, recordedAt], function(t, r) {
        callback(null, r);
      }, callback);
    })
  };

  db.getSolves = function(puzzle, callback) {
    if(!db.conn) return callback(new Error('No connection made'));
    db.conn.transaction(function(t) {
      db.conn.transaction(function(t) {
        t.executeSql('SELECT * FROM solves WHERE puzzle = ?', [puzzle], function(t, r) {
          callback(null, r);
        }, callback);
      })
    });
  };

  return db;
})();
