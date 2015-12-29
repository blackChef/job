var _ = require('lodash');
var fetchAll = require('./fetchAll.js');
var fs = require('fs-extra');
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
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
}).options('*', function(req, res, next){
    res.end();
});


app.get('/job', function(req, res) {

  fetchAll(function(err, latestResult) {
    if (err) {
      res.status(500).end(err);
      return;
    }

    var lastResult = fs.readJsonSync('./lastResult.json');
    var yesterdayResult = fs.readJsonSync('./yesterdayResult.json');

    ret = latestResult.map(function(item) {
      return Object.assign({}, item, {
        newSinceLastFetch: !_.find(lastResult, function(lastResultItem) {
          return lastResultItem.companyName == item.companyName;
        }),

        newSinceYesterday: !_.find(yesterdayResult, function(lastResultItem) {
          return lastResultItem.companyName == item.companyName;
        })
      });
    });

    res.json(ret);
  });

});










