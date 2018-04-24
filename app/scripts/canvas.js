
var navbarElement; 
var canvas;
var canvasColor;
var context;

var drawBuffer = [];
var drawPoint = false;
var drawLine = 0;
var drawArc = 0;
var drawBezier = 0;
var drawPoly = 0;
var tol = 10;
var translate = 0;
var mirror = 0;
var hull = 0;
var fileTxt = "";

function onLoad(){
	
	navbarElement = document.getElementsByClassName("navbar")[0];
	canvas = document.getElementById('canvas');
	canvasColor = "#fff";

	
	if(canvas != null){
		context = canvas.getContext('2d');
	}

	drawCanvas();

	// Seta o tamnho do canvas com as medidas da tela do usuário.
	window.addEventListener('resize', resizeCanvas, false);
}

function setCanvasSize(){
	canvas.width = navbarElement.offsetWidth;
	canvas.height = window.innerHeight - navbarElement.offsetHeight;
}

function resizeCanvas(){
	setCanvasSize();
	drawCanvas();
}

function clearCanvas(){
	setCanvasSize();
	context.fillStyle = canvasColor;
	context.fillRect(0, 0, canvas.width, canvas.height);
	drawBuffer = [];
	hullBuffer = [];
}

function drawCanvas(pick = null){
	setCanvasSize();
	context.fillStyle = canvasColor;
	context.fillRect(0, 0, canvas.width, canvas.height);

	if(drawBuffer.length > 0){
		for (var i = 0; i < drawBuffer.length; i++){
			context.setLineDash([0,0]);
			if(drawBuffer[i] != pick) drawBuffer[i].draw(context);
		}
	}
}

function drawQuadrants(){
	if(pick != null && mirror == 1){
		var box = pick.boundingBox();
		new Line(new Point(0, box.y), new Point (canvas.width, box.y)).draw(context, true);
		new Line(new Point(0, box.y + box.height), new Point (canvas.width, box.y + box.height)).draw(context, true);
		new Line(new Point(box.x, 0), new Point (box.x, canvas.height)).draw(context, true);
		new Line(new Point(box.x + box.width, 0), new Point (box.x + box.width,  canvas.height)).draw(context, true);
		pick.draw(context);
	}
}

function createSaveObj(){
	var txt = [];
	if(drawBuffer.length > 0){
		for (var i = 0; i < drawBuffer.length; i++){
			txt.push(drawBuffer[i].toString() + "\r\n");
		}
	}
	return txt;
}

function uploadCanvas(){
	document.getElementById("uploader").click();
}

function uploadFile(evt){
	var input = event.target;

    var reader = new FileReader();

    reader.onload = function(){
		fileTxt = reader.result;
    };
    if (typeof(input.files[0]) !== 'undefined'){
    	reader.readAsText(input.files[0]);
    }
}

function drawFile(){
	if(fileTxt != ""){
		drawBuffer = [];
		var lines = fileTxt.split(/\r?\n/);
		for (var i = 0; i < lines.length; i++) {
			var fLine = lines[i].split(";");
			switch(fLine[0]){
				case "POINT":
					var point = new Point(fLine[1], fLine[2]);
					point.color = fLine[3];
					drawBuffer.push(point);
					break;
				case "LINE":
					var line = new Line(new Point(fLine[1], fLine[2]), new Point(fLine[3], fLine[4]));
					line.color = fLine[5];
					drawBuffer.push(line);
					break;
				case "POLYGON":
					var vertices = [];
					for(var i = 1; i < fLine.length - 1; i += 2){
						vertices.push(new Point(fLine[i], fLine[i + 1]));
					}
					var poly = new Polygon(vertices);
					poly.color = fLine[fLine.length - 1];
					drawBuffer.push(poly);
					break;
				case "BEZIER":
					var bezier = new Bezier(
						new Point(fLine[1], fLine[2]), 
						new Point(fLine[3], fLine[4]),
						new Point(fLine[5], fLine[6]), 
						new Point(fLine[7], fLine[8]));
					bezier.color = fLine[9];
					drawBuffer.push(bezier);
					break;
				case "ARC":
					var arc = new Arc(fLine[1], fLine[2], fLine[3], fLine[4], fLine[5]);
					arc.color = fLine[6];
					drawBuffer.push(arc);
					break;
			}
			
		}
		drawCanvas();
		setAllFalse();
	}
}

function saveCanvas(){
	var objs = createSaveObj();
	var blob = new Blob(objs, {type: "text/plain;charset=utf-8"});
	var date = new Date();
  	saveAs(blob, "canvas-" + date.getDate() + "." + date.getMonth() + "." + date.getFullYear() + "-" + date.getHours() + "." + date.getMinutes() + ".txt");
}

function getColor() {
	var colorPicker = document.getElementById("colorwheel");	
	if(colorPicker == null){
		return "#000";
	}
	return colorPicker.value;
}

function setAllFalse(){
	drawPoint = false;
	drawLine = 0;
	drawArc = 0;
	drawBezier = 0;
	drawPoly = 0;
	scale = 0;
	rotation = 0;
	translate = 0;
}

function generateNewPoint(){
	if(drawPoint == false){
		setAllFalse();
		drawPoint = true;
	}else{
		drawPoint = false;
	}
}

function generateNewLine(){
	if(drawLine == 0){
		setAllFalse();
		drawLine = 1;
	}
}

function generateNewArc(){
	if(drawArc == 0){
		setAllFalse();
		drawArc = 1;
	}
}

function generateNewBezier(){
	if(drawBezier == 0){
		setAllFalse();
		drawBezier = 1;
	}
}

function generateNewPolygon(){
	if(drawPoly == 0){
		setAllFalse();
		drawPoly = 1;
	}
}

function translateFlag(){
	
	if(translate == 0){
		setAllFalse();
		translate = 1;
	}else{
		translate = 0;
	}
}

function scaleFlag(){
	if(scale == 0){
		setAllFalse();
		scale = 1;
	}
}

function rotationFlag(){
	if(rotate == 0){
		setAllFalse();
		rotate = 1;
	}
}

function mirrorFlag(){
	if(mirror == 0){
		setAllFalse();
		mirror = 1;
	}
}

function hullFlag(){
	if(hull == 0){
		setAllFalse();
		hull = 1;
	}
}


onLoad();	