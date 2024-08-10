import { hash } from "spark-md5";

declare var jsgl: any;


export function indexToX(index: number): number {
	return index * 20 + 12;
}

export class Config {
	public dotHeight = 6;
	public dotWidth = 8;

	public remoteOnly: boolean = false;

	// https://docs.gravatar.com/general/images/
	private avatar_gravatar(email: string) {
		return "https://www.gravatar.com/avatar/" + hash(email.toLowerCase()) + "?s=20&d=retro";
	}

	public avatars: Function[] = [this.avatar_gravatar];
}