var canvas = document.getElementById("canvas");

var windowWidth = window.innerWidth * .95;
var windowHeight = window.innerHeight * .95;

canvas.width  = windowWidth;
canvas.height = windowHeight;

var circleCenterX = windowWidth / 2;
var circleCenterY = windowHeight / 2;

var ctx = canvas.getContext("2d");

var r = Math.min(windowWidth, windowHeight) / 2.5;

var pi = Math.PI;

var pointSize = 4;

function drawMainCircle() {
	ctx.beginPath();
	ctx.arc(circleCenterX, circleCenterY, r, 0, 2 * pi);
	ctx.stroke();
}

function drawPoint(pitch) {
	var point = getPoint(pitch);
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointSize, 0, 2 * pi);
    ctx.fill();
}

function getPoint(pitch) {
	var angle = mapCentsToRadians(pitch);
   	return {
   		x: circleCenterX + r * Math.cos(angle),
   		y: circleCenterY + r * Math.sin(angle)
   	};
}

function mapCentsToRadians(cents) {
	return cents / 1200 * 2 * pi;
}

var pitchIdToCentsMap = {
	j: 1138,
	n: 954,
	i: 945,
	h: 849,
	c: 841,
	g: 656,
	p: 594,
	r: 587,
	b: 551,
	m: 489,
	k: 402,
	e: 298,
	l: 297,
	f: 192,
	d: 105,
	o: 43,
	q: 8,
	a: 0
};

function drawDiagram(pitchId, otherPitchIds) {
	var pitch = pitchIdToCentsMap[pitchId];
	var otherPitches = otherPitchIds.map(function(otherPitchId) {
		return pitchIdToCentsMap[otherPitchId];
	});

	drawPoint(pitch);
	otherPitches.forEach(function(otherPitch) {
		drawLine(pitch, otherPitch);
		drawPoint(otherPitch);
	});
}

function drawLine(pitch, otherPitch) {
	var point = getPoint(pitch);
	var otherPoint = getPoint(otherPitch);

	ctx.moveTo(point.x, point.y);
	ctx.lineTo(otherPoint.x, otherPoint.y);
	ctx.stroke();
}

drawMainCircle();
drawDiagram("o", ["a", "b", "c"]);

canvas.toBlob(function(blob) {
    saveAs(blob, "whatever.png");
});
