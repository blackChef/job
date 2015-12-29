var Rx = require('rx');
var _ = require('lodash');
var fs = require('fs-extra');
var moment = require('moment');


goodjobs = Rx.Observable.fromNodeCallback(require('./goodjobs.js'));
n51job = Rx.Observable.fromNodeCallback(require('./51job.js'));
zhilian = Rx.Observable.fromNodeCallback(require('./zhilian.js'));
lagou = Rx.Observable.fromNodeCallback(require('./lagou.js'));
goodjobsH5 = Rx.Observable.fromNodeCallback(require('./goodjobsH5.js'));
n51jobH5 = Rx.Observable.fromNodeCallback(require('./51jobH5.js'));
zhilianH5 = Rx.Observable.fromNodeCallback(require('./zhilianH5.js'));
lagouH5 = Rx.Observable.fromNodeCallback(require('./lagouH5.js'));

var source = Rx.Observable.concat(
              lagou(), lagouH5(),
              goodjobs(), n51job(), zhilian(),
              goodjobsH5(), n51jobH5(), zhilianH5()
             );




module.exports = function(callback) {
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
      if ( !fs.existsSync('./lastResult.json') ) {
        fs.outputJsonSync('./lastResult.json', []);
      }

      if ( !fs.existsSync('./yesterdayResult.json') ) {
        fs.outputJsonSync('./yesterdayResult.json', []);
      }

      latestResult = _.chain(result).flatten().uniq(item => item.companyName).value();

      var todayTime = moment().format('YYYYMMDD');
      var whenIsTodayResultFetched = fs.readJsonSync('./whenIsTodayResultFetched.json').time;

      if (todayTime != whenIsTodayResultFetched) {
        fs.outputJsonSync('./yesterdayResult.json', fs.readJsonSync('./lastResult.json'));
        fs.outputJsonSync('./whenIsTodayResultFetched.json', { time: todayTime });
      }

      callback(null, latestResult);
      fs.outputJsonSync('./lastResult.json', latestResult);
    }
  );
};
