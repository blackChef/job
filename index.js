var _ = require('lodash');
var fetchAll = require('./fetchAll.js');
var express = require('express');
var compression = require('compression');

var app = express();

var server = app.listen(process.env.PORT || 5000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


app.use(compression());
app.use(express.static('public'));
// app.use(function(req, res, next){
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//     next();
// }).options('*', function(req, res, next){
//     res.end();
// });


app.get('/job', function(req, res) {

  fetchAll(function(err, result, newResult) {
    if (err) {
      res.status(500).end(err);
      return;
    }

    console.log(`=========result ${result.length}========`);
    console.log(`=========newResult ${newResult.length}========`);
    console.log('\r\n');

    res.json({
      allResult: result,
      newResult: newResult
    });

    console.log('finish request');
  });

});










