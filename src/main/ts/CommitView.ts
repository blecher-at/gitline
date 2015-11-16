///<reference path="rendering/Curve.ts"/>
///<reference path="rendering/Straight.ts"/>
///<reference path="rendering/Creation.ts"/>
///<reference path="rendering/Dot.ts"/>
///<reference path="Config.ts"/>
///<reference path="Commit.ts"/>
///<reference path="rendering/Shape.ts"/>

module Gitline {

	/**
	 * View of the Commit
	 */
	export class CommitView {

		public commit: Commit;
		public label: HTMLElement;
		public canvas: any; // jsgl
		public config: Config;

		public dot: Rendering.Dot;
		public lines: Rendering.Shape[] = [];

		constructor(canvas, config: Config, commit: Commit) {
			this.canvas = canvas;
			this.config = config;
			this.commit = commit;

			this.dot = new Rendering.Dot(this.canvas);
		}

		public addRelations() {

			// Direct parent
			if (this.commit.directparent != null) {
				var dpl: Rendering.Shape;
				if (this.commit.getLane() == this.commit.directparent.getLane() || this.commit.directparent.outOfScope) {
					// direct parent is the same X/lane, this means it is a standard forward commit
					dpl = new Rendering.Straight(this.canvas).from(this.commit.directparent.view.dot).to(this.dot).color(this.commit.getColor(20));
				} else {
					// direct parent is on a different lane, this is most certainly a new branch
					dpl = new Rendering.Creation(this.canvas).from(this.commit.directparent.view.dot).to(this.dot).color(this.commit.getColor(30));
				}

				this.lines.push(dpl);
			}

			var allmerges = this.commit.merges.standard.concat(this.commit.merges.anonymous);
			allmerges.forEach(merge => {
				this.lines.push(
					new Rendering.Curve(this.canvas)
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
}