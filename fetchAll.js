var Rx = require('rx');
var _ = require('lodash');
var moment = require('moment');
var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'AKIAIOTIHNQIMIC6CPVQ',
  secretAccessKey: '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'
});

if (process.env.ISLOCAL == 1) {
  console.log('use proxy');
  var proxy = require('proxy-agent');
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


module.exports = function(src, callback) {
  var source = Rx.Observable.merge.apply(null, src)
    .reduce(function(preVal, curItem) {
      return preVal.concat(curItem);
    }, []);

  var subscription = source.subscribe(
    function(result) {
      var now = Date.now();

      var latestResult = _.chain(result)
        .uniq(item => item.companyName)
        .map(function(item) {
          return Object.assign({}, item, {
            fetchTime: now
          });
        })
        .value();

      s3.getObject(s3params, function(err, res) {
        if (err) {
          callback(err);
          return;
        }

        var allResult = JSON.parse(res.Body.toString());
        var newResult = latestResult.filter(function(item) {
          return !allResult.find(function(allResultItem) {
            return allResultItem.companyName == item.companyName;
          });
        });

        if (newResult.length > 0) {
          allResult = allResult.concat(newResult);

          s3.putObject(
            Object.assign({}, s3params, {
              'Body': JSON.stringify(allResult)
            }),
            function(err, res) {
              if (err) {
                console.log(`aws update json failed: ${err}`);
              }
            });
        }

        // dont wait for s3
        callback(null, allResult, newResult);
      });
    },

    function(err) {
      if (err) {
        callback(err);
      }
    },

    function() {
    }
  );
};
