var canvas = document.getElementById("canvas");

var windowWidth = 300;
var windowHeight = 300;

canvas.width  = windowWidth;
canvas.height = windowHeight;

var circleCenterX = windowWidth / 2;
var circleCenterY = windowHeight / 2;

var ctx = canvas.getContext("2d");
ctx.font="18px Georgia";
ctx.textAlign="center";

var r = 100;

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

function drawIntervalLabel(pitch, intervalLabel) {
	var textPoint = getPoint(pitch, 1.3);
	ctx.fillText(intervalLabel, textPoint.x, textPoint.y + 9);
}

function getPoint(pitch, scale = 1) {
	var angle = mapCentsToRadians(pitch);
  return {
   	x: circleCenterX + r * Math.cos(angle - .3) * scale,
   	y: circleCenterY + r * Math.sin(angle - .3) * scale
  };
}

function mapCentsToRadians(cents) {
	return cents / 1200 * 2 * pi;
}

var pitchIdToCentsMap = {
	"j": 1138,
	"n": 954,
	"i": 945,
	"h": 849,
	"c": 841,
	"g": 656,
	"p": 594,
	"r": 587,
	"b": 551,
	"m": 489,
	"k": 402,
	"e": 298,
	"l": 297,
	"f": 192,
	"d": 105,
	"o": 43,
	"q": 8,
	"a": 0
};

var mapOfCentsToInterval = {
	"105": "17/16",
	"298": "19/16",
	"551": "11/8",
	"841": "13/8",
	"-105": "16/17",
	"-298": "16/19",
	"-551": "8/11",
	"-841": "8/13",
	"-1095": "17/32",
	"-902": "19/32",
	"-649": "11/16",
	"-359": "13/16",
	"1095": "32/17",
	"902": "32/19",
	"649": "16/11",
	"359": "16/13",
	"104": "17/16",
	"297": "19/16",
	"552": "11/8",
	"840": "13/8",
	"-104": "16/17",
	"-297": "16/19",
	"-552": "8/11",
	"-840": "8/13",
	"-1096": "17/32",
	"-903": "19/32",
	"-648": "11/16",
	"-360": "13/16",
	"1096": "32/17",
	"903": "32/19",
	"648": "16/11",
	"360": "16/13"
}

function drawDiagram(pitchId, otherPitchIds) {
	var pitch = pitchIdToCentsMap[pitchId];
	var otherPitches = otherPitchIds.map(function(otherPitchId) {
		return pitchIdToCentsMap[otherPitchId];
	});

	drawPoint(pitch);
	otherPitches.forEach(function(otherPitch) {
		var pitchDifference = otherPitch - pitch;
		var pitchDifferenceAsString = pitchDifference.toString();
		var intervalLabel = mapOfCentsToInterval[pitchDifferenceAsString];

		if (intervalLabel) {
			drawIntervalLabel(otherPitch, intervalLabel);
			drawLine(pitch, otherPitch);
			drawPoint(otherPitch);
		}
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
drawDiagram("o", ["i", "j", "k"]);

canvas.toBlob(function(blob) {
  saveAs(blob, "whatever.png");
});
