var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;

var movePoint = null;
var pointPlacing = true;

var depth = 0;

class Point {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    isInCircle(xClick, yClick, radius) {
        if (Math.sqrt(Math.pow(xClick - this.x, 2) + Math.pow(yClick - this.y, 2)) < radius) {
            return true;
        } else {
            return false;
        }
    }
}

points = []
struct = []

draw();

document.addEventListener('keydown', function(e) {
    var keycode = e.keyCode || e.which;

    if (keycode == 38) {
        drawNext();
    } else if (event.keyCode == 40) {
        drawLast();
    }

    console.log(depth)
});

function draw() {
    context.clearRect(0, 0, width, height);
    context.strokeStyle = '#4F5D75'

    // draw grid
    for (let i = 0; i < height; i += 50) {
        context.moveTo(0, i);
        context.lineTo(width, i);
    }

    for (let i = 0; i < width; i += 50) {
        context.moveTo(i, 0);
        context.lineTo(i, height);
    }

    context.stroke();


    // draw points and edges

    context.strokeStyle = '#BFC0C0'


    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2, false);
        context.closePath()

        context.strokeStyle = '#BFC0C0'
        context.stroke()
    }

    for (var i = 1; i < struct.length; i++) {
        context.moveTo(struct[i - 1].x, struct[i - 1].y);
        context.lineTo(struct[i].x, struct[i].y);
    }

    context.stroke()
}

canvas.addEventListener("mousedown", function(event) {
    for (var i = 0; i < points.length; i += 1) {
        var point = points[i];

        if (point.isInCircle(event.clientX, event.clientY, point.radius + 20)) {
            pointPlacing = false;
            canvas.addEventListener("mousemove", onMouseMove);
            canvas.addEventListener("mouseup", onMouseUp);
            movePoint = point;
        } else {
            pointPlacing = true;
        }
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (pointPlacing) {
        pointPlacing = false;
        let p = new Point(50 * Math.round(e.clientX / 50), 50 * Math.round(e.clientY / 50), 20);
        points.push(p)
        struct.push(p)
        draw()
    }
})

function onMouseMove(event) {
    movePoint.x = 50 * Math.round(event.clientX / 50);
    movePoint.y = 50 * Math.round(event.clientY / 50);

    struct = points;

    for (let i = 0; i < depth; i++) {
        calcNextStep();
    }

    draw();
}

function onMouseUp(event) {
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseup", onMouseUp);
    draw();
}

function reset() {
    struct = [];
    points = [];
    depth = 0;
}

function length(vec) {
    return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
}

function angle(vec1, vec2) {
    return Math.acos((vec1.x * vec2.x + vec1.y * vec2.y) / (length(vec1) * length(vec2)));
}

function rotateVec(vec, angle) {
    return new Point(vec.x * Math.cos(angle) - vec.y * Math.sin(angle), vec.y * Math.cos(angle) + vec.x * Math.sin(angle));
}

function calcNextStep() {
    // Distanze from first to last point for resizing
    var structLength = Math.sqrt(Math.pow(points[points.length - 1].x - points[0].x, 2) + Math.pow(points[points.length - 1].y - points[0].y, 2));

    // get angle of stucturs first to last point
    var unifiedAngleHor = angle(new Point(points[points.length - 1].x - points[0].x, points[points.length - 1].y - points[0].y), new Point(1, 0));
    var unifiedAngleVer = angle(new Point(points[points.length - 1].x - points[0].x, points[points.length - 1].y - points[0].y), new Point(0, 1));

    if (unifiedAngleVer > Math.PI / 2) unifiedAngle = -unifiedAngleHor;
    else unifiedAngle = unifiedAngleHor;

    // unify struct in size, position, and rotation
    var unifiedPointsList = []
    for (let k = 0; k < points.length; k++) {
        located = new Point(points[k].x - points[0].x, points[k].y - points[0].y)
        rot = rotateVec(located, -unifiedAngle);
        sized = new Point(rot.x / structLength, rot.y / structLength);
        unifiedPointsList.push(sized);
    }

    pointsList = []
    for (let i = 1; i < struct.length; i++) {

        scale = Math.sqrt(Math.pow(struct[i].x - struct[i - 1].x, 2) + Math.pow(struct[i].y - struct[i - 1].y, 2));
        angle_hor = angle(new Point(struct[i].x - struct[i - 1].x, struct[i].y - struct[i - 1].y), new Point(1, 0));
        angle_ver = angle(new Point(struct[i].x - struct[i - 1].x, struct[i].y - struct[i - 1].y), new Point(0, 1));

        if (angle_ver > Math.PI / 2) vec_angle = -angle_hor;
        else vec_angle = angle_hor;

        for (let k = 0; k < points.length; k++) {
            if (k == points.length - 1 && i != struct.length - 1) continue;
            sized = new Point(unifiedPointsList[k].x * scale, unifiedPointsList[k].y * scale);
            rotated = rotateVec(sized, vec_angle);
            located = new Point(rotated.x + struct[i - 1].x, rotated.y + struct[i - 1].y);
            pointsList.push(located);
        }
    }
    struct = pointsList;
}

function calcLastStep() {
    pointsList = [];

    for (let i = 0; i < struct.length; i += (points.length - 1)) {
        pointsList.push(struct[i]);
    }

    struct = pointsList;
}

function drawNext() {
    calcNextStep();
    depth++;
    draw();
}

function drawLast() {
    if (depth > 0) {
        calcLastStep();
        depth--;
        draw();
    }
}