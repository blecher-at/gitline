///<reference path="typedefs/cryptojs.d.ts"/>

declare var jsgl: any;
declare var Logger: any;

module Gitline {
	export function indexToX(index: number): number {
		return index * 20 + 12;
	}

	export class Config {
		public dotHeight = 6;
		public dotWidth = 8;

		public remoteOnly: boolean = false;

		private avatar_gravatar(email) {
			return "http://www.gravatar.com/avatar/" + CryptoJS.MD5(email.toLowerCase()) + "?s=18&d=mm";
		}

		public avatars: Function[] = [this.avatar_gravatar];
	}
}