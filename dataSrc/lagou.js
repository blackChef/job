var request = require('request');
var _ = require('lodash');
var urlTool = require('url');
var Rx = require('rx');


var rxRequest = Rx.Observable.fromCallback(function(options, callback) {
  console.log(`start fetching: lagou frontEnd page${options.form.pn}`);
  request(options, function(err, res, body) {
    console.log(err);
    if (err) {
      callback(err);
    } else {
      body = JSON.parse(body.toString());

      console.log(`lagou code: ${body.code}`);

      if (body.code !== 0) {
        console.log(`lagou body: ${JSON.stringify(body)}`);
      }

      callback(body);
    }
  });
});

module.exports = function(callback) {
  var source = Rx.Observable.range(1, 10).flatMap(function(pageCount) {
    return rxRequest({
      method: 'POST',
      url: `http://www.lagou.com/jobs/positionAjax.json?px=new&city=%E5%90%88%E8%82%A5`,
      timeout: 100,
      form: {
        first: false,
        pn: pageCount,
        kd: '前端开发'
      }
    });
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
        console.log(`lagou next: ${ JSON.stringify(next) }`);
        callback(new Error('fetch lagou failed'), null);
      }
    },

    function(err) {
      if (err) {
        console.log(`lagou error: ${JSON.stringify(err)}`);
        callback(err, null);
      }
    },

    function() {
      callback(null, result);
    }
  );
};

