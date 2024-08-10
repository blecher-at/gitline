import { BaseLink } from "./BaseLink";

	export class Curve extends BaseLink {

		private arrow;

		constructor(canvas: any) {
			super(canvas, canvas.createCurve());
			this.arrow = this.canvas.createPolygon();
		}

		public addElements() {
			super.addElements();

			// 2nd element
			this.canvas.addElement(this.arrow);
		}

		public update() {
			var x: number = this.childDot.x;
			var y: number = this.childDot.y;
			var parentX: number = this.parentDot.x;
			var parentY: number = this.parentDot.y;
			var color: string = this.lineColor;

			var direction = x < parentX ? 1 : -1;

			this.element.setStartPointXY(parentX, parentY - this.parentDot.height / 2)
			this.element.setEndPointXY(x + this.childDot.width / 2 * direction, y);
			this.element.setControl2PointXY(parentX, y);
			this.element.setControl1PointXY(parentX, y);

			this.element.getStroke().setWeight(1);
			this.element.getStroke().setColor(color);


			this.arrow.getStroke().setWeight(0);
			this.arrow.getFill().setColor(color);

			this.arrow.clearPoints();
			this.arrow.addPointXY(0, 0);
			this.arrow.addPointXY(6, -4);
			this.arrow.addPointXY(6, 4);

			// Move
			for (var i = 0; i < this.arrow.getPointsCount(); i++) {
				var px = this.arrow.getPointAt(i).X;
				var py = this.arrow.getPointAt(i).Y;
				//this.arrow.setPointXYAt(px, py + y, i);
				this.arrow.setPointXYAt(px * direction + x + this.childDot.width / 2 * direction, py + y, i);
			}
		}
	}