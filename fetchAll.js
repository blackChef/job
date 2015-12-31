var Rx = require('rx');
var _ = require('lodash');
var fs = require('fs-extra');
var moment = require('moment');


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
                lagou(), lagouH5(),
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
                            return Object.assign({}, item, { fetchTime: now });
                          }).value();

      if ( !fs.existsSync('./allResult.json') ) {
        fs.outputJsonSync('./allResult.json', latestResult);
      }

      var allResult = fs.readJsonSync('./allResult.json');
      var newResult = latestResult.filter(function(item) {
        return !allResult.find(allResultItem => allResultItem.companyName == item.companyName);
      });

      allResult = allResult.concat(newResult);
      callback(null, allResult, newResult);
      fs.outputJsonSync('./allResult.json', allResult);
    }
  );
};
