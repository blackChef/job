##Getting start
node index 启动服务。访问 http://localhost:5000/ 使用应用。

##背景介绍
我希望知道每天都有哪些公司发布新的招聘广告。但是招聘网站现有的模式是谁刷新谁就排在列表前面，而且并不是每个公司都会在所有招聘网站上打广告。所以我每天都需要花很多时间一个网站一个网站的翻页看，浪费时间。

##功能介绍

###服务端
应用会抓取51job，智联，拉钩，新安人才网（安徽本地招聘网站）的招聘信息。
每一次请求，都会重新抓取。抓取结果先按公司名称去重，再与之前的抓取结果对比，找出新的部分。打上此次抓取的时间戳，保存在本地文件（allResult.json）里。

###前端
前端拿到结果后，以时间轴的方式展现。前端可以对条目进行隐藏和添加备注操作。还可以通过修改代码的方式添加关键字，隐藏条目。

##How to
- 如何修改搜索关键字：在 index.js 里直接修改 src。
- 如何修改城市：在 dataSrc/网站名.js 里修改 options.urlTpl 这一项。
- 如何修改关键字过滤：在 public/index.js 里修改 ignoredTitles。

##已知问题
- 配置需要修改代码，前端没有修改的地方。
- 前端进行隐藏、备注的操作结果以 localStorage 的形式保存在浏览器里，没有存到服务端。
