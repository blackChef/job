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

function getCoreCompanyName(name) {
  return name
    .replace(/^(安徽省?|合肥市?|北京|上海|深圳|南京|杭州|广州|浙江)/, '')
    .replace(/(网络|软件|信息|科技|技术|电子商务).*$/, '')
    .replace(/(股份)?有限公司.*$/, '')
    .replace(/集团.*$/, '')
    .replace(/(安徽|合肥)分公司.*$/, '');
}

module.exports = function(src, callback) {
  var source = Rx.Observable.concat.apply(null, src)
    .reduce(function(preVal, curItem) {
      return preVal.concat(curItem);
    }, []);

  var subscription = source.subscribe(
    function(result) {
      var now = Date.now();

      var latestResult = _.chain(result)
        .map(function(item) {
          return Object.assign({}, item, {
            companyName: getCoreCompanyName(item.companyName)
          });
        })
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

    function() {}
  );
};
