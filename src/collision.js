const EPSILON = 1e-8;

const manifoldBuffer = {
    normal: { x: 1, y: 0 },
    depth: 0,
};

const projectionBufferA = { min: 0, max: 0 };
const projectionBufferB = { min: 0, max: 0 };

function getShapeType(figure) {
    return figure.getShapeType ? figure.getShapeType() : figure.type;
}

function setManifold(nx, ny, depth, ax, ay, bx, by) {
    const dirX = bx - ax;
    const dirY = by - ay;

    if (nx * dirX + ny * dirY < 0) {
        nx = -nx;
        ny = -ny;
    }

    manifoldBuffer.normal.x = nx;
    manifoldBuffer.normal.y = ny;
    manifoldBuffer.depth = depth;

    return manifoldBuffer;
}

function fillProjectionInterval(vertices, axisX, axisY, out) {
    let min = vertices[0].x * axisX + vertices[0].y * axisY;
    let max = min;

    for (let i = 1; i < vertices.length; i++) {
        const projection = vertices[i].x * axisX + vertices[i].y * axisY;
        if (projection < min) min = projection;
        if (projection > max) max = projection;
    }

    out.min = min;
    out.max = max;
}

function getOverlap(minA, maxA, minB, maxB) {
    return Math.min(maxA, maxB) - Math.max(minA, minB);
}

function testAxisPolygonPolygon(verticesA, verticesB, axisX, axisY) {
    fillProjectionInterval(verticesA, axisX, axisY, projectionBufferA);
    fillProjectionInterval(verticesB, axisX, axisY, projectionBufferB);

    return getOverlap(
        projectionBufferA.min,
        projectionBufferA.max,
        projectionBufferB.min,
        projectionBufferB.max,
    );
}

function satPolygons(figureA, figureB) {
    const verticesA = figureA.getWorldVertices();
    const verticesB = figureB.getWorldVertices();

    let minOverlap = Number.POSITIVE_INFINITY;
    let bestAxisX = 0;
    let bestAxisY = 0;

    for (let setIndex = 0; setIndex < 2; setIndex++) {
        const vertices = setIndex === 0 ? verticesA : verticesB;

        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];
            const edgeX = next.x - current.x;
            const edgeY = next.y - current.y;

            let axisX = -edgeY;
            let axisY = edgeX;
            const axisLength = Math.hypot(axisX, axisY);

            if (axisLength < EPSILON) {
                continue;
            }

            axisX /= axisLength;
            axisY /= axisLength;

            const overlap = testAxisPolygonPolygon(verticesA, verticesB, axisX, axisY);
            if (overlap < 0) {
                return null;
            }

            if (overlap < minOverlap) {
                minOverlap = overlap;
                bestAxisX = axisX;
                bestAxisY = axisY;
            }
        }
    }

    if (minOverlap === Number.POSITIVE_INFINITY) {
        return null;
    }

    return setManifold(
        bestAxisX,
        bestAxisY,
        minOverlap,
        figureA.x,
        figureA.y,
        figureB.x,
        figureB.y,
    );
}

function collideCircleCircle(circleA, circleB) {
    const dx = circleB.x - circleA.x;
    const dy = circleB.y - circleA.y;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = circleA.getRadius() + circleB.getRadius();
    const radiusSumSquared = radiusSum * radiusSum;

    if (distanceSquared > radiusSumSquared) {
        return null;
    }

    if (distanceSquared < EPSILON) {
        return setManifold(1, 0, radiusSum, circleA.x, circleA.y, circleB.x, circleB.y);
    }

    const distance = Math.sqrt(distanceSquared);

    return setManifold(
        dx / distance,
        dy / distance,
        radiusSum - distance,
        circleA.x,
        circleA.y,
        circleB.x,
        circleB.y,
    );
}

function testAxisCirclePolygon(circleX, circleY, circleRadius, vertices, axisX, axisY) {
    const circleProjection = circleX * axisX + circleY * axisY;
    const minCircle = circleProjection - circleRadius;
    const maxCircle = circleProjection + circleRadius;

    fillProjectionInterval(vertices, axisX, axisY, projectionBufferA);

    return getOverlap(
        minCircle,
        maxCircle,
        projectionBufferA.min,
        projectionBufferA.max,
    );
}

function collideCirclePolygon(circle, polygon, circleFirst) {
    const vertices = polygon.getWorldVertices();
    const circleX = circle.x;
    const circleY = circle.y;
    const circleRadius = circle.getRadius();

    let minOverlap = Number.POSITIVE_INFINITY;
    let bestAxisX = 0;
    let bestAxisY = 0;

    for (let i = 0; i < vertices.length; i++) {
        const current = vertices[i];
        const next = vertices[(i + 1) % vertices.length];
        const edgeX = next.x - current.x;
        const edgeY = next.y - current.y;

        let axisX = -edgeY;
        let axisY = edgeX;
        const axisLength = Math.hypot(axisX, axisY);

        if (axisLength < EPSILON) {
            continue;
        }

        axisX /= axisLength;
        axisY /= axisLength;

        const overlap = testAxisCirclePolygon(
            circleX,
            circleY,
            circleRadius,
            vertices,
            axisX,
            axisY,
        );

        if (overlap < 0) {
            return null;
        }

        if (overlap < minOverlap) {
            minOverlap = overlap;
            bestAxisX = axisX;
            bestAxisY = axisY;
        }
    }

    let closestX = vertices[0].x;
    let closestY = vertices[0].y;
    let bestDistanceSquared = Number.POSITIVE_INFINITY;

    for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i];
        const b = vertices[(i + 1) % vertices.length];
        const abX = b.x - a.x;
        const abY = b.y - a.y;
        const apX = circleX - a.x;
        const apY = circleY - a.y;
        const abLengthSquared = abX * abX + abY * abY;

        let t = 0;
        if (abLengthSquared > EPSILON) {
            t = (apX * abX + apY * abY) / abLengthSquared;
            if (t < 0) t = 0;
            if (t > 1) t = 1;
        }

        const candidateX = a.x + abX * t;
        const candidateY = a.y + abY * t;
        const dx = circleX - candidateX;
        const dy = circleY - candidateY;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < bestDistanceSquared) {
            bestDistanceSquared = distanceSquared;
            closestX = candidateX;
            closestY = candidateY;
        }
    }

    const extraAxisXRaw = closestX - circleX;
    const extraAxisYRaw = closestY - circleY;
    const extraAxisLength = Math.hypot(extraAxisXRaw, extraAxisYRaw);

    if (extraAxisLength > EPSILON) {
        const extraAxisX = extraAxisXRaw / extraAxisLength;
        const extraAxisY = extraAxisYRaw / extraAxisLength;
        const overlap = testAxisCirclePolygon(
            circleX,
            circleY,
            circleRadius,
            vertices,
            extraAxisX,
            extraAxisY,
        );

        if (overlap < 0) {
            return null;
        }

        if (overlap < minOverlap) {
            minOverlap = overlap;
            bestAxisX = extraAxisX;
            bestAxisY = extraAxisY;
        }
    }

    if (minOverlap === Number.POSITIVE_INFINITY) {
        return null;
    }

    const manifold = setManifold(
        bestAxisX,
        bestAxisY,
        minOverlap,
        circle.x,
        circle.y,
        polygon.x,
        polygon.y,
    );

    if (!circleFirst) {
        manifold.normal.x *= -1;
        manifold.normal.y *= -1;
    }

    return manifold;
}

export function detectCollision(figureA, figureB) {
    const typeA = getShapeType(figureA);
    const typeB = getShapeType(figureB);
    const isCircleA = typeA === "circle";
    const isCircleB = typeB === "circle";

    if (isCircleA && isCircleB) {
        return collideCircleCircle(figureA, figureB);
    }

    if (isCircleA && !isCircleB) {
        return collideCirclePolygon(figureA, figureB, true);
    }

    if (!isCircleA && isCircleB) {
        return collideCirclePolygon(figureB, figureA, false);
    }

    return satPolygons(figureA, figureB);
}
