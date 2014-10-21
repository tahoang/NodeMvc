var fs = require('fs');

exports.readQuery = function(path, callback) {
  if (typeof path != 'undefined')
    fs.readFile(path, function(err, data) {
      if (err) {
        throw err;
      }
      callback.apply(this, arguments);
    });
  else {
    console.log('Error reading query: ' + path);
  }
}

exports.readQuerySync = function(path) {
  if (typeof path != 'undefined') {
    var data = fs.readFileSync(path);
    return data;
  }
  else {
    console.log('Error reading query: ' + path);
  }
  
}