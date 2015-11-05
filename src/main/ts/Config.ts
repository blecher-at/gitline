/// <reference path="Branch.ts"/>
/// <reference path="Commit.ts"/>
/// <reference path="Gitline.ts"/>
/* globals */
declare var jsgl: any;

function indexToX(index) {
	return index *20 + 12;
}
	
class GitlineConfig {
	public dotHeight = 6;
	public dotWidth = 8;
	
	public dotRadiusY = this.dotHeight / 2;
	public dotRadiusX = this.dotWidth / 2;

	public remoteOnly: boolean = false;
}