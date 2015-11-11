/// <reference path="Branch.ts"/>
/// <reference path="Commit.ts"/>
/// <reference path="Gitline.ts"/>
/* globals */
declare var jsgl: any;
declare var CryptoJS: any;
declare var Logger: any;

function indexToX(index) {
	return index *20 + 12;
}

class GitlineConfig {
	public dotHeight = 6;
	public dotWidth = 8;

	public remoteOnly: boolean = false;

	private avatar_gravatar (email) {
		return "http://www.gravatar.com/avatar/"+CryptoJS.MD5(email.toLowerCase())+"?s=16&d=404";
	}

	public avatars : Function[] = [this.avatar_gravatar];
}
