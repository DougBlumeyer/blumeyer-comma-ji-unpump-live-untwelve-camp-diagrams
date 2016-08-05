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

var mapOfIntervalIdByCentsToBaseHarmonicRatio = {
	"105": { harmonic: "17", basePowerOfTwo: -4 },
	"298": { harmonic: "19", basePowerOfTwo: -4 },
	"552": { harmonic: "11", basePowerOfTwo: -3 },
	"841": { harmonic: "13", basePowerOfTwo: -3 },
	"1095": { harmonic: "17", basePowerOfTwo: 5 },
	"902": { harmonic: "19", basePowerOfTwo: 5 },
	"648": { harmonic: "11", basePowerOfTwo: 4 },
	"359": { harmonic: "13", basePowerOfTwo: 4 },
	"104": { harmonic: "17", basePowerOfTwo: -4 },
	"297": { harmonic: "19", basePowerOfTwo: -4 },
	"551": { harmonic: "11", basePowerOfTwo: -3 },
	"840": { harmonic: "13", basePowerOfTwo: -3 },
	"1096": { harmonic: "17", basePowerOfTwo: 5 },
	"903": { harmonic: "19", basePowerOfTwo: 5 },
	"649": { harmonic: "11", basePowerOfTwo: 4 },
	"360": { harmonic: "13", basePowerOfTwo: 4 }
}

function mapCentsToInterval(pitchDifference, octaveDifference) {
	var baseHarmonicRatio = mapOfIntervalIdByCentsToBaseHarmonicRatio[pitchDifference];
	if (!baseHarmonicRatio) return false;

	baseHarmonicRatio.basePowerOfTwo += octaveDifference;
	var powerOfTwo = Math.pow(2, Math.abs(baseHarmonicRatio.basePowerOfTwo));

	if (baseHarmonicRatio.basePowerOfTwo > 0) {
		return baseHarmonicRatio.harmonic + "/" + powerOfTwo.toString();
	} else {
		return powerOfTwo.toString() + "/" + baseHarmonicRatio.harmonic;
	}
}

function drawDiagram(pitchId, otherVoices) {
	var pitch = pitchIdToCentsMap[pitchId.class];
	drawPoint(pitch, POINT_SIZE);
	var drew = false;
	Object.keys(otherVoices).forEach(function(otherVoice) {
		var otherPitchObj = otherVoices[otherVoice];
		var otherPitch = pitchIdToCentsMap[otherPitchObj.class];
		var pitchDifference = otherPitch - pitch;
		var octaveDifference = otherPitchObj.octave - pitchId.octave;
		var intervalLabel = mapCentsToInterval(pitchDifference, octaveDifference);
		if (intervalLabel) {
			drew = true;
			drawIntervalLabel(otherPitch, intervalLabel);
			drawQuadrant(otherPitch, voiceQuadrants[otherVoice])
			drawLine(pitch, otherPitch);
			drawPoint(otherPitch, OTHER_POINT_SIZE);
		}
	});

	return drew;
}

function drawLine(pitch, otherPitch) {
	var point = getPoint(pitch, CIRCLE_RADIUS);
	var otherPoint = getPoint(otherPitch, CIRCLE_RADIUS);

	ctx.moveTo(point.x, point.y);
	ctx.lineTo(otherPoint.x, otherPoint.y);
	ctx.stroke();
}

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

function parse(rawSongCsv) {
	var output = [];
	rawSongCsv.forEach(function(moment) {
		var newMoment = {
			lead: {
				class: moment[0][0],
				octave: moment[0][1]
			},
			harm1: {
				class: moment[1][0],
				octave: moment[1][1]
			},
			harm2: {
				class: moment[2][0],
				octave: moment[2][1]
			},
			bass: {
				class: moment[3][0],
				octave: moment[3][1]
			}
		};
		output.push(newMoment);
	});
	return output;
}

getFileObject('song.csv', function (fileObject) {
		var input = fileObject;
		var config = {
			complete: function(results) {
				var parsedResults = parse(results.data);
				processSong(parsedResults, parsedResults.length, 0);
			}
		};
		Papa.parse(input, config);
});

function processSong(parsedResults, songLength, beatIndex) {
	var beat = parsedResults[beatIndex];
	processVoices(beat, beatIndex, songLength, parsedResults, 0); 
}

function processVoices(beat, beatIndex, songLength, parsedResults, voiceIndex) {
	var voiceName = voiceNames[voiceIndex];
	var voice = beat[voiceName];
	var otherVoices = JSON.parse(JSON.stringify(beat));
	delete otherVoices[voiceName];
	reset();
	var shouldSave = drawDiagram(voice, otherVoices);
	if (shouldSave) {
		canvas.toBlob(function(blob) {
			saveAs(blob, voiceName + "." + beatName(beatIndex) + ".png");
			process(voiceIndex, beat, beatIndex, songLength, parsedResults);
		});
	} else {
		process(voiceIndex, beat, beatIndex, songLength, parsedResults);
	}
}

function process(voiceIndex, beat, beatIndex, songLength, parsedResults) {
	if (voiceIndex < voiceNames.length - 1) {
		processVoices(beat, beatIndex, songLength, parsedResults, voiceIndex + 1)
	} else if (beatIndex < songLength - 1) {
		processSong(parsedResults, songLength, beatIndex + 1)
	}
}