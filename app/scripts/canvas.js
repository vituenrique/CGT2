
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

function whichSideOfLine(lineEndptA, lineEndptB, ptSubject) {
    return (ptSubject.x - lineEndptA.x) * (lineEndptB.y - lineEndptA.y) - (ptSubject.y - lineEndptA.y) * (lineEndptB.x - lineEndptA.x);
} 
 function truncAngle(a){
	while(a < 0){
	  a += 2*Math.PI;
	}
	while(a > 2*Math.PI){
	  a -= 2*Math.PI;
	}
	return a;
}
function getAngleRad(p1,p2){
	return Math.atan2(p1.y - p2.y, p1.x - p2.x);
}
function getOrientation(p1, p2, p3){
    var p2Angle = truncAngle(getAngleRad(p1,p2));
    var p3Angle = truncAngle(getAngleRad(p1,p3));
    return p2Angle == p3Angle ? 0 : p2Angle > p3Angle ? 1 : 2;  
}
	
function compare(p1, p2){
    var orientation = getOrientation(new Point(0, 0), p1, p2);
    if(orientation == 0){
    	if(dist(new Point(0, 0),p2)>=dist(new Point(0, 0),p1)){
    		return -1;
    	}else{
    		return 1;
    	}
    }else{
    	if(orientation==2){return -1;}
    		else{return 1;}
    }
}

function dist(p1, p2){
	return Math.sqrt(Math.pow(p1.x - p2.x,2) + Math.pow(p1.y - p2.y,2));
}

/*function convexHull(points) {
	var hull = [];

	//points.sort(compare);

    for (var i = 0; i < points.length; i++){
        for (var j = i+1; j < points.length; j++){
            var x1 = points[i].x;
            var x2 = points[j].x;
            var y1 = points[i].y;
            var y2 = points[j].y;
 
            var a1 = y1-y2;
            var b1 = x2-x1;
            var c1 = x1*y2-y1*x2;
            var pos = 0, neg = 0;
            for (var k=0; k<points.length; k++){
                if (a1*points[k].x+b1*points[k].y+c1 <= 0)
                    neg++;
                if (a1*points[k].x+b1*points[k].y+c1 >= 0)
                    pos++;
            }
            if (pos == points.length || neg == points.length){
                hull.push(points[i]);
                hull.push(points[j]);
            }
        }
    }
    return hull;
}*/

/*function convexHull(points) {
	var hull = [];

	points.sort(compare);

    for(var i = 0; i < points.length; i++) {
        for(var j = 0; j < points.length; j++) {
            if(i === j) {
                continue;
            }   
            var ptI = points[i];
            var ptJ = points[j];

            var allPointsOnTheRight = true;

            for(var k = 0; k < points.length; k++) {
                if(k === i || k === j) {
                    continue;
                }
                
                var d = whichSideOfLine(ptI, ptJ, points[k]);
                if(d < 0) {
                    allPointsOnTheRight = false;
                    break;
                }                        
            }
            
            if(allPointsOnTheRight) {
                hull.push(ptI);
                hull.push(ptJ);
            }
        }
    }
    return hull;
}
*/
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