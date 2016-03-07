var Rx = require('rx');
var _ = require('lodash');
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
      var order = [
        '拉钩网',
        '51job',
        '新安人才网',
      ];

      result = _.map(result, function(item) {
        return _.assign({}, item, {
          companyName: getCoreCompanyName(item.companyName),
          fetchTime: Date.now()
        });
      });

      var companyNames = _.chain(result)
        .map(function(item) {
          return item.companyName;
        })
        .uniq()
        .value();

      var latestResult = _.map(companyNames, function(companyName) {
        var ret;
        var i = 0;
        while (!ret && i > order.length) {
          ret = _.find(result, function(item) {
            return item.companyName == companyName && item.src == order[i];
          });
          i++;
        }

        if (!ret) {
          ret = _.find(result, function(item) {
            return item.companyName == companyName;
          });
        }

        return ret;
      });

      if (!fs.existsSync('./allResult.json')) {
        fs.outputJSONSync('./allResult.json', []);
      }

      var allResult = fs.readJSONSync('./allResult.json');
      var newResult = _.filter(latestResult, function(item) {
        return !_.find(allResult, function(allResultItem) {
          return allResultItem.companyName == item.companyName;
        });
      });

      if (newResult.length > 0) {
        allResult = allResult.concat(newResult);
        fs.outputJSONSync('./allResult.json', allResult);
      }

      callback(null, allResult, newResult);
    },

    function(err) {
      if (err) {
        callback(err);
      }
    },

    function() {}
  );
};
