/**
 * New typescript file
 */
/// <reference path="../CommitProvider.ts"/>
declare var jQuery: any;
	
class GithubCommitProvider extends CommitProvider {

	private forks: any[] = [];
	private baseCommits: any[];
	private baseBranches: any[] = [];
	private data : {} = {};
		
	private limit;
	private accessToken: string;
	private done: boolean = false;
	
	public obtainAccessToken(callback: Function) {
		if(window.localStorage) {
			this.accessToken = window.localStorage.getItem("github-accesstoken");
			this.limit = 500;
		}

		if(this.accessToken == null) {
			window.alert("No access token to github defined. see log");
			console.log('window.localStorage.setItem("github-accesstoken", "TOKEN")');
		} else {
			callback();
		}
	}

	public gitURL(url: string, api: string, params: string = "") {

		// convert to api url and remove trailing /
		if(url.indexOf("api.github.com") == -1) {
			url = url.replace(/.*github.com/, "https://api.github.com/repos/").replace(/\/\//g, "/");
				
		}
		return url + "/"+api+"?access_token="+this.accessToken+"&per_page="+this.limit+"&callback=?&"+params;
	}

	public onRequested(url: string) {
		this.obtainAccessToken(() => {
			this.loadForks(url)
		});
	}
	
	public loadForks(url: string) {
		jQuery.when(
				jQuery.getJSON(this.gitURL(url, "forks")),
				//jQuery.getJSON(this.gitURL(url, "commits")),
				jQuery.getJSON(this.gitURL(url, "branches"))
			).then( (forks, branches) => {
				//this.baseCommits = commits[0].data;
				this.processBranches(url, branches[0].data);
				this.forks = forks[0].data;
				
				this.loadBranches();
			});
		
	}

	public processBranches(fork, data) {
		data.forEach(branch => {
			branch.repo = fork;
			if(fork.full_name !== undefined) {
				branch.name = branch.name + "@" + fork.full_name;
			}
			this.baseBranches.push(branch);
		});
	}
	
	public loadBranches() {
		var forkRequests = this.forks.map(fork => {return jQuery.getJSON(this.gitURL(fork.url, "branches"), data => {
				this.processBranches(fork, data.data);
		})});
		jQuery.when(forkRequests).then(() => {
			this.loadCommits();
		});
	}
	
	public loadCommits() {
		var commitRequests = [];
		this.baseBranches.forEach(b => {
			var commit = this.data[b.commit.sha];
			if(commit == undefined) {
				commitRequests.push(
					jQuery.getJSON(this.gitURL(b.repo, "commits", "sha="+b.commit.sha), data => {
						this.processCommits(data.data);
					}));
			}
		});
		
		jQuery.when(commitRequests).then((req) => {
			this.done = true;
			console.log("DONE: ", req);
			window.setTimeout( () => {
				// all is loaded, we are done
				this.process();
			}, 1000);
		});
	}
	
	public processCommits(data) {
		data.map(data => {
			var c:any = {};
			c.sha = data.sha;
			c.ssha = data.sha.substring(0,8);
			c.parenthashes = (<any[]> data.parents).map(x => { return x.sha});			
			c.authorname = data.commit.author.name;
			c.authoremail = data.commit.author.email;
			c.authordate = data.commit.author.date;
			c.authortimestamp = new Date(data.commit.author.date).getTime();
			
			c.committername = data.commit.committer.name;
			c.committeremail = data.commit.committer.email;
			c.committerdate = data.commit.committer.date;
			c.committertimestamp = new Date(data.commit.committer.date).getTime();
	
			c.subject = data.commit.message;
			c.body = ""; // Todo: where to get this?
			c.refnames = []; // set when parsing branches
			c.inHeads = []; // set when parsing branches
			
			return c;
		}).forEach(commit => {
			this.data[commit.sha] = commit;
		});
		
	}
	

	public process() {
		this.baseBranches.forEach(b => {
			var commit = this.data[b.commit.sha];
			if(commit == undefined) {
				// commit missing for branch - TODO: fetch it
			} else {
				b.assigned = true;
				commit.refnames.push(b.name);
				this.assignHeads(this.data, commit);
			}
		});
		
		// Sort
		var newdata = {};
		Object.keys(this.data).sort((a,b) => {
			return this.data[b].committertimestamp - this.data[a].committertimestamp;
		}).forEach(sha => {
			newdata[sha] = this.data[sha];
		});
		
		
		this.whenDone(newdata);
	}
	
	private assignHeads(data:{}, commit) {
		var parents1 = commit.parenthashes.slice(0) // copy array
	
		while(parents1.length > 0) {
			var newParents = []
			parents1.forEach(function(parentHash) {
				var p = data[parentHash]	
				if(p != undefined) {
					p.inHeads.push(commit.sha)
					// add all grandparents to the newparents
					newParents = newParents.concat(p.parenthashes)
				}
			});
			parents1 = newParents
		}
	}

	/* 
	"22f095ab15ca98b73bd1e8dcc655665e4e7f29c7": {
    "sha": "22f095ab15ca98b73bd1e8dcc655665e4e7f29c7",
    "ssha": "22f095a",
    "parenthashes": [
      "e0e19b2cd906147a9ca1b8cda8f367314cbdcdcb",
      "a9379190a399d2144a1b94684f557df4e2f8ee44"
    ],
    "authorname": "Junio C Hamano",
    "authoremail": "gitster@pobox.com",
    "authordate": "1446764220",
    "committername": "Junio C Hamano",
    "committeremail": "gitster@pobox.com",
    "committerdate": "1446764220",
    "encoding": "",
    "subject": "Merge branch 'fp/subtree-todo-update' into pu",
    "ssubject": "Merge-branch-fp-subtree-todo-update-into-pu",
    "body": "* fp/subtree-todo-update:\n  contrib/subtree: remove \"push\" command from the \"todo\" file\n",
    "refnames": [
      "origin/pu"
    ],
    "parents": [],
    "children": [],
    "inHeads": [],
    "index": 0
  },
  "a9379190a399d2144a1b94684f557df4e2f8ee44": {
	
	*/
}