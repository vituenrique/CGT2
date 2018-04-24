function Polygon (points){
	this.vertices = points;
	this.color = getColor();
	this.ID = "POLYGON";
}

Polygon.prototype.draw = function(context){
	for (var i = 0; i < this.vertices.length - 1; i++){
		var edge = new Line(this.vertices[i], this.vertices[i + 1]);
		edge.draw(context);
	}

	var finalEdge = new Line(this.vertices[this.vertices.length-1], this.vertices[0]);
	finalEdge.draw(context);
}

Polygon.prototype.pick = function(pos){
	var cout = 0;
	for (var i = 0; i < this.vertices.length; i++){
		if(this.vertices[i].pick(pos) == true)
			return true;
	}
	for(var i = 0; i < this.vertices.length - 1; i++){
		var x0, x1, y0, y1;
		if(this.vertices[i].y < this.vertices[i+1].y){
			x0 = this.vertices[i].x;
			x1 = this.vertices[i+1].x;
			y0 = this.vertices[i].y;
			y1 = this.vertices[i+1].y;
		}else{
			x0 = this.vertices[i+1].x;
			x1 = this.vertices[i].x;
			y0 = this.vertices[i+1].y;
			y1 = this.vertices[i].y;
		}

		if(pos.y > y0 && pos.y < y1 && (pos.x > x0 || pos.x > x1)){
			if((pos.x < x0 && pos.x < x1)){
				cout += 1;
			}else{
				var dx = x0 - x1;
				var xc = x0;
				if(dx != 0){
					xc += ( pos.y - y0 ) * dx / ( y0 - y1 );
				}
				if(pos.x > xc){
					cout += 1;
				}
			}
		}
	}

	if(this.vertices[this.vertices.length-1].y < this.vertices[0].y){
		x0 = this.vertices[this.vertices.length-1].x;
		x1 = this.vertices[0].x;
		y0 = this.vertices[this.vertices.length-1].y;
		y1 = this.vertices[0].y;
	}else{
		x0 = this.vertices[0].x;
		x1 = this.vertices[this.vertices.length-1].x;
		y0 = this.vertices[0].y;
		y1 = this.vertices[this.vertices.length-1].y;
	}

	if(pos.y > y0 && pos.y < y1 && (pos.x > x0 || pos.x > x1)){
		if((pos.x < x0 && pos.x < x1)){
			cout += 1;
		}else{
			var dx = x0 - x1;
			var xc = x0;
			if(dx != 0){
				xc += ( pos.y - y0 ) * dx / ( y0 - y1 );
			}
			if(pos.x > xc){
				cout += 1;
			}
		}
	}
	if(cout%2 == 1){
		return true;
	}

	return false;
}

Polygon.prototype.highlight = function(context){
	var box = this.boundingBox();
	context.rect(box.x, box.y, box.width, box.height);
	context.strokeStyle = "rgb(0,0,0)"
	context.setLineDash([1,3]); 
	context.stroke();
	context.setLineDash([0,0]); 
}

Polygon.prototype.boundingBox = function(){
	var minX = canvas.width;
	var maxX = 0;
	var minY = canvas.height;
	var maxY = 0;
	for (var i = 0; i < this.vertices.length; i++){
		if(this.vertices[i].x < minX){
			minX = this.vertices[i].x;
		}
		if(this.vertices[i].x > maxX){
			maxX = this.vertices[i].x;
		}
		if(this.vertices[i].y < minY){
			minY = this.vertices[i].y;
		}
		if(this.vertices[i].y > maxY){
			maxY = this.vertices[i].y;
		}
	}
	return {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
}

Polygon.prototype.translate = function(pos){
	var distX = this.vertices[0].x
	var distY = this.vertices[0].y
	this.vertices[0].translate(pos);
	for(var i = 1; i < this.vertices.length; i++){
		this.vertices[i].x += this.vertices[0].x - distX
		this.vertices[i].y += this.vertices[0].y - distY
	}
}

Polygon.prototype.scale = function(rate){
	for(var i = 0; i < this.vertices.length;i++){
		this.vertices[i].x *= rate
		this.vertices[i].y *= rate
	}
}

Polygon.prototype.drawScale = function(rate){
	context.strokeStyle = this.color;
	for(var i = 0;i<this.vertices.length-1;i++){
		context.beginPath();
		context.moveTo(this.vertices[i].x*rate,this.vertices[i].y*rate);
		context.lineTo(this.vertices[i+1].x*rate,this.vertices[i+1].y*rate);
		context.stroke()
	}
	context.beginPath();
	context.moveTo(this.vertices[this.vertices.length-1].x*rate,this.vertices[this.vertices.length-1].y*rate);
	context.lineTo(this.vertices[0].x*rate,this.vertices[0].y*rate)
	context.stroke();
}


Polygon.prototype.rotate = function(sin,cos,pt){
	var CoM = pt;
	for (var i = 0 ; i < this.vertices.length;i++){
		this.vertices[i].x += CoM.x*-1
		this.vertices[i].y += CoM.y*-1
		this.vertices[i].x = ((cos*this.vertices[i].x) - (sin*this.vertices[i].y));
		this.vertices[i].y = ((sin*this.vertices[i].x) + (cos*this.vertices[i].y));
		this.vertices[i].x += CoM.x
		this.vertices[i].y += CoM.y
	}
	
}

Polygon.prototype.drawRotate = function(sin, cos, pt){
	context.strokeStyle = this.color;
	var ptList = []
	var CoM = pt
	for(var i = 0 ; i < this.vertices.length; i++){
		ptList.push(new Point (this.vertices[i].x, this.vertices[i].y))
	}

	for(var i = 0;i<this.vertices.length;i++){
		ptList[i].x += CoM.x*-1
		ptList[i].y += CoM.y*-1
		ptList[i].x = ((cos*ptList[i].x) - (sin*ptList[i].y));
		ptList[i].y = ((sin*ptList[i].x) + (cos*ptList[i].y));
		ptList[i].x += CoM.x
		ptList[i].y += CoM.y
	}

	for (var i = 0 ; i < ptList.length-1;i++){
		context.beginPath();
		context.moveTo(ptList[i].x,ptList[i].y);
		context.lineTo(ptList[i+1].x,ptList[i+1].y);
		context.stroke();
	}
	context.beginPath();
	context.moveTo(ptList[ptList.length-1].x,ptList[ptList.length-1].y);
	context.lineTo(ptList[0].x,ptList[0].y);
	context.stroke();
}

Polygon.prototype.getQuadrant = function(pos){
	var minXPoint = this.vertices[0];
	var maxXPoint = this.vertices[0];
	var minYPoint = this.vertices[0];
	var maxYPoint = this.vertices[0];
	for(var i = 1; i < this.vertices.length; i++){
		if(this.vertices[i].x < minXPoint.x){
			minXPoint = this.vertices[i];
		}
		if(this.vertices[i].x > maxXPoint.x){
			maxXPoint = this.vertices[i];
		}
		if(this.vertices[i].y < minYPoint.y){
			minYPoint = this.vertices[i];
		}
		if(this.vertices[i].y > maxYPoint.y){
			maxYPoint = this.vertices[i];
		}
	}

	if(pos.x > maxXPoint.x && pos.y < maxYPoint.y && pos.y > minYPoint.y) return "right";
	if(pos.x < minXPoint.x && pos.y < maxYPoint.y && pos.y > minYPoint.y) return "left";
	if(pos.y < maxYPoint.y && pos.x < maxXPoint.x && pos.x > minXPoint.x) return "top";
	if(pos.y > minYPoint.y && pos.x < maxXPoint.x && pos.x > minXPoint.x) return "botton";
}

Polygon.prototype.mirror = function(orientation){ 
	if (orientation == "left") {
		var minPoint = this.vertices[0];
		for(var i = 1; i < this.vertices.length; i++){
			if(this.vertices[i].x < minPoint.x){
				minPoint = this.vertices[i];
			}
		}
		for(var i = 0; i < this.vertices.length; i++){
			var distX = this.vertices[i].x - minPoint.x;
			this.vertices[i].x -= distX * 2;
		}
	}else if(orientation == "right"){
		var maxPoint = this.vertices[0];
		for(var i = 1; i < this.vertices.length; i++){
			if(this.vertices[i].x > maxPoint.x){
				maxPoint = this.vertices[i];
			}
		}
		for(var i = 0; i < this.vertices.length; i++){
			var distX = maxPoint.x - this.vertices[i].x;
			this.vertices[i].x += distX * 2;
		}
	}else if(orientation == "top"){
		var maxPoint = this.vertices[0];
		for(var i = 1; i < this.vertices.length; i++){
			if(this.vertices[i].y < maxPoint.y){
				maxPoint = this.vertices[i];
			}
		}
		for(var i = 0; i < this.vertices.length; i++){
			var distY = this.vertices[i].y - maxPoint.y;
			this.vertices[i].y -= distY * 2;
		}
	}else if(orientation == "botton"){
		var minPoint = this.vertices[0];
		for(var i = 1; i < this.vertices.length; i++){
			if(this.vertices[i].y > minPoint.y){
				minPoint = this.vertices[i];
			}
		}
		for(var i = 0; i < this.vertices.length; i++){
			var distY = minPoint.y - this.vertices[i].y;
			this.vertices[i].y += distY * 2;
		}
	}
}

Polygon.prototype.toString = function(){
	var str = this.ID;
	for(var i = 0; i < this.vertices.length; i++){
		str += ";" + this.vertices[i].x + ";" + this.vertices[i].y;
	}
	str += ";" + this.color;
	return str;
}