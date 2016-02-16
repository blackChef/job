var Rx = require('rx');
var _ = require('lodash');
var moment = require('moment');
var fs = require('fs-extra');

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
      var allResult = fs.readJSONSync('./allResult.json');
      var newResult = latestResult.filter(function(item) {
        return !allResult.find(function(allResultItem) {
          return allResultItem.companyName == item.companyName;
        });
      });

      if (newResult.length > 0) {
        allResult = allResult.concat(newResult);
        fs.outputJSONSync('./allResult.json', allResult);
        callback(null, allResult, newResult);
      }
    },

    function(err) {
      if (err) {
        callback(err);
      }
    },

    function() {}
  );
};
