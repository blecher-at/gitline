var git2json = require("git2json");
git2json._default(function(commits) {
	console.log("%s", JSON.stringify(commits, null, 2));
 });

