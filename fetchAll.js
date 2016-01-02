var Rx = require('rx');
var _ = require('lodash');
var moment = require('moment');
var proxy = require('proxy-agent');
var AWS = require('aws-sdk');

if (process.env.ISLOCAL == 1) {
  console.log('use proxy');
  AWS.config.update({
    httpOptions: {
      agent: proxy('http://localhost:1080/')
    }
  });
}

var s3 = new AWS.S3();
var s3params = {
  'Bucket': 'blackchefjobs',
  'Key': 'allResult.json'
};

goodjobs = Rx.Observable.fromNodeCallback(require('./dataSrc/goodjobs.js'));
n51job = Rx.Observable.fromNodeCallback(require('./dataSrc/51job.js'));
zhilian = Rx.Observable.fromNodeCallback(require('./dataSrc/zhilian.js'));
lagou = Rx.Observable.fromNodeCallback(require('./dataSrc/lagou.js'));
goodjobsH5 = Rx.Observable.fromNodeCallback(require('./dataSrc/goodjobsH5.js'));
n51jobH5 = Rx.Observable.fromNodeCallback(require('./dataSrc/51jobH5.js'));
zhilianH5 = Rx.Observable.fromNodeCallback(require('./dataSrc/zhilianH5.js'));
lagouH5 = Rx.Observable.fromNodeCallback(require('./dataSrc/lagouH5.js'));



module.exports = function(callback) {

  var source = Rx.Observable.concat(
    lagou(),
    lagouH5(),
    goodjobs(), n51job(), zhilian()
  );

  var result = [];
  var subscription = source.subscribe(
    function(next) {
      result.push(next);
    },
    function(err) {
      if (err) {
        callback(err, null);
      }
    },
    function() {
      var now = Date.now();

      var latestResult = _.chain(result)
        .flatten()
        .uniq(item => item.companyName)
        .map(function(item) {
          return Object.assign({}, item, {
            fetchTime: now
          });
        })
        .value();

      s3.getObject(s3params, function(err, res) {
        if (err) {
          callback(err, null);
          return;
        }

        var allResult = JSON.parse(res.Body.toString());
        var newResult = latestResult.filter(function(item) {
          return !allResult.find(allResultItem => allResultItem.companyName == item.companyName);
        });

        allResult = allResult.concat(newResult);

        s3.putObject(
          Object.assign({}, s3params, {
            'Body': JSON.stringify(allResult)
          }),
          function(err, res) {
            if (err) {
              callback(err, null, null);
            } else {
              callback(null, allResult, newResult);
            }
          });
      });
    }
  );
};
