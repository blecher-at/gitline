var git2json = require('git2json'),
  gitline = require('./gitlineModule'),
	util = require('util');
git2json.run(function(commits) {
	var gitlineMock = {};
	Object.keys(commits).forEach(function(sha) {
		var currentCommit = new gitline.Commit(gitlineMock, commits[sha]);
		console.log(util.inspect(currentCommit));
	});
});
