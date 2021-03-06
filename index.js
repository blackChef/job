var _ = require('lodash');
var fetchAll = require('./fetchAll.js');
var express = require('express');
var compression = require('compression');

var app = express();

var server = app.listen(process.env.PORT || 5500, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
}).options('*', function(req, res, next) {
  res.end();
});
app.use(compression());
app.use(express.static('public'));


var goodjobs = require('./dataSrc/goodjobs.js');
var zhilian = require('./dataSrc/zhilian.js');
var n51job = require('./dataSrc/51job.js');
var lagou = require('./dataSrc/lagou.js');

var src = [
  goodjobs('前端', 'html5', 'javascript'),
  zhilian('前端'),
  n51job('前端', 'html5', 'javascript'),
  // lagou('前端', 'html5', 'javascript'),
];

app.get('/job', function(req, res) {
  var startTime = Date.now();

  fetchAll(src, function(err, result, newResult) {
    if (err) {
      console.log(err.stack);
      res.status(500).end();
      return;
    }

    console.log('\r');
    console.log(`=========result ${result.length}========`);
    console.log(`=========newResult ${newResult.length}========`);
    console.log(`=========finished in ${Date.now() - startTime}ms========`);
    console.log('\r');

    res.json({
      allResult: result,
      newResult: newResult
    });
  });
});
