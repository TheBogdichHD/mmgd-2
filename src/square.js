import Figure from "./figure.js";

export default class Square extends Figure {
  constructor(x, y, size, canvasBounds) {
    super(x, y, size, canvasBounds);
    this.size = size;
    this.halfSize = size / 2;
    this.type = "square";
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = "#3b82f6";
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;

    ctx.fillRect(-this.halfSize, -this.halfSize, this.size, this.size);
    ctx.strokeRect(-this.halfSize, -this.halfSize, this.size, this.size);

    ctx.restore();
  }

  getRadius() {
    return this.halfSize;
  }

  getBounds() {
    return {
      left: this.x - this.halfSize,
      right: this.x + this.halfSize,
      top: this.y - this.halfSize,
      bottom: this.y + this.halfSize,
    };
  }
}
