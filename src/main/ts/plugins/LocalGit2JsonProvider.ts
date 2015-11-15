///<reference path="../CommitProvider.ts"/>
///<reference path="../Main.ts"/>
///<reference path="../typedefs/jquery.d.ts"/>

module Gitline.Plugin {
	export class LocalGit2JsonProvider extends Gitline.CommitProvider {

		public onRequested(url: string) {
			var xhr = jQuery.getJSON(url, {});

			xhr.done((json) => {
				this.whenDone(json);
			});

			xhr.fail(() => {
				Gitline.Main.displayFatalError("Error loading git data from " + url + " create it using git2json");
			});
		}
	}
}