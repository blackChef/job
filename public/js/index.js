
var src = `/job/`;


var ignoreCompanies = [
  '中青中关村软件人才基地',
  '达内',
];

function isIgnoredCompany(companyName) {
  return ignoreCompanies.some(function(item) {
    var r = new RegExp(item);
    return r.test(companyName);
  });
}


fetch(src).then(res => res.json())
.then(function(res) {

  var allJobs = res.filter(function(item) {
    return !isIgnoredCompany(item.companyName);
  });

  var newJobs = allJobs.filter(function(item) {
    return item.newSinceYesterday;
  }).sort(function(a, b) {
    if (a.newSinceLastFetch === false && b.newSinceLastFetch === true) {
      return 1;
    } else if(a.newSinceYesterday === true && b.newSinceLastFetch === false) {
      return -1;
    } else {
      return 0;
    }
  });


  var vm = {
    newJobs: newJobs,
    allJobs: allJobs
  };

  ko.applyBindings(vm);
  document.querySelector('.pageMain').classList.add('ready');
});