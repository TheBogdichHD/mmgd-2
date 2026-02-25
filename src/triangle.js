import Figure from "./figure.js";

export default class Triangle extends Figure {
  constructor(x, y, size, canvasBounds) {
    super(x, y, size, canvasBounds);
    this.size = size / 2;
    this.type = "triangle";
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const h = (Math.sqrt(3) / 2) * this.size * 2;

    ctx.fillStyle = "#10b981";
    ctx.strokeStyle = "#047857";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, (-h / 3) * 2);
    ctx.lineTo(-this.size, h / 3);
    ctx.lineTo(this.size, h / 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  getRadius() {
    return this.size;
  }

  getBounds() {
    const h = (Math.sqrt(3) / 2) * this.size * 2;
    return {
      left: this.x - this.size,
      right: this.x + this.size,
      top: this.y - (h / 3) * 2,
      bottom: this.y + h / 3,
    };
  }
}
