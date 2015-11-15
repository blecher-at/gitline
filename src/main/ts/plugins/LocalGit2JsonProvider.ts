///<reference path="../CommitProvider.ts"/>
///<reference path="../Main.ts"/>

declare var jQuery: any;

module Gitline.Plugin {
	export class LocalGit2JsonProvider extends Gitline.CommitProvider {

		public onRequested(url: string) {
			jQuery.getJSON(url, {}, (json) => {
				this.whenDone(json);
			}).error(function () {
				Gitline.Main.displayFatalError("Error loading git data from " + url + " create it using git2json");
			});
		}
	}
}