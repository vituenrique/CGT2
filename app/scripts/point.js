function Point (x, y){
	this.x = x;
	this.y = y;
	this.color = getColor();
	this.ID = 'POINT';
}

Point.prototype.draw = function(context){
	context.beginPath();
	context.arc(this.x, this.y, 1.3, 0, 2 * Math.PI);
	context.strokeStyle = this.color;
	context.stroke();
}

Point.prototype.pick = function(pos){
	if(this.x < pos.x + tol && this.x > pos.x - tol && this.y < pos.y + tol && this.y > pos.y - tol){
		return true;
	}
	return false;
}

Point.prototype.pickCode = function(pos){
	var code = [];
	code[0] = this.x < pos.x - tol;
	code[1] = this.x > pos.x + tol;
	code[2] = this.y < pos.y - tol;
	code[3] = this.y > pos.y + tol;
	return code;
}

Point.prototype.highlight = function (context){
	drawCanvas();
	context.rect(this.x - tol/2, this.y - tol/2, tol, tol);
	context.strokeStyle = "rgb(0,0,0)"
	context.setLineDash([1,1]); 
	context.stroke();
	context.setLineDash([0,0]); 
}

Point.prototype.translate = function(pos){
	this.x += (pos.x - this.x);
	this.y += (pos.y - this.y);
}

Point.prototype.scale = function(pos){ return; }

Point.prototype.rotate = function(pos){ return; }

Point.prototype.getQuadrant = function(pos){ return; }

Point.prototype.mirror = function(pos){ return; }

Point.prototype.toString = function(){ 
	return this.ID + ";" + this.x + ";" + this.y + ";" + this.color; 
}

