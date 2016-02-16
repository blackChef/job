var src = `/job/`;


var defaultIgnoredCompanies = [
  '达内',
  '医院',
];

var localIgnoredCompanies = JSON.parse(localStorage.getItem('ignoredCompanies')) || [];

function isIgnoredCompany(companyName) {
  var ignoredCompanies = defaultIgnoredCompanies.concat(localIgnoredCompanies);
  return ignoredCompanies.some(function(item) {
    var r = new RegExp(item.replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
    return r.test(companyName);
  });
}

function ignoreCompany(keyword) {
  localIgnoredCompanies.push(keyword);
  localStorage.setItem('ignoredCompanies', JSON.stringify(localIgnoredCompanies));
}

document.documentElement.addEventListener('transitionend', function(event) {
  var target = event.target;
  if (target.matches('.jobList-item.hidden')) {
    target.remove();
  }
}, false);

document.documentElement.addEventListener('click', function(event) {
  var target = event.target;
  if (target.matches('.jobList-item-hideBtn')) {
    var companyName = target.closest('.list-item-right')
      .querySelector('.list-item-text-title')
      .innerHTML
      .trim();

    var msg = `确定要隐藏 ==${companyName}== 发布的信息吗?`;

    var confirmation = confirm(msg);
    if (confirmation) {
      ignoreCompany(companyName);
      target.closest('.jobList-item').classList.add('hidden');
    }
  }
}, false);



var ignoredTitles = [
  '设计',
  '初级',
  '营销',
  '游戏',
  '美工',
  '助理',
  '讲师',
  /实习|训/,
  /net/i,
  /app/i,
  /后台/i,
  /ios/i,
  /android/i,
  /java(?!script)/i,
  /php/i,
  /coco/i,
  /ic/i,
  /flex/i,
  '销售',
  '经理',
  '收银',
];

function isIgnoredTitle(title) {
  return ignoredTitles.some(function(item) {
    var r = new RegExp(item);
    return r.test(title);
  });
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}


function getNotes() {
  var ret = localStorage.getItem('notes') || '[]';
  return JSON.parse(ret);
}

function setNotes(newNotes) {
  localStorage.setItem('notes', JSON.stringify(newNotes));
}

document.documentElement.addEventListener('click', function(event) {
  var target = event.target;
  if (target.matches('.jobList-item-noteBtn')) {
    var companyName = target.closest('.list-item-right')
      .querySelector('.list-item-text-title')
      .innerHTML
      .trim();

    var notes = getNotes();
    var targetCompany = notes.find(function(item) {
      return item.companyName == companyName;
    });

    if (!targetCompany) {
      targetCompany = {
        companyName: companyName,
        note: ''
      };
      notes.push(targetCompany);
    }

    var newNote = prompt(`为 ==${companyName}== 添加备注`, targetCompany.note);

    if (newNote === null) {
      return;
    } else if (newNote.trim() === '') {
      _.remove(notes, function(item) {
        return item.companyName == companyName;
      });
      target.closest('.list-item-right')
        .querySelector('.jobList-item-note')
        .innerHTML = '';
    } else {
      targetCompany.note = newNote.trim();
      target.closest('.list-item-right')
        .querySelector('.jobList-item-note')
        .innerHTML = newNote;
    }

    setNotes(notes);
  }
}, false);



fetch(src)
  .then(checkStatus)
  .then(parseJSON)
  .then(
    function(res) {
      var curtVisitTime = Date.now();
      var lastVisitTime = localStorage.getItem('lastVisitTime') || curtVisitTime;
      localStorage.setItem('lastVisitTime', curtVisitTime);
      console.log(res.allResult.length);
      var allJobs = _.chain(res.allResult)
        .filter(function(item) {
          var isIgnored = isIgnoredCompany(item.companyName) || isIgnoredTitle(item.title);
          return !isIgnored;
        })
        .sort(function(a, b) {
          return b.fetchTime - a.fetchTime;
        })
        .map(function(item) {
          return Object.assign({}, item, {
            date: moment(item.fetchTime).format('YYYY年MM月DD日'),
            newSinceLastCheck: item.fetchTime > lastVisitTime
          });
        })
        .map(function(allJobsItem) {
          var notes = getNotes();
          var target = notes.find(function(notesItem) {
            return allJobsItem.companyName == notesItem.companyName;
          });

          var note = target? target.note : '';
          return Object.assign({}, allJobsItem, {
            note: note
          });
        })
        .groupBy('date')
        .reduce(function(preVal, value, key) {
          preVal.push({
            date: key,
            data: value
          });
          return preVal;
        }, [])
        .sort(function(a, b) {
          return b.date - a.date;
        })
        .value();


      var vm = {
        allJobs: allJobs,
        count: res.allResult.length
      };

      ko.applyBindings(vm);
      document.querySelector('.pageContent').classList.add('ready');
      document.querySelector('.splashScreen').classList.add('hidden');

    },
    function(err) {
      console.log(err);
      alert(JSON.stringify(err));
    });
