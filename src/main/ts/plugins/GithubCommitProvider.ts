///<reference path="../CommitProvider.ts"/>
///<reference path="../typedefs/jquery.d.ts"/>
///<reference path="../typedefs/moment-node.d.ts"/>
///<reference path="../typedefs/moment.d.ts"/>

declare var Logger: any;

module Gitline.Plugin.Github {
	export interface Branch {
		name: string;
		repo: string;
		assigned: boolean;
		commit: Commit;
	}

	export interface Fork {
		url: string;
		name: string;
		data: any;
		full_name: string;
	}

	export interface Commit {
		sha: string;
	}
}

module Gitline.Plugin {
	import Github = Gitline.Plugin.Github;

	/**
	 * GitHub commit provider. only works if there is and accesstoken configured in the browser
	 */
	export class GithubCommitProvider extends Gitline.CommitProvider {

		private forks: Github.Fork[] = [];
		private baseBranches: Github.Branch[] = [];
		private data: {} = {};

		private limit: number;
		private accessToken: string;

		public constructor(url: string, limit: number, accessToken: string) {
			super(url);
			this.accessToken = accessToken;
			this.limit = limit;
		}

		public gitURL(url: string, api: string, params: string = "") {

			// convert to api url and remove trailing /
			if (url.indexOf("api.github.com") == -1) {
				url = url.replace(/.*github.com/, "https://api.github.com/repos/").replace(/\/\//g, "/");

			}
			return url + "/" + api + "?access_token=" + this.accessToken + "&per_page=" + this.limit + "&callback=?&" + params;
		}

		public onRequested(url: string) {
			this.loadForks(url);
		}

		public loadForks(url: string) {
			jQuery.getJSON(this.gitURL(url, "forks")).done((forks) => {
				if (forks.data.message !== undefined) {
					this.error("Github API: " + forks.data.message);
					return;
				}

				jQuery.getJSON(this.gitURL(url, "branches")).done((branches) => {
					this.processBranches(url, branches.data);
					this.forks = forks.data;

					this.loadBranches();
				})
			});
		}

		public processBranches(fork, data: Github.Branch[]) {
			data.forEach(branch => {
				branch.repo = fork.url !== undefined ? fork.url : fork;
				if (fork.full_name !== undefined) {
					branch.name = branch.name + "@" + fork.full_name;
				}
				this.baseBranches.push(branch);
			});
		}

		public loadBranches() {
			var forkRequests = this.forks.map(fork => {
				return jQuery.getJSON(this.gitURL(fork.url, "branches"), data => {
					Logger.debug("loaded branches for " + fork.name);
					this.processBranches(fork, data.data);
				})
			});
			jQuery.when.apply(jQuery, forkRequests).done(() => {
				Logger.debug("all branches loaded");
				this.loadCommits();
			});
		}

		public loadCommits() {
			var commitRequests = [];
			this.baseBranches.forEach(b => {
				var commit = this.data[b.commit.sha];
				if (commit == undefined) {
					commitRequests.push(
						jQuery.getJSON(this.gitURL(b.repo, "commits", "sha=" + b.commit.sha), data => {
							Logger.debug("loaded commits for " + b.name);
							this.processCommits(data.data);
						}));
				}
			});

			jQuery.when.apply(jQuery, commitRequests).done(() => {
				this.process();
			});
		}

		public processCommits(data) {
			data.map(data => {
				var c: any = {};
				c.sha = data.sha;
				c.ssha = data.sha.substring(0, 8);
				c.parenthashes = (<any[]> data.parents).map(x => {
					return x.sha
				});
				c.authorname = data.commit.author.name;
				c.authoremail = data.commit.author.email;
				c.authordate = moment(data.commit.author.date).unix();
				c.authortimestamp = new Date(data.commit.author.date).getTime();

				c.committername = data.commit.committer.name;
				c.committeremail = data.commit.committer.email;
				c.committerdate = moment(data.commit.committer.date).unix();
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
				if (commit == undefined) {
					// commit missing for branch - TODO: fetch it
				} else {
					b.assigned = true;
					commit.refnames.push(b.name);
					this.assignHeads(commit);
				}
			});

			// Sort
			var newdata = {};
			Object.keys(this.data).sort((a, b) => {
				return this.data[b].committertimestamp - this.data[a].committertimestamp;
			}).forEach(sha => {
				newdata[sha] = this.data[sha];
			});


			this.whenDone(newdata);
		}

		private assignHeads(commit) {
			commit.parents1 = commit.parenthashes.map(x => {
				return x
			}); // copy array

			while (commit.parents1.length > 0) {
				var newParents = [];
				commit.parents1.forEach(parentHash => {
					var p = this.data[parentHash];
					if (p != undefined) {
						p.inHeads.push(commit.sha);
						// add all grandparents to the newparents
						p.parenthashes.forEach(h => {
							if (newParents.indexOf(h) === -1) {
								newParents.push(h);
							}
						})
					}
				});
				commit.parents1 = newParents
			}
		}
	}
}
