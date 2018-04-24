function Bezier (startPt, endPt, ctrlPt1, ctrlPt2){
	this.startPt = startPt;
	this.endPt = endPt;
	this.ctrlPt1 = ctrlPt1;
	this.ctrlPt2 = ctrlPt2;
	this.color = getColor();
	this.ID = "BEZIER";
}

Bezier.prototype.draw = function(context){
	context.beginPath();
	context.moveTo(this.startPt.x, this.startPt.y);
	context.bezierCurveTo(this.ctrlPt1.x, this.ctrlPt1.y, this.ctrlPt2.x, this.ctrlPt2.y, this.endPt.x, this.endPt.y);
	context.strokeStyle = getColor();
	context.stroke();
}

Bezier.prototype.pick = function(pos){	
	if(this.startPt.pick(pos) == true || this.endPt.pick(pos) == true) return true;

	var ptList = [];
	var lerpT = 0.5;
	ptList[0] = this.startPt;
	ptList[1] = this.ctrlPt1;
	ptList[2] = this.ctrlPt2;
	ptList[3] = this.endPt;
	ptList[4] = new Point(ptList[0].x+(lerpT*(ptList[1].x-ptList[0].x)),ptList[0].y+(lerpT*(ptList[1].y-ptList[0].y))); 
	ptList[5] = new Point(ptList[1].x+(lerpT*(ptList[2].x-ptList[1].x)),ptList[1].y+(lerpT*(ptList[2].y-ptList[1].y)));
	ptList[6] = new Point(ptList[2].x+(lerpT*(ptList[3].x-ptList[2].x)),ptList[2].y+(lerpT*(ptList[3].y-ptList[2].y)));
	ptList[7] = new Point(ptList[4].x+(lerpT*(ptList[5].x-ptList[4].x)),ptList[4].y+(lerpT*(ptList[5].y-ptList[4].y)));
	ptList[8] = new Point(ptList[5].x+(lerpT*(ptList[6].x-ptList[5].x)),ptList[5].y+(lerpT*(ptList[6].y-ptList[5].y)));
	ptList[9] = new Point(ptList[7].x+(lerpT*(ptList[8].x-ptList[7].x)),ptList[7].y+(lerpT*(ptList[8].y-ptList[7].y)));

	if(ptList[9].pick(pos) == true) return true;

	var poly = new Polygon(ptList);
	return poly.pick(pos);
}

Bezier.prototype.highlight = function(context){

	var box = this.getBoundingBox();
	
	context.rect(box.x, box.y, box.width, box.height);
	context.strokeStyle = "rgba(0, 0, 0)";
	context.setLineDash([1,3]); 
	context.stroke();
	context.setLineDash([0,0]);
}

Bezier.prototype.getBoundingBox = function()	{
    var px, py, qx, qy, rx, ry, sx, sy, tx, ty;
    var tobx, toby, tocx, tocy, todx, tody, toqx, toqy, torx, tory, totx, toty;
    var x, y, minx, miny, maxx, maxy;
    
    minx = miny = Number.POSITIVE_INFINITY;
    maxx = maxy = Number.NEGATIVE_INFINITY;
    
    tobx = this.ctrlPt1.x - this.startPt.x;  
    toby = this.ctrlPt1.y - this.startPt.y; 

    tocx = this.ctrlPt2.x - this.ctrlPt1.x;  
    tocy = this.ctrlPt2.y - this.ctrlPt1.y;
    
    todx = this.endPt.x - this.ctrlPt2.x;  
    tody = this.endPt.y - this.ctrlPt2.y;
    var step = 1/40;
    for(var d = 0; d < 1.001; d += step){
        px = this.startPt.x + d * tobx;  
        py = this.startPt.y + d * toby;
        qx = this.ctrlPt1.x + d * tocx;  
        qy = this.ctrlPt1.y + d * tocy;
        rx = this.ctrlPt2.x + d * todx;  
        ry = this.ctrlPt2.y + d * tody;

        toqx = qx - px;      
        toqy = qy - py;
        torx = rx - qx;      
        tory = ry - qy;
        
        sx = px + d * toqx;  
        sy = py + d * toqy;

        tx = qx + d*torx;  
        ty = qy + d * tory;

        totx = tx - sx;   
        toty = ty - sy;

        x = sx + d * totx;  
        y = sy + d * toty;
        
        minx = Math.min(minx, x); 
        miny = Math.min(miny, y);
        maxx = Math.max(maxx, x); 
        maxy = Math.max(maxy, y);
    }        
    return {x: minx, y: miny, width: maxx - minx, height: maxy - miny};
}

Bezier.prototype.translate = function(pos){
	var distX = this.startPt.x ;
	var distY = this.startPt.y;
	this.startPt.translate(pos);
	this.ctrlPt1.x += this.startPt.x - distX;
	this.ctrlPt1.y += this.startPt.y - distY;
	this.ctrlPt2.x += this.startPt.x - distX;
	this.ctrlPt2.y += this.startPt.y - distY;
	this.endPt.x += this.startPt.x - distX;
	this.endPt.y += this.startPt.y - distY;
}

Bezier.prototype.scale = function(rate){
	this.startPt.x *= rate;
	this.startPt.y *= rate;
	this.ctrlPt1.x *= rate;
	this.ctrlPt1.y *= rate;
	this.ctrlPt2.x *= rate;
	this.ctrlPt2.y *= rate;
	this.endPt.x *= rate;
	this.endPt.y *= rate;
}

Bezier.prototype.drawScale = function(rate){
	context.beginPath();
	context.moveTo(this.startPt.x*rate,this.startPt.y*rate);
	context.bezierCurveTo(this.ctrlPt1.x*rate,this.ctrlPt1.y*rate,this.ctrlPt2.x*rate,this.ctrlPt2.y*rate,this.endPt.x*rate,this.endPt.y*rate);
	context.strokeStyle = this.color;
	context.stroke();
}

Bezier.prototype.rotate = function(sin, cos, pt){
	var ptList = [this.startPt,this.ctrlPt1,this.ctrlPt2,this.endPt]
	var CoM = pt;
	for (var i = 0; i < ptList.length; i++){
		ptList[i].x += CoM.x*-1;
		ptList[i].y += CoM.y*-1;
		ptList[i].x = ((cos*ptList[i].x) - (sin*ptList[i].y));
		ptList[i].y = ((sin*ptList[i].x) + (cos*ptList[i].y));
		ptList[i].x += CoM.x;
		ptList[i].y += CoM.y;
	}
	
}

Bezier.prototype.drawRotate = function(sin,cos,pt){
	
	var ptList = [new Point(this.startPt.x , this.startPt.y),new Point (this.ctrlPt1.x,this.ctrlPt1.y),new Point (this.ctrlPt2.x,this.ctrlPt2.y),new Point(this.endPt.x , this.endPt.y)]
	var CoM = pt;
	for (var i = 0 ; i < ptList.length;i++){
		ptList[i].x += CoM.x*-1
		ptList[i].y += CoM.y*-1
		ptList[i].x = ((cos*ptList[i].x) - (sin*ptList[i].y));
		ptList[i].y = ((sin*ptList[i].x) + (cos*ptList[i].y));
		ptList[i].x += CoM.x
		ptList[i].y += CoM.y
	}
	context.beginPath();
	context.moveTo(ptList[0].x,ptList[0].y);
	context.bezierCurveTo(ptList[1].x,ptList[1].y,ptList[2].x,ptList[2].y,ptList[3].x,ptList[3].y);
	context.strokeStyle = "rgb(0,0,0)";
	context.strokeStyle = this.color;
	context.stroke();
}

Bezier.prototype.getCoM = function(){
	return new Point ((this.startPt.x+this.endPt.x+this.ctrlPt2.y+this.ctrlPt1.x)/4,(this.startPt.y+this.endPt.y+this.ctrlPt2.y+this.ctrlPt1.y)/4)
}

Bezier.prototype.mirror = function(pos){ return; }

Bezier.prototype.toString = function(){ 
	return this.ID + ";" + this.startPt.x + ";" + 
		this.startPt.y + ";" + this.endPt.x + ";" + 
		this.endPt.y + ";" + this.ctrlPt1.x + ";" + 
		this.ctrlPt1.y + ";" + this.ctrlPt2.x + ";" + 
		this.ctrlPt2.y + ";" + this.color;
}