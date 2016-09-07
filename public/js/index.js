let src = `/job/`;


let defaultIgnoredCompanies = [
  '达内',
  '医院',
];

let localIgnoredCompanies = JSON.parse(localStorage.getItem('ignoredCompanies')) || [];

function isIgnoredCompany(companyName) {
  let ignoredCompanies = defaultIgnoredCompanies.concat(localIgnoredCompanies);
  return ignoredCompanies.some(function(item) {
    let r = new RegExp(item.replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
    return r.test(companyName);
  });
}

function ignoreCompany(keyword) {
  localIgnoredCompanies.push(keyword);
  localStorage.setItem('ignoredCompanies', JSON.stringify(localIgnoredCompanies));
}

document.documentElement.addEventListener('transitionend', function(event) {
  let target = event.target;
  if (target.matches('.jobList-item.hidden')) {
    target.remove();
  }
}, false);

document.documentElement.addEventListener('click', function(event) {
  let target = event.target;
  if (target.matches('.jobList-item-hideBtn')) {
    let companyName = target.closest('.list-item-right')
      .querySelector('.list-item-text-title')
      .innerHTML
      .trim();

    let msg = `确定要隐藏 ==${companyName}== 发布的信息吗?`;

    let confirmation = confirm(msg);
    if (confirmation) {
      ignoreCompany(companyName);
      target.closest('.jobList-item').classList.add('hidden');
    }
  }
}, false);



let ignoredTitles = [
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
    let r = new RegExp(item);
    return r.test(title);
  });
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}


function getNotes() {
  let ret = localStorage.getItem('notes') || '[]';
  return JSON.parse(ret);
}

function setNotes(newNotes) {
  localStorage.setItem('notes', JSON.stringify(newNotes));
}

document.documentElement.addEventListener('click', function(event) {
  let target = event.target;
  if (target.matches('.jobList-item-noteBtn')) {
    let companyName = target.closest('.list-item-right')
      .querySelector('.list-item-text-title')
      .innerHTML
      .trim();

    let notes = getNotes();
    let targetCompany = notes.find(function(item) {
      return item.companyName == companyName;
    });

    if (!targetCompany) {
      targetCompany = {
        companyName: companyName,
        note: ''
      };
      notes.push(targetCompany);
    }

    let newNote = prompt(`为 ==${companyName}== 添加备注`, targetCompany.note);

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
      let curtVisitTime = Date.now();
      let lastVisitTime = localStorage.getItem('lastVisitTime') || curtVisitTime;
      localStorage.setItem('lastVisitTime', curtVisitTime);

      console.log(res.allResult.length);

      let allJobs = _.chain(res.allResult)
        .filter(function(item) {
          let isIgnored = isIgnoredCompany(item.companyName) || isIgnoredTitle(item.title);
          return !isIgnored;
        })
        .sort(function(a, b) {
          return b.fetchTime - a.fetchTime;
        })
        .map(function(item) {
          let ret = item;

          if (item.location === undefined) {
            ret = _.assign({}, item, { location: '' });
          }

          ret = _.assign({}, ret, {
            date: moment(ret.fetchTime).format('YYYY/MM/DD'),
            newSinceLastCheck: ret.fetchTime > lastVisitTime,
          })

          return ret;
        })
        .map(function(allJobsItem) {
          let notes = getNotes();
          let target = notes.find(function(notesItem) {
            return allJobsItem.companyName == notesItem.companyName;
          });

          let note = target? target.note : '';
          return _.assign({}, allJobsItem, {
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
          return b.date.replace(/\//g, '') - a.date.replace(/\//g, '');
        })
        .value();


      let vm = {
        allJobs: allJobs,
        count: res.allResult.length
      };

      ko.applyBindings(vm);
      document.querySelector('.pageContent').classList.add('ready');
      document.querySelector('.splashScreen').classList.add('hidden');

    },
    function(err) {
      console.log(err);
      // alert(JSON.stringify(err));
    });
