let _ = require('lodash');
let fetchAll = require('./fetchAll.js');
let express = require('express');
let compression = require('compression');

let app = express();

let server = app.listen(process.env.PORT || 5000, function() {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://', host, port);
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


let goodjobs = require('./dataSrc/goodjobs.js');
let zhilian = require('./dataSrc/zhilian.js');
let n51job = require('./dataSrc/51job.js');

let src = [
  // goodjobs('%C7%B0%B6%CB', 'html5', 'javascript'), // gbk
  // zhilian('前端'),
  n51job('前端'),
];

app.get('/job', function(req, res) {
  let startTime = Date.now();

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
