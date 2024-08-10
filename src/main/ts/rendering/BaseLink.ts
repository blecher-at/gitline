import { Dot } from "./Dot";
import { Shape } from "./Shape";

	/**
	 * Shape that links two dots
	 */
	export class BaseLink extends Shape {

		parentDot: Dot;
		childDot: Dot;

		lineColor: string;

		constructor(canvas: any, element: any) {
			super(canvas, element);
		}

		public from(from: Dot): BaseLink {
			this.dependsOn(from);
			this.parentDot = from;
			return this;
		}

		public to(to: Dot): BaseLink {
			//this.dependsOn(to);
			this.childDot = to;
			return this;
		}

		public color(lineColor: string): BaseLink {
			this.element.getStroke().setWeight(1);
			this.element.getStroke().setColor(lineColor);
			this.lineColor = lineColor;
			this.addIfMissing();
			return this;
		}
	}