import { Commit } from "./Commit";
import { Config } from "./Config";
import { Creation } from "./rendering/Creation";
import { Curve } from "./rendering/Curve";
import { Dot } from "./rendering/Dot";
import { Shape } from "./rendering/Shape";
import { Straight } from "./rendering/Straight";

	/**
	 * View of the Commit
	 */
	export class CommitView {

		public commit: Commit;
		public label: HTMLElement;
		public canvas: any; // jsgl
		public config: Config;

		public dot: Dot;
		public lines: Shape[] = [];

		constructor(canvas, config: Config, commit: Commit) {
			this.canvas = canvas;
			this.config = config;
			this.commit = commit;

			this.dot = new Dot(this.canvas);
		}

		public addRelations() {

			// Direct parent
			if (this.commit.directparent != null) {
				var dpl: Shape;
				if (this.commit.getLane() == this.commit.directparent.getLane() || this.commit.directparent.outOfScope) {
					// direct parent is the same X/lane, this means it is a standard forward commit
					dpl = new Straight(this.canvas).from(this.commit.directparent.view.dot).to(this.dot).color(this.commit.getColor(20));
				} else {
					// direct parent is on a different lane, this is most certainly a new branch
					dpl = new Creation(this.canvas).from(this.commit.directparent.view.dot).to(this.dot).color(this.commit.getColor(30));
				}

				this.lines.push(dpl);
			}

			var allmerges = this.commit.merges.standard.concat(this.commit.merges.anonymous);
			allmerges.forEach(merge => {
				this.lines.push(
					new Curve(this.canvas)
						.from(merge.source.view.dot)
						.to(this.dot)
						.color(merge.source.getColor(35)))
				;
			});
		}

		/** calculate the positions based on model and update the shapes */
		public redraw() {
			this.dot
				.at(this.commit.getX(), this.commit.getY())
				.size(this.config.dotWidth, this.config.dotHeight)
				.color(this.commit.getColor(20), this.commit.getColor(80));
		}


	}