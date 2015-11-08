/**
 * New typescript file
 */
/// <reference path="../CommitProvider.ts"/>
declare var jQuery: any;
	
class GithubCommitProvider extends CommitProvider {

	private forks: string[];
	private baseCommits: {};
	private baseBranches: {};
		

	public gitURL(base: string, api: string) {
		var accessToken: string = "c24e3056fa94b95d43a618f9518a8dcaf51feb5c"; // TODO: REMOVE !!!!!
		var limit = 500;

		// convert to api url and remove trailing /
		var apiBaseURL:string = base.replace(/.*github.com/, "https://api.github.com/repos/").replace(/\/\//g, "/");
		return apiBaseURL + "/"+api+"?access_token="+accessToken+"&perpage="+limit+"&callback=?";
	}

	public onRequested(url: string) {
		jQuery.when(
			jQuery.getJSON(this.gitURL(url, "forks")),
			jQuery.getJSON(this.gitURL(url, "commits")),
			jQuery.getJSON(this.gitURL(url, "branches"))
		).then( (forks, commits, branches) => {
			this.baseCommits = commits[0].data;
			this.baseBranches = branches[0].data;
			this.forks = forks[0].data;
			
			//this.forkURLS = forks.map(fork => {return fork.url});
			this.process();
		});
	}

	public process() {
		console.log(this);
		// TODO:this.whenDone(data);
	}
}