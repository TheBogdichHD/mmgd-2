import Figure from "./figure.js";

export default class Circle extends Figure {
  constructor(x, y, size, canvasBounds) {
    super(x, y, size, canvasBounds);
    this.radius = size / 2;
    this.type = "circle";
  }

  update(dt) {
    const t = dt / 1000;
    this.x += this.vx * t;
    this.y += this.vy * t;

    const bounds = this.getBounds();
    if (bounds.left < 0 || bounds.right > this.canvasBounds.width) {
      this.vx *= -1;
    }
    if (bounds.top < 0 || bounds.bottom > this.canvasBounds.height) {
      this.vy *= -1;
    }

    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#f87171";
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  getRadius() {
    return this.radius;
  }

  getBounds() {
    return {
      left: this.x - this.radius,
      right: this.x + this.radius,
      top: this.y - this.radius,
      bottom: this.y + this.radius,
    };
  }
}
