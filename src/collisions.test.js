// test-collisions.test.js
import { describe, it, expect, beforeEach } from "vitest";
import Square from "./square.js";
import Circle from "./circle.js";
import Triangle from "./triangle.js";

describe("Collision Tests", () => {
  const canvasBounds = { width: 800, height: 600 };

  describe("Circle-Circle collision", () => {
    it("No collision", () => {
      const circle1 = new Circle(100, 100, 20, canvasBounds);
      const circle2 = new Circle(150, 100, 20, canvasBounds);
      expect(circle1.collidesWith(circle2)).toBe(false);
    });

    it("Touch", () => {
      const circle1 = new Circle(100, 100, 20, canvasBounds);
      const circle2 = new Circle(120, 100, 20, canvasBounds);
      expect(circle1.collidesWith(circle2)).toBe(true);
    });

    it("Intersection", () => {
      const circle1 = new Circle(100, 100, 20, canvasBounds);
      const circle2 = new Circle(120, 100, 20, canvasBounds);
      expect(circle1.collidesWith(circle2)).toBe(true);
    });

    it("Circle Inside", () => {
      const circle1 = new Circle(100, 100, 20, canvasBounds);
      const circle2 = new Circle(100, 100, 5, canvasBounds);
      expect(circle1.collidesWith(circle2)).toBe(true);
    });
  });

  describe("Circle-Square collision", () => {
    it("No collision", () => {
      const circle = new Circle(100, 100, 20, canvasBounds);
      const square = new Square(200, 200, 20, canvasBounds);
      expect(circle.collidesWith(square)).toBe(false);
    });

    it("Touch", () => {
      const circle = new Circle(100, 100, 20, canvasBounds);
      const square = new Square(120, 100, 20, canvasBounds);
      expect(circle.collidesWith(square)).toBe(true);
    });

    it("Intersection", () => {
      const circle = new Circle(100, 100, 20, canvasBounds);
      const square = new Square(120, 100, 20, canvasBounds);
      expect(circle.collidesWith(square)).toBe(true);
    });

    it("Square Inside Circle", () => {
      const circle = new Circle(100, 100, 20, canvasBounds);
      const square = new Square(100, 100, 5, canvasBounds);
      expect(circle.collidesWith(square)).toBe(true);
    });

    it("Circle Inside Square", () => {
      const circle = new Circle(100, 100, 5, canvasBounds);
      const square = new Square(100, 100, 20, canvasBounds);
      expect(circle.collidesWith(square)).toBe(true);
    });
  });

  describe("Circle-Triangle collision", () => {
    it("No collision", () => {
      const circle = new Circle(100, 100, 20, canvasBounds);
      const triangle = new Triangle(200, 200, 20, canvasBounds);
      expect(circle.collidesWith(triangle)).toBe(false);
    });

    it("Touch", () => {
      const circle = new Circle(100, 100, 20, canvasBounds);
      const triangle = new Triangle(120, 100, 20, canvasBounds);
      expect(circle.collidesWith(triangle)).toBe(true);
    });

    it("Intersection", () => {
      const circle = new Circle(100, 100, 20, canvasBounds);
      const triangle = new Triangle(120, 100, 20, canvasBounds);
      expect(circle.collidesWith(triangle)).toBe(true);
    });

    it("Triangle Inside Circle", () => {
      const circle = new Circle(100, 100, 20, canvasBounds);
      const triangle = new Triangle(100, 100, 5, canvasBounds);
      expect(circle.collidesWith(triangle)).toBe(true);
    });

    it("Circle Inside Triangle", () => {
      const circle = new Circle(100, 100, 5, canvasBounds);
      const triangle = new Triangle(100, 100, 20, canvasBounds);
      expect(circle.collidesWith(triangle)).toBe(true);
    });
  });

  describe("Square-Square collision", () => {
    it("No collision", () => {
      const square1 = new Square(100, 100, 20, canvasBounds);
      const square2 = new Square(200, 100, 20, canvasBounds);
      expect(square1.collidesWith(square2)).toBe(false);
    });

    it("Touch", () => {
      const square1 = new Square(100, 100, 20, canvasBounds);
      const square2 = new Square(120, 100, 20, canvasBounds);
      expect(square1.collidesWith(square2)).toBe(true);
    });

    it("Intersection", () => {
      const square1 = new Square(100, 100, 20, canvasBounds);
      const square2 = new Square(120, 100, 20, canvasBounds);
      expect(square1.collidesWith(square2)).toBe(true);
    });

    it("Square Inside Square", () => {
      const square1 = new Square(100, 100, 20, canvasBounds);
      const square2 = new Square(100, 100, 5, canvasBounds);
      expect(square1.collidesWith(square2)).toBe(true);
    });
  });

  describe("Square-Triangle collision", () => {
    it("No collision", () => {
      const square = new Square(100, 100, 20, canvasBounds);
      const triangle = new Triangle(200, 200, 20, canvasBounds);
      expect(square.collidesWith(triangle)).toBe(false);
    });

    it("Touch", () => {
      const square = new Square(100, 100, 20, canvasBounds);
      const triangle = new Triangle(120, 100, 20, canvasBounds);
      expect(square.collidesWith(triangle)).toBe(true);
    });

    it("Intersection", () => {
      const square = new Square(100, 100, 20, canvasBounds);
      const triangle = new Triangle(120, 100, 20, canvasBounds);
      expect(square.collidesWith(triangle)).toBe(true);
    });

    it("Triangle Inside Square", () => {
      const square = new Square(100, 100, 20, canvasBounds);
      const triangle = new Triangle(100, 100, 5, canvasBounds);
      expect(square.collidesWith(triangle)).toBe(true);
    });

    it("Square Inside Triangle", () => {
      const triangle = new Triangle(100, 100, 20, canvasBounds);
      const square = new Square(100, 100, 5, canvasBounds);
      expect(triangle.collidesWith(square)).toBe(true);
    });
  });

  describe("Triangle-Triangle collision", () => {
    it("No collision", () => {
      const triangle1 = new Triangle(100, 100, 20, canvasBounds);
      const triangle2 = new Triangle(200, 100, 20, canvasBounds);
      expect(triangle1.collidesWith(triangle2)).toBe(false);
    });

    it("Touch", () => {
      const triangle1 = new Triangle(100, 100, 20, canvasBounds);
      const triangle2 = new Triangle(120, 100, 20, canvasBounds);
      expect(triangle1.collidesWith(triangle2)).toBe(true);
    });

    it("Intersection", () => {
      const triangle1 = new Triangle(100, 100, 20, canvasBounds);
      const triangle2 = new Triangle(120, 100, 20, canvasBounds);
      expect(triangle1.collidesWith(triangle2)).toBe(true);
    });

    it("Triangle Inside Triangle", () => {
      const triangle1 = new Triangle(100, 100, 20, canvasBounds);
      const triangle2 = new Triangle(100, 100, 5, canvasBounds);
      expect(triangle1.collidesWith(triangle2)).toBe(true);
    });
  });

  describe("Canvas bounds collision", () => {
    describe("Circle-Canvas bounds", () => {
      it("Left wall bounce", () => {
        const circle = new Circle(-10, 300, 50, canvasBounds);
        circle.vx = -100;
        circle.update(16);
        expect(circle.vx).toBeGreaterThan(0);
      });

      it("Right wall bounce", () => {
        const circle = new Circle(820, 300, 50, canvasBounds);
        circle.vx = 100;
        circle.update(16);
        expect(circle.vx).toBeLessThan(0);
      });

      it("Top wall bounce", () => {
        const circle = new Circle(400, -10, 50, canvasBounds);
        circle.vy = -100;
        circle.update(16);
        expect(circle.vy).toBeGreaterThan(0);
      });

      it("Bottom wall bounce", () => {
        const circle = new Circle(400, 620, 50, canvasBounds);
        circle.vy = 100;
        circle.update(16);
        expect(circle.vy).toBeLessThan(0);
      });

      it("No bounce inside bounds", () => {
        const circle = new Circle(400, 300, 50, canvasBounds);
        circle.vx = 100;
        circle.vy = 100;
        const originalVx = circle.vx;
        const originalVy = circle.vy;
        circle.update(16);
        expect(circle.vx).toBe(originalVx);
        expect(circle.vy).toBe(originalVy);
      });
    });

    describe("Square-Canvas bounds", () => {
      it("Left wall bounce", () => {
        const square = new Square(-10, 300, 50, canvasBounds);
        square.vx = -100;
        square.update(16);
        expect(square.vx).toBeGreaterThan(0);
      });

      it("Right wall bounce", () => {
        const square = new Square(820, 300, 50, canvasBounds);
        square.vx = 100;
        square.update(16);
        expect(square.vx).toBeLessThan(0);
      });

      it("Corner bounce (left+top)", () => {
        const square = new Square(-10, -10, 50, canvasBounds);
        square.vx = -100;
        square.vy = -100;
        square.update(16);
        expect(square.vx).toBeGreaterThan(0);
        expect(square.vy).toBeGreaterThan(0);
      });
    });

    describe("Triangle-Canvas bounds", () => {
      it("Right wall bounce", () => {
        const triangle = new Triangle(820, 300, 50, canvasBounds);
        triangle.vx = 100;
        triangle.update(16);
        expect(triangle.vx).toBeLessThan(0);
      });

      it("Bottom wall bounce", () => {
        const triangle = new Triangle(400, 620, 50, canvasBounds);
        triangle.vy = 100;
        triangle.update(16);
        expect(triangle.vy).toBeLessThan(0);
      });
    });
  });
});
