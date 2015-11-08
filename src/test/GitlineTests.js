var path = require('path'),
  gitline = require('./helper/gitlineModule'),
  fs = require('fs'),
  chai = require('chai'),
  expect = chai.expect,
  aCommit;

describe('Gitline', function() {
  before(function() {
    this.data = JSON.parse(fs.readFileSync(path.join(__dirname, 'example02.json'), 'utf8'));
  });

  it('should be able to process git2json output', function() {
    var line = new gitline.Gitline(),
      that = this,
      commitList = [];
    line.data = this.data;

    // Mock the initialization sequence - note: this should be in gitline
    Object.keys(this.data).forEach(function(key) {
      var commit = new gitline.Commit(line, that.data[key]);
      line.addCommit(commit)
      commitList.push(commit);
    });

    commitList.forEach(function(commit) {
      commit.initRelations();
    });

    commitList.forEach(function(commit) {
      commit.initHeadSpecifity();
			commit.initMerges();
    });

    line.initBranches();

    aCommit = line.commits['ab275b54c60ae953a9a48b09e72f3b4a20265de8'];
    expect(aCommit.directparent.sha).to.equal('822428bc12c8eec7971a48970a397df4e1ff661e');
    expect(aCommit.branch.ref).to.equal('origin/feature/GL-20-invoker');
  });
});
