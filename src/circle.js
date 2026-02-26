import Figure from "./figure.js";

export default class Circle extends Figure {
  constructor(x, y, size, canvasBounds) {
    super(x, y, size, canvasBounds);
    this.size = Number(size);
    this.radius = this.size / 2;
    this.type = "circle";
  }

  update(dt) {
    const t = dt / 1000;
    this.x += this.vx * t;
    this.y += this.vy * t;

    this.fillBounds(this._boundsBuffer);
    this.applyBoundsResponse(this._boundsBuffer);

    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#f87171";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  getRadius() {
    return this.radius;
  }

  fillBounds(out) {
    out.left = this.x - this.radius;
    out.right = this.x + this.radius;
    out.top = this.y - this.radius;
    out.bottom = this.y + this.radius;
  }
}

