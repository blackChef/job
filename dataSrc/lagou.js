var request = require('request');
var _ = require('lodash');
var urlTool = require('url');
var Rx = require('rx');


var rxRequest = Rx.Observable.fromCallback(function(options, callback) {
  console.log(`start fetching: lagou frontEnd page${options.form.pn}`);
  request(options, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    body = JSON.parse(body.toString());
    callback(body);
  });
});

module.exports = function(callback) {
  var source = Rx.Observable.range(1, 3).flatMap(function(pageCount) {
    return rxRequest({
      method: 'POST',
      url: `http://www.lagou.com/jobs/positionAjax.json?px=new&city=%E5%90%88%E8%82%A5`,
      timeout: 10000,
      form: {
        first: false,
        pn: pageCount,
        kd: '前端开发'
      }
    }).retry(3);
  });

  var result = [];
  var subscription = source.subscribe(
    function(next) {
      var content = next.content;
      if (content) {
        content.result.forEach(function(item) {
          result.push({
            companyName: item.companyName,
            salary: item.salary,
            link: `http://www.lagou.com/jobs/${item.positionId}.html`,
            src: `拉钩网`,
            title: item.positionName
          });
        });
      } else {
        console.log(next);
        callback(new Error('fetch lagou failed'), null);
      }
    },

    function(err) {
      if (err) {
        callback(err, null);
      }
    },

    function() {
      callback(null, result);
    }
  );
};

