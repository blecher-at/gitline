/**
 * New typescript file
 */
/// <reference path="../CommitProvider.ts"/>
declare var jQuery: any;

class LocalGit2JsonProvider extends CommitProvider {
	
	public onRequested(url: string) {
		
		jQuery.getJSON(url, {}, (json) => {
			this.whenDone(json);
		}).error(function() {
			alert("Error loading git data from "+url+ " create it using git2json");
		});
	}
}