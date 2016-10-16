var Ships = require('./Ships'),
	Functions = require('./Functions');

module.exports = function(){
	this.$ = $("<div/>", {class: "field"});
	this.Ships;

	var field = [];

	/* ***
	[0,0] - empty grid
	[1, id] - ship with id
	[2, id] - ship with id - hit
	[3, 1] - mishit
	[3,2] - area around the sunken ship
	*** */

	this.deleteShip = function(i){
		this.Ships.reset(i);
		this.update();
	}

	this.setShip = function(i, ui){
		this.Ships.set(i, this.Ships.getPosition(i, ui.offset));
		this.update();
	}

	this.update = function(){ //updates field
		var r = true; //return
		this.clear();
		var ready = true;
		var ships = this.Ships.getAll();
		for(var i in ships){
			var b = ships[i];
			if(b.x<0 || b.y<0){ready=false; continue;}
			
			for(var j=0; j<b.mast; j++){
				var t = b.rotated ? (b.x+j)+10*b.y : b.x+10*(b.y+j);
				if(field[t][0]!==0) r = false; //checks if the ships do not overlap
				field[t]=[1, i];
			}
		}
		var $startButton = this.$.parent().find(".start-game");
		if(ready) $startButton.removeClass("disabled");
		else $startButton.addClass("disabled");
		return r;
	}

	this.clear = function(){
		field=[];
		for(var i = 0; i<100; i++) field[i] = [0,0];
	}

	this.checkCollider = function(ship, x, y){
		var c = false;
		if(typeof (x&&y)==='undefined'){
			x=ship.x; y=ship.y;
			c=true;
		}
		if(x<0 || y<0 || x+(ship.rotated ? ship.mast : 1)>10 || y+(ship.rotated ? 1 : ship.mast)>10) return false;
		for(var j=0; j<ship.mast; j++){
			for(var k=-1; k<=1; k++){
				for(var l=-1;l<=1;l++){
					if(c && (k==0 || l==0)){ continue; }
					if(this.checkShipAtPosition(x + (ship.rotated ? j : 0)+k, y + (ship.rotated ? 0 : j)+l)) return false;
				}
			}
		}
		return true;
	}

	this.checkShipAtPosition = function(x,y){
		return this.checkGrid(x,y,1)!==false;
	}

	this.checkGrid = function(x,y,type){
		if(x<0 || y<0 || x>=10 || y>=10) return false; 
		
		return typeof type === 'undefined' ? field[x+10*y] : (field[x+10*y][0]==type ? field[x+10*y][1] : false);
	}

	this.setShipsRandomly = function(visible){
		var ships = this.Ships.getAll();
		for(var i in ships){
			var r = this.setOneShipRandomly(ships[i]);
			this.Ships.rotate(i, r.rotated);
			this.Ships.set(i, {x:r.x, y:r.y}, visible);
			this.update();
		}
	}

	this.setOneShipRandomly = function(ship){
		var rotated = Functions.getRandom(0,1),
			x = Functions.getRandom(0,9),
			y = Functions.getRandom(0,9);

		ship.rotated = rotated;

		if(this.checkCollider(ship, x, y)) return {rotated: rotated, x:x, y:y};
		return this.setOneShipRandomly(ship);
	}

	this.setCollider = function(i, ui){ //i=shipID
		var ship = this.Ships.get(i),
			pos = this.Ships.getPosition(i, ui.offset);

		var w = ship.rotated ? ship.mast : 1,
			h = ship.rotated ? 1 : ship.mast;

		if(pos.x<0) w += pos.x;
		if(pos.y<0) h += pos.y;
		if(pos.x+w>10) w-=pos.x+w-10;
		if(pos.y+h>10) h-=pos.y+h-10;

		if(w<=0 || h<=0) this.$.find(".collider").hide();
		else this.$.find(".collider").css({
			top: Math.max(pos.y,0)*33+1, left: Math.max(pos.x,0)*33+1,
			width: (w==1 ? 0.95 : w*1.05)*30,
			height: (h==1 ? 0.95 : h*1.05)*30
		}).removeClass("red-collider").addClass(this.checkCollider(ship, pos.x, pos.y) ? "" : "red-collider").show();
	}

	this.hideCollider = function(){
		this.$.find(".collider").hide();
	}

	this.message = function(pos, text, color){
		if(!this.$.find(".message").length) this.$.append($("<div/>", {class: "message"}));
		var $mess = this.$.find(".message");
		$mess.removeClass("boom").text(text);
		$mess.css({
			left: pos.x*33 + 33/2 - $mess.width()/2, top: pos.y*33 - $mess.height(),
			color: color ? color : '#000'
		}).addClass("boom").one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e){
			$mess.removeClass("boom");
		});
	}

	this.attackGrid = function(x,y){
		var i = this.checkGrid(x, y),
			pos = {x:x, y:y};
		switch(i[0]){
			case 0:
				field[x+10*y] = [2,i[1]];
				this.mishit(pos);
				this.message(pos, "Pudło!", "#de6a50");
				return [false,false];
			case 1:
				field[x+10*y]=[3,1];
				this.fire(pos, i[1]);

				this.Ships.dealDamage(i[1]);

				if(this.Ships.isDamaged(i[1])){
					this.Ships.sink(i[1]);
					this.message(pos, "Trafiony zatopiony!", "lime");
					return [true,true, this.setMishitAroundShip(i[1])];
				}
				this.message(pos, "Trafiony!", "lime");
				return [true,false];
			case 2:
			case 3:
				return false;
		}
		return false;
	}

	this.fire = function(pos, i){
		this.$.append(
			$("<div/>", {class: "fire", "data-ship": i}).css({
				top: pos.y*33-2, left:pos.x*33
			})
		);
	}

	this.mishit = function(pos, calc){
		if(typeof calc === 'undefined') calc=false;
		this.$.append(
			$("<div/>", {class: "mishit"}).css({
				top: pos.y*33, left:pos.x*33, opacity: calc ? 0.6 : 1
			})
		);
	}

	this.setMishitAroundShip = function(i){
		var ship = this.Ships.get(i),
			c = [];

		for(var j=0; j<ship.mast; j++){
			for(var k=-1; k<=1; k++){
				for(var l=-1; l<=1; l++){
					var pos = {x:ship.x + (ship.rotated ? j : 0)+k, y:ship.y + (ship.rotated ? 0 : j)+l},
						p = this.checkGrid(pos.x, pos.y, 0);

					if(p===false) continue;
					this.mishit(pos, true);
					var idx = pos.x+10*pos.y;
					field[idx]=[3,2];
					c.push(idx);
				}
			}
		}

		return c;
	}

	this.init = function(){
		this.clear();
		this.Ships = new Ships(this.$);
	}

	this.init();
}