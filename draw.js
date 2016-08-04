var canvas = document.getElementById("canvas");

var windowWidth = 250;
var windowHeight = 250;

canvas.width  = windowWidth;
canvas.height = windowHeight;

var circleCenter = {
	x: windowWidth / 2,
	y: windowHeight / 2
};

var ctx = canvas.getContext("2d");
ctx.font = "16px Georgia";
ctx.textAlign = "center";

var r = 50;

var pi = Math.PI;
QUADRANT_SYMBOL_SIZE = 8;

CIRCLE_RADIUS = 1;
LABEL_RADIUS = 1.5;
QUADRANT_RADIUS = 2.1;
POINT_SIZE = 8;
OTHER_POINT_SIZE = 4;

var voiceColors = {
	"lead": "red",
	"harm1": "blue",
	"harm2": "green",
	"bass": "brown"
}

var voiceQuadrants = {
	"lead" : 1,
	"harm1": 2,
	"harm2": 3,
	"bass": 4
}

function drawMainCircle() {
	ctx.beginPath();
	ctx.arc(circleCenter.x, circleCenter.y, r, 0, 2 * pi);
	ctx.stroke();
}

function drawPoint(pitch, size) {
	var point = getPoint(pitch, CIRCLE_RADIUS);
  ctx.beginPath();
  ctx.arc(point.x, point.y, size, 0, 2 * pi);
  ctx.fill();
}

function drawIntervalLabel(pitch, intervalLabel) {
	var textPoint = getPoint(pitch, LABEL_RADIUS);
	ctx.fillText(intervalLabel, textPoint.x, textPoint.y + 5);
}

function getPoint(pitch, radiusScalar) {
	var angle = mapCentsToRadians(pitch);
  return {
   	x: circleCenter.x + r * Math.cos(angle) * radiusScalar,
   	y: circleCenter.y + r * Math.sin(angle) * radiusScalar
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

function drawDiagram(pitchId, otherVoices) {
	var pitch = pitchIdToCentsMap[pitchId.class] + pitchId.octave * 1200;
	drawPoint(pitch, POINT_SIZE);

	Object.keys(otherVoices).forEach(function(otherVoice) {
		var otherPitchObj = otherVoices[otherVoice];
		var otherPitch = pitchIdToCentsMap[otherPitchObj.class] + otherPitchObj.octave * 1200;
		var pitchDifference = otherPitch - pitch;
		var pitchDifferenceAsString = pitchDifference.toString();
		var intervalLabel = mapOfCentsToInterval[pitchDifferenceAsString];
		if (intervalLabel) {
			drawIntervalLabel(otherPitch, intervalLabel);
			drawQuadrant(otherPitch, voiceQuadrants[otherVoice])
			drawLine(pitch, otherPitch);
			drawPoint(otherPitch, OTHER_POINT_SIZE);
		}
	});
}

function drawLine(pitch, otherPitch) {
	var point = getPoint(pitch, CIRCLE_RADIUS);
	var otherPoint = getPoint(otherPitch, CIRCLE_RADIUS);

	ctx.moveTo(point.x, point.y);
	ctx.lineTo(otherPoint.x, otherPoint.y);
	ctx.stroke();
}

var song = [
	{
		lead: {
			class: "o",
			octave: 3
		},
		harm1: {
			class: "i",
			octave: 3
		},
		harm2: {
			class: "j",
			octave: 3
		},
		bass: {
			class: "k",
			octave: 3
		}
	}
];

var voiceNames = [
	"lead",
	"harm1",
	"harm2",
	"bass"
];

function reset() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "black";
	ctx.fillStyle = "black";
	drawMainCircle();
}

song.forEach(function(beat, beatIndex) {
	voiceNames.forEach(function(voiceName) {
		var voice = beat[voiceName];
		var otherVoices = JSON.parse(JSON.stringify(beat));
		delete otherVoices[voiceName];

		reset();

		drawDiagram(voice, otherVoices);
		canvas.toBlob(function(blob) {
		  saveAs(blob, voiceName + "." + beatName(beatIndex) + ".png");
		});
	})
});

function beatName(beatIndex) {
	var measureNumber = 1 + Math.floor(beatIndex / 4);
	var beatNumber = 1 + beatIndex % 4;
	return measureNumber + "." + beatNumber;
}

function drawQuadrant(pitch, which) {
	var quadrantPoint = getPoint(pitch, QUADRANT_RADIUS);
	var quarterCircle = .5 * pi;
	var quadrant = which * quarterCircle;

	ctx.beginPath();
	ctx.arc(quadrantPoint.x, quadrantPoint.y, QUADRANT_SYMBOL_SIZE, 0, 2 * pi);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(quadrantPoint.x, quadrantPoint.y);
	ctx.arc(quadrantPoint.x, quadrantPoint.y, QUADRANT_SYMBOL_SIZE, quadrant, quadrant + quarterCircle);
	ctx.closePath();
	ctx.fill();
}
