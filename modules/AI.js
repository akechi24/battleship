var Functions = require('./Functions');

module.exports = function(){
	var f = [];

	var lastAttack = false,
		coords = false,
		direction = 0, //1-vertical, 2-horizontal
		n = 0;

	this.doAttack = function(){
		if(!coords){
			var a = {x:Functions.getRandom(0,9),y:Functions.getRandom(0,9)};

			if(!this.checkGridAround(a)) return this.doAttack();

			if(lastAttack){
				var d = Math.sqrt(Math.pow(a.x-lastAttack.x, 2)+Math.pow(a.y-lastAttack.y,2));
				if(d<4 && n<=20){
					n++;
					return this.doAttack();
				}
			}
			n=0;
			lastAttack=a;
		}
		else if(coords && !direction){
			var d = Functions.getRandom(0,3), c = this.getCoords();
			switch(d){
				case 0: c.x--; break;
				case 1: c.x++; break;
				case 2: c.y--; break;
				case 3: c.y++; break;
			}
			lastAttack = c;
		}
		else if(coords && direction){
			var d = Functions.getRandom(0,1);
			if(d===0) d=-1;

			var k = this.attackOn(d);
			if(!k) return this.doAttack();
			lastAttack = k;
		}
		if(!this.checkGrid(lastAttack)) return this.doAttack();
		return lastAttack;
	}

	this.attackOn = function(a){ //'attackOn' ... the left/top (a=-1) right/bottom (a=1)
		var c = this.getCoords();
		while(true){
			if(direction==1) c.y+=a;
			else c.x+=a;

			if(c.x<0 || c.x>9 || c.y<0 || c.y>9) return false;

			if(this.checkMishit(c)) return false;
			if(this.checkGrid(c)) return c;
		}
	}

	this.analyze = function(b){
		var ix = lastAttack.x+10*lastAttack.y;

		if(b[0] && b[1]){ //hit and sink, reset AI
			for(var d=0; d<b[2].length; d++){ //check misses around the sunken ship
				f[b[2][d]]=2;
			}
			coords = false; direction=0;
			f[ix]=1;
		} else if(b[0]){ //hit
			if(coords && !direction) direction = lastAttack.x==coords.x ? 1 : (lastAttack.y==coords.y ? 2 : 0);
			coords = {x:lastAttack.x, y:lastAttack.y};
			f[ix]=1;
		} else if(!b[0]){ //miss
			f[ix]=2;
		}
	}

	this.checkGrid = function(pos){ //returns true when grid is empty
		if(pos.x<0 || pos.x>9 || pos.y<0 || pos.y>9) return false;
		return f[pos.x+10*pos.y]===0;
	}

	this.checkMishit = function(pos){
		return f[pos.x+10*pos.y]==2;
	}

	this.checkGridAround = function(pos){
		if(this.checkGrid({x: pos.x-1, y:pos.y})) return true;
		if(this.checkGrid({x: pos.x, y:pos.y-1})) return true;
		if(this.checkGrid({x: pos.x+1, y:pos.y})) return true;
		if(this.checkGrid({x: pos.x, y:pos.y+1})) return true;
		return false;
	}

	this.getCoords = function(){
		return $.extend({}, coords);
	}

	for(var i=0;i<100;i++) f[i]=0;
};