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
ctx.lineWidth = 1;

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
};

var voiceQuadrants = {
	"lead" : 1,
	"harm1": 2,
	"harm2": 3,
	"bass": 4
};

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

function drawMainCircle() {
	ctx.beginPath();
	ctx.arc(circleCenter.x, circleCenter.y, r, 0, 2 * pi);
	ctx.stroke();

	Object.keys(pitchIdToCentsMap).forEach(function(pitchId) {
		drawPoint(pitchIdToCentsMap[pitchId], 2);
	});
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
		x: circleCenter.x + r * Math.cos(angle + pi) * radiusScalar,
		y: circleCenter.y + r * Math.sin(angle + pi) * radiusScalar
	};
}

function mapCentsToRadians(cents) {
	return cents / 1200 * 2 * pi;
}

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
	"360": { harmonic: "13", basePowerOfTwo: 4 },
	"0": { harmonic: "1", basePowerOfTwo: 0 },
	"1": { harmonic: "1", basePowerOfTwo: 0 },
	"-1": { harmonic: "1", basePowerOfTwo: 0 }, //TODO: ARE BOTH OF THESE NEEDED?
}

function mapCentsToInterval(pitchDifference, octaveDifference) {
	var baseHarmonicRatio = mapOfIntervalIdByCentsToBaseHarmonicRatio[pitchDifference];
	if (!baseHarmonicRatio) return false;

	var powerOfTwo = baseHarmonicRatio.basePowerOfTwo + octaveDifference;

	var octaveAdjustment = Math.pow(2, Math.abs(powerOfTwo));

	if (powerOfTwo < 0) {
		return baseHarmonicRatio.harmonic + ":" + octaveAdjustment.toString();
	} else {
		return octaveAdjustment.toString() + ":" + baseHarmonicRatio.harmonic;
	}
}

function drawDiagram(pitchId, otherVoices, comparison) {	
	var pitch = pitchIdToCentsMap[pitchId.class];
	drawPoint(pitch, POINT_SIZE);
	var drew = false;
	Object.keys(otherVoices).forEach(function(otherVoice, otherVoiceIndex) {
		var otherPitchObj = otherVoices[otherVoice];
		var otherPitch = pitchIdToCentsMap[otherPitchObj.class];
		var pitchDifference = pitch - otherPitch;

		var octaveDifference = pitchId.octave - otherPitchObj.octave;

		//means the other pitch's class is ABOVE the/my pitch's class
		//w/in that weird organization of letters/nodes/classes w/in one octave of the tuning
		//which means if the octave difference was nothing, this would be a move DOWNWARDS (FROM other TO me)
		//which, because base powers of two in the object in this program assume slight upwards,
		//it means that we should subtract one octave
		//we can also think of it as canceling out / converting that octave into some extra cents
		if (pitchDifference < 0) {
			pitchDifference += 1200;
			octaveDifference -= 1;
		}

		var intervalLabel = mapCentsToInterval(pitchDifference, octaveDifference);

		if (intervalLabel != comparison[otherVoiceIndex]) {
			drew = "CALC ERROR; intervalLabel: " + intervalLabel + " don't equal comparison " + comparison[otherVoiceIndex];
		}

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
	new Line(point.x, point.y, otherPoint.x, otherPoint.y).drawWithArrowheads(ctx);
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

function parseSong(songFileParseResultData) {
	var output = [];
	songFileParseResultData.forEach(function(moment) {
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

getFileObject('song.csv', function (songFile) {
	var songFileConfig = {
		complete: function(songFileParseResults) {
			var parsedSongData = parseSong(songFileParseResults.data);
			getFileObject('comparison.csv', function (comparisonFile) {
				var comparisonFileConfig = {
					complete: function(comparisonFileParseResults) {
						processSong(parsedSongData, parsedSongData.length, 0, comparisonFileParseResults.data);
					}
				}
				Papa.parse(comparisonFile, comparisonFileConfig);
			});
		}
	};
	Papa.parse(songFile, songFileConfig);
});

function processSong(parsedSongData, songLength, beatIndex, parsedComparisonData) {
	var beat = parsedSongData[beatIndex];
	processVoices(beat, beatIndex, songLength, parsedSongData, 0, parsedComparisonData);
}

function shallowCopy(object) {
	return JSON.parse(JSON.stringify(object));
}

function getComparison(parsedComparisonData, beatIndex, voiceIndex) {
	// console.log(parsedComparisonData);
	// console.log(beatIndex);
	// console.log(parsedComparisonData[beatIndex])
	// console.log(voiceIndex)
	// console.log(parsedComparisonData[beatIndex][voiceIndex * 3])
	// debugger;
	var comparison = [
		parsedComparisonData[beatIndex][voiceIndex * 4],
		parsedComparisonData[beatIndex][voiceIndex * 4 + 1],
		parsedComparisonData[beatIndex][voiceIndex * 4 + 2],
		parsedComparisonData[beatIndex][voiceIndex * 4 + 3]
	];
	// console.log(comparison);
	return comparison;
}

function processVoices(beat, beatIndex, songLength, parsedSongData, voiceIndex, parsedComparisonData) {
	var voiceName = voiceNames[voiceIndex];
	var voice = beat[voiceName];
	var otherVoices = shallowCopy(beat);
	delete otherVoices[voiceName];

	var comparison = getComparison(parsedComparisonData, beatIndex, voiceIndex);

	reset();

	var shouldSave = drawDiagram(voice, otherVoices, comparison);
	if (shouldSave == "CALC ERROR") {
		debugger;
		console.log('error with' + voiceName + "." + beatName(beatIndex) + "; " + shouldSave);
	}
	if (shouldSave) {
		canvas.toBlob(function(blob) {
			saveAs(blob, voiceName + "." + beatName(beatIndex) + ".png");
			process(voiceIndex, beat, beatIndex, songLength, parsedSongData, parsedComparisonData);
		});
	} else {
		process(voiceIndex, beat, beatIndex, songLength, parsedSongData, parsedComparisonData);
	}
}

function process(voiceIndex, beat, beatIndex, songLength, parsedSongData, parsedComparisonData) {
	if (voiceIndex < voiceNames.length - 1) {
		processVoices(beat, beatIndex, songLength, parsedSongData, voiceIndex + 1, parsedComparisonData)
	} else if (beatIndex < songLength - 1) {
		processSong(parsedSongData, songLength, beatIndex + 1, parsedComparisonData)
	}
}
