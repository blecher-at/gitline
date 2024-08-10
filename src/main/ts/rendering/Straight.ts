import { BaseLink } from "./BaseLink";

	export class Straight extends BaseLink {

		constructor(canvas: any) {
			super(canvas, canvas.createLine());
		}

		public update() {
			super.update();
			this.element.setStartPointXY(this.parentDot.x, this.parentDot.y - this.parentDot.height / 2);
			this.element.setEndPointXY(this.childDot.x, this.childDot.y + this.childDot.height / 2);
		}

}