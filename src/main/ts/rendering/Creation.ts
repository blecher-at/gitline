import { BaseLink } from "./BaseLink";

declare var jsgl: any;
	export class Creation extends BaseLink {

		secondLine;

		constructor(canvas: any) {
			super(canvas, canvas.createLine());
			this.secondLine = canvas.createLine();
		}

		public addElements() {
			super.addElements();

			// 2nd element
			this.canvas.addElement(this.secondLine); // TODO: add later?
		}

		public update() {
			super.update();

			// Horizontal dotted line
			if (this.parentDot.x < this.childDot.x) {
				this.element.setStartPointXY(this.parentDot.x + this.parentDot.width / 2, this.parentDot.y)
			} else {
				this.element.setStartPointXY(this.parentDot.x - this.parentDot.width / 2, this.parentDot.y)
			}

			this.element.setEndPointXY(this.childDot.x, this.parentDot.y);
			this.element.getStroke().setWeight(1);
			this.element.getStroke().setDashStyle(jsgl.DashStyles.DASH);
			this.element.getStroke().setColor(this.lineColor);

			// Vertical line
			this.secondLine.setStartPointXY(this.childDot.x, this.parentDot.y)
			this.secondLine.setEndPointXY(this.childDot.x, this.childDot.y + this.childDot.height / 2);
			this.secondLine.getStroke().setWeight(1)
			this.secondLine.getStroke().setColor(this.lineColor);
		}
	}