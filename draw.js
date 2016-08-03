canvas = document.getElementById("canvas");
canvas.width  = window.innerWidth * .95;
canvas.height = window.innerHeight * .95;
var ctx = canvas.getContext("2d");

var r = Math.min(canvas.width, canvas.height) / 2.5;

ctx.beginPath();
ctx.arc(
  canvas.width / 2,
  canvas.height / 2,
  r,
  0,2*Math.PI
);
ctx.stroke();

ctx.moveTo(canvas.width / 2, canvas.height / 2 - r);
ctx.lineTo(canvas.width / 2, canvas.height / 2 + r);
ctx.stroke();
