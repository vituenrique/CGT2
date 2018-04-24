var mousePos;

var pick = null;
var move = false;
var scale = 0;
var rotate = 0;
var hullBuffer = [];

//Mouse Up listener
canvas.addEventListener('mouseup', mouseEventDrawPoint, false);
canvas.addEventListener('mouseup', mouseEventDrawLine, false);
canvas.addEventListener('mouseup', mouseEventDrawPolygonStart, false);
canvas.addEventListener('mouseup', mouseEventDrawArcSection, false);
canvas.addEventListener('mouseup', mouseEventDrawBezier, false);
canvas.addEventListener('mouseup', mouseEventPick, false);
canvas.addEventListener('mouseup', mouseEventOnScaleStart, false);
canvas.addEventListener('mouseup', mouseEventOnRotateStart, false);
canvas.addEventListener('mouseup', mouseEventConvexHullStart, false);

// Double Click listener
canvas.addEventListener('dblclick', mouseEventOnScaleEnd, false);
canvas.addEventListener('dblclick', mouseEventDrawPolygonEnd, false);
canvas.addEventListener('dblclick', mouseEventEndTranslate, false);
canvas.addEventListener('dblclick', mouseEventOnRotateEnd, false);
canvas.addEventListener('dblclick', mouseEventOnMirrorStart, false);
canvas.addEventListener('dblclick', mouseEventConvexHullEnd, false);

//Mouse Move listener
canvas.addEventListener('mousemove', mouseEventGetMousePosition, false);
canvas.addEventListener('mousemove', mouseEventRubberBandLine, false);
canvas.addEventListener('mousemove', mouseEventRubberBandPolygon, false);
canvas.addEventListener('mousemove', mouseEventRubberBandArcSection, false);
canvas.addEventListener('mousemove', mouseEventRubberBandBezier, false);
canvas.addEventListener('mousemove', mouseEventIsMoveMode, false);
canvas.addEventListener('mousemove', mouseEventTranslate, false);
canvas.addEventListener('mousemove', mouseEventOnScaling, false);
canvas.addEventListener('mousemove', mouseEventOnRotation, false);

function mouseEventGetMousePosition(evt){
	var rect = canvas.getBoundingClientRect();
	mousePos = {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function mouseEventDrawPoint(){
	if(drawPoint == true){
		drawBuffer.push(new Point(mousePos.x, mousePos.y));
		drawCanvas();
	}
}

function mouseEventDrawLine(){
	if(drawLine == 1){
		tmpPt1 = new Point(mousePos.x, mousePos.y);
		drawLine = 2;
	}else if(drawLine == 2){
		drawBuffer.push(new Line (tmpPt1, new Point(mousePos.x, mousePos.y)));
		drawCanvas();
		setAllFalse();
		pick = null;
	}
}

function mouseEventDrawPolygonStart(){
	if(drawPoly == 1){
		tmpPt = new Point(mousePos.x, mousePos.y);
		tmpArray = [];
		tmpArray.push(tmpPt);
		drawPoly = 2;
	}else if(drawPoly == 2) {
		tmpPt = new Point(mousePos.x, mousePos.y);
		tmpArray.push(tmpPt);
		drawPoly = 3;
	}else if(drawPoly == 3){
		tmpPt = new Point(mousePos.x, mousePos.y);
		tmpArray.push(tmpPt);
	}
}

function mouseEventPick(){
	if(typeof(pick) === "undefined") pick = null;

	for(var i = 0; i < drawBuffer.length; i++){
		if(drawBuffer[i].pick(mousePos) == true){
			pick = drawBuffer[i];
			break;
		}
	}
	if(pick != null){
		if(scale == 0 || rotate == 0){
			drawCanvas();
			pick.highlight(context);
		}
	}
}

function mouseEventDrawPolygonEnd(){
	if(drawPoly == 3){
		setAllFalse();
		tmpArray.push(new Point(mousePos.x,mousePos.y));
		tmpArray.pop();
		tmpArray.pop();
		drawBuffer.push(new Polygon(tmpArray));
		
		drawCanvas();
		pick = null;
	}
	setAllFalse();
	drawCanvas();
}

function mouseEventDrawArcSection(){
	if(drawArc == 1){
		tmpPt1 = new Point(mousePos.x,mousePos.y);
		drawArc = 2;
	}else if(drawArc == 2){	
		tmpPt2 = new Point(mousePos.x,mousePos.y);
		radius = Math.sqrt(Math.pow(tmpPt1.x - tmpPt2.x,2) + Math.pow(tmpPt1.y - tmpPt2.y, 2));
		drawArc = 3;
	}else if(drawArc == 3){
		var dist = Math.sqrt(Math.pow(tmpPt1.x - mousePos.x, 2) + Math.pow(tmpPt1.y - mousePos.y, 2));
		if(tmpPt2.y > tmpPt1.y){
			if(mousePos.y > tmpPt1.y){
				drawBuffer.push(new Arc (tmpPt1, radius, Math.acos((tmpPt2.x-tmpPt1.x)/radius),Math.acos((mousePos.x-tmpPt1.x)/dist)));
			}else{
				drawBuffer.push(new Arc (tmpPt1, radius, Math.acos((tmpPt2.x-tmpPt1.x)/radius),-Math.acos((mousePos.x-tmpPt1.x)/dist)));
			}
		}else{
			if(mousePos.y > tmpPt1.y){
				drawBuffer.push(new Arc (tmpPt1, radius, -Math.acos((tmpPt2.x-tmpPt1.x)/radius),Math.acos((mousePos.x-tmpPt1.x)/dist)));
			}else{
				drawBuffer.push(new Arc (tmpPt1, radius, -Math.acos((tmpPt2.x-tmpPt1.x)/radius),-Math.acos((mousePos.x-tmpPt1.x)/dist)));
			}
		}
		drawArc = 0;
		drawCanvas();
	}
}

function mouseEventDrawBezier(){
	if(drawBezier == 1){
		tmpPt1 = new Point(mousePos.x,mousePos.y)
		drawBezier = 2;
	}else if(drawBezier == 2){
		tmpPt2 = new Point(mousePos.x,mousePos.y)
		drawBezier = 3;
	}else if(drawBezier == 3){
		tmpPt3 = new Point(mousePos.x,mousePos.y)
		drawBezier = 4;
	}else if(drawBezier == 4){
		tmpPt4 = new Point(mousePos.x,mousePos.y)
		drawBuffer.push (new Bezier(tmpPt1, tmpPt2, tmpPt3, tmpPt4));
		drawBezier = 0;
		drawCanvas();
	}
}

function mouseEventEndTranslate(){
	if (move == true){
		move = false;
		pick = null;
	}
}

function mouseEventRubberBandLine(){
	if(drawLine == 2){
		drawCanvas();
		new Line(tmpPt1, mousePos).draw(context);
	}
}

function mouseEventRubberBandPolygon(){
	if(drawPoly == 2){
		drawCanvas();
		// Draw the second polygon's edge.
		new Line(tmpPt, mousePos).draw(context);

	}else if(drawPoly == 3){
		drawCanvas();

		for (var i = 0; i < tmpArray.length - 1; i++){
			new Line(tmpArray[i], tmpArray[i + 1]).draw(context);
		}

		new Line(tmpPt, mousePos).draw(context);

		// Draw what a closed polygon would be at that point.
		new Line(tmpArray[0], mousePos).draw(context);

	}
}

function mouseEventRubberBandArcSection(){
	if(drawArc == 2){
		drawCanvas();
		new Line(tmpPt1, mousePos).draw(context);
 
	}else if(drawArc == 3){
		drawCanvas();
		new Line(tmpPt1, tmpPt2).draw(context);
		new Line(tmpPt1, mousePos).draw(context);

		context.setLineDash([0,0]); 
		context.strokeStyle = getColor();
		context.beginPath();

		var distance = Math.sqrt(Math.pow(tmpPt1.x - mousePos.x,2) + Math.pow(tmpPt1.y - mousePos.y,2));
		if(tmpPt2.y > tmpPt1.y){
			if(mousePos.y > tmpPt1.y){
				context.arc(tmpPt1.x,tmpPt1.y,radius,Math.acos((tmpPt2.x-tmpPt1.x)/radius),Math.acos((mousePos.x-tmpPt1.x)/distance),true);
			}else{
				context.arc(tmpPt1.x,tmpPt1.y,radius,Math.acos((tmpPt2.x-tmpPt1.x)/radius),-Math.acos((mousePos.x-tmpPt1.x)/distance),true);	
			}
		}else{
			if(mousePos.y > tmpPt1.y){
				context.arc(tmpPt1.x,tmpPt1.y,radius,-Math.acos((tmpPt2.x-tmpPt1.x)/radius),Math.acos((mousePos.x-tmpPt1.x)/distance),true);
			}else{
				context.arc(tmpPt1.x,tmpPt1.y,radius,-Math.acos((tmpPt2.x-tmpPt1.x)/radius),-Math.acos((mousePos.x-tmpPt1.x)/distance),true);	
			}
		}
		context.stroke();
	}
}

function mouseEventRubberBandBezier(){
	if (drawBezier == 2){
		drawCanvas();
		new Line(tmpPt1, mousePos).draw(context);

	}else if (drawBezier == 3){
		drawCanvas();
		// Draw what is Bezier's curve so far.
		new Bezier(tmpPt1, tmpPt2, mousePos, tmpPt2).draw(context);

		// Draw the first control point.
		new Line(tmpPt1, mousePos).draw(context, true);

	}else if (drawBezier == 4){
		drawCanvas();
		// Draw what would be Bezier's curve a that point.
		new Bezier(tmpPt1, tmpPt2, tmpPt3, mousePos).draw(context);

		// Draw the second control point.
		new Line(tmpPt2, mousePos).draw(context, true);
	}
}

function mouseEventTranslate(){
	if(move == true && pick != null && translate == 1){
		pick.translate(mousePos);
		drawCanvas();
		pick.highlight(context);
	}
}

function mouseEventOnScaling(){
	if(scale == 2 && pick != null){
		if(pick.ID == "Point") return;

		drawCanvas(pick);

		new Line(scalePt, mousePos).draw(context);

		rate = (mousePos.x/(canvas.width/2));
		pick.drawScale(rate);
	}
}

function mouseEventOnScaleStart(){
	if(scale == 1 && pick != null){
		if(pick.ID == "Point") return;
		move = false;
		scalePt = new Point(mousePos.x, mousePos.y);
		scale = 2;
		drawCanvas();
	}
}

function mouseEventOnScaleEnd(){
	if(scale == 2 && pick != null){
		if(pick.ID == "Point") return;
		pick.scale(rate);
		scale = 0;
		pick = null;
		drawCanvas();
	}
}

function mouseEventOnRotateStart(){
	if(rotate == 1 && pick != null){
		if(pick.ID == "Point") return;
		tmpPt1 = new Point(mousePos.x,mousePos.y);
		rotate = 2;
	}
}

function mouseEventOnRotation(){
	if(rotate == 2 && pick != null){
		if(pick.ID == "Point") return;	
		drawCanvas();
		
		var dist = Math.sqrt(Math.pow(tmpPt1.x - mousePos.x, 2) + Math.pow(tmpPt1.y - mousePos.y, 2));
		
		new Line(tmpPt1, mousePos).draw(context, true);

		new Arc(tmpPt1, 150, 0, Math.PI * 2).draw(context, true);

		var sin = ((mousePos.y - tmpPt1.y) / dist);
		var cos = ((mousePos.x - tmpPt1.x) / dist);
		pick.drawRotate(sin, cos, tmpPt1);
		rotatedObj = pick;
	}
}

function mouseEventOnRotateEnd(){
	if(rotate == 2 && rotatedObj != null){
		if(rotatedObj.ID == "Point") return;
		var dist = Math.sqrt(Math.pow(tmpPt1.x - mousePos.x, 2) + Math.pow(tmpPt1.y - mousePos.y, 2));
		move = false;
		var sin = ((mousePos.y - tmpPt1.y) / dist);
		var cos = ((mousePos.x - tmpPt1.x) / dist);
		rotatedObj.rotate(sin, cos, tmpPt1);
		rotate = 0;
		rotatedObj = null;
		pick = null;
		drawCanvas();
	}
}

function mouseEventOnMirrorStart(){
	if(mirror == 1 && pick != null){
		var quad = pick.getQuadrant(mousePos);
		pick.mirror(quad);	
		mirror = 0;
		drawCanvas();
	}
}

function mouseEventConvexHullStart(){
	if(hull == 1){
		var point = new Point(mousePos.x, mousePos.y);
		if(!hullBuffer.includes(point)){
			point.draw(context);
			hullBuffer.push(point);
			drawBuffer.push(point);
		}
	}
}

function mouseEventConvexHullEnd(){
	if(hull == 1){
		var point = new Point(mousePos.x, mousePos.y);
		if(!hullBuffer.includes(point)){
			point.draw(context);
			hullBuffer.push(point);
			drawBuffer.push(point);
		}

	    var convexHull = new ConvexHullGrahamScan();
	    for(var i = 0; i < hullBuffer.length;i++){
			convexHull.addPoint(hullBuffer[i].x, hullBuffer[i].y);
	    }
	    var hullPoints = convexHull.getHull();
	    
		for (var i = 0 ; i < hullPoints.length-1;i++){
			new Line(hullPoints[i], hullPoints[i + 1]).draw(context);
		}
		new Line(hullPoints[hullPoints.length - 1], hullPoints[0]).draw(context);

		for(var i = 0; i < hullBuffer.length; i++){
			new Point(hullBuffer.x, hullBuffer.y).draw(context);
		}
		hull = 0;
	}
}

function mouseEventIsMoveMode(){
	if(pick != null && scale == 0 && rotate == 0 && translate == 1){
		move = true;
	}
}