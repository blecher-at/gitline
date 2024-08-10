import { CommitProvider } from "../CommitProvider";
	
	export class LocalGit2JsonProvider extends CommitProvider {

		public onRequested = (url: string) =>
			fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}).then((response) => {
				if (response.ok) {
				  return response.json();
				}
				throw new Error('Response wasn\'t OK when fetching JSON');
			})
			.then((responseJson) => {
				this.whenDone(responseJson);
			})
			.catch(() => {
				this.error("Error loading git data from " + url + " create it using git2json");
			});
	}