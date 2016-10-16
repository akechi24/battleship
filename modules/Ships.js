module.exports = function(Field){
	var self = this;

	var ships = {
		1:{
			mast: 5,
			class: "ship5"
		},
		2: {
			mast: 4,
			class: "ship4"
		},
		3: {
			mast: 3,
			class: "ship31"
		},
		4: {
			mast: 3,
			class: "ship32"
		},
		5: {
			mast: 2,
			class: "ship2"
		}
	};

	this.get = function(i){return ships[i];}

	this.getAll = function(){return ships;}

	this.rotate = function(i, set){
		if(typeof set !== 'undefined'){
			ships[i].$.removeClass('rotated').addClass(set ? "rotated" : "");
			ships[i].rotated = set ? true : false;
			return;
		}

		ships[i].$.toggleClass("rotated").one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
			var pos = self.getPosition(i);
			ships[i].x=pos.x; ships[i].y=pos.y;
		});

		ships[i].rotated = ships[i].$.hasClass("rotated");
	}

	this.reset = function(i){
		ships[i].x=-1; ships[i].y=-1;
	}

	this.set = function(i, pos, visible){
		if(typeof visible === 'undefined') visible = true;
		ships[i].x=pos.x; ships[i].y=pos.y;
		if(!visible) return;
		this.setPosition(i);
	}

	this.setPosition = function(i){
		var ship = ships[i],
			pos = {x:ship.x, y:ship.y};

		ship.$.removeAttr("style");
		if(Math.min(0,pos.x,pos.y)<0 || Math.max(10, pos.x+(ship.rotated ? ship.mast : 1), pos.y+(ship.rotated ? 1 : ship.mast))>10){
			if(ship.rotated) this.rotate(i);
			if(ship.$.parent()[0]===Field[0]) ship.$.detach().appendTo(Field.next("div"));
			ship.$.css("position", "relative");
			this.reset(i);
			return;
		}
		if(ship.$.parent()[0]!==Field[0]) ship.$.detach().appendTo(Field);

		pos = this.fixPosRotatedShip(pos, i);

		ship.$.css({
			top: pos.y*33, left: pos.x*33
		});
	}

	this.getPosition = function(i, shipOffset, real){ //in case when real==true, function returns real position in CSS
		if(typeof shipOffset === 'undefined') shipOffset = ships[i].$.offset();
		if(typeof real === 'undefined') real = false;	//otherwise returns real coords (x,y)
		var p = {
			x: Math.round((shipOffset.left - Field.offset().left)/33),
			y: Math.round((shipOffset.top - Field.offset().top)/33)
		};

		if(!real) return p;

		return this.fixPosRotatedShip(p, i);
	}

	this.fixPosRotatedShip = function(pos, i){ //i=shipID
		if(!ships[i].rotated) return pos;

		var s = Math.floor(ships[i].mast/2);

		pos.x += s;
		pos.y -= s;

		if(ships[i].mast%2 == 0) pos.x--;

		return pos;
	}

	this.disbaleDragging = function(){
		for(var i in ships) ships[i].$.draggable("destroy");
	}

	this.dealDamage = function(i){
		return ++ships[i].damage;
	}

	this.isDamaged = function(i){
		return ships[i].damage >= ships[i].mast;
	}

	this.allDamaged = function(){
		for(var i in ships){
			if(!this.isDamaged(i)) return false;
		}
		return true;
	}

	this.sink = function(i){
		if(!ships[i].$.parent().length){
			this.setPosition(i);
			$(".todamage").find("."+ ships[i].class).css({opacity:.3});
		}
		Field.find(".fire[data-ship='"+ i +"']").remove();
		ships[i].$.css("opacity", .3);
	}

	this.init = function(){
		for(var c in ships){
			ships[c].$ = $("<div/>", {class: "ship "+ ships[c].class});
			ships[c].x = -1; ships[c].y=-1;
			ships[c].rotated = false;
			ships[c].damage = 0;
		}
	}

	this.init();
}