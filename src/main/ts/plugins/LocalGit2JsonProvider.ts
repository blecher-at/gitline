/**
 * New typescript file
 */
/// <reference path="../CommitProvider.ts"/>
/// <reference path="../Gitline.ts"/>
declare var jQuery: any;
declare var Logger: any;

class LocalGit2JsonProvider extends CommitProvider {
	
	public onRequested(url: string) {
		
		jQuery.getJSON(url, {}, (json) => {
			this.whenDone(json);
		}).error(() =>  {
			this.error("Error loading git data from "+url+ " create it using git2json");
		});
	}
}