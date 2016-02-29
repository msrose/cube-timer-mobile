window.SolveUtils = (function() {
  'use strict';

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
    return pad(mins, 2) +
      ':' + pad(secs, 2) +
      '.' + pad(subsecs, 3);
  }

  var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  function formatDate(date) {
    var dateStr = months[date.getMonth() - 1] +
      ' ' + date.getDate() +
      ', ' + date.getFullYear();
    var timeStr = pad(date.getHours(), 2) +
      ':' + pad(date.getMinutes(), 2) +
      ':' + pad(date.getSeconds(), 2);
    return dateStr + ' ' + timeStr;
  }

  return {
    formatDate: formatDate,
    formatTime: formatTime,
    pad: pad
  };
})();
