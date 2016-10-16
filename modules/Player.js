var Field = require('./Field');

module.exports = function(player){ //info about new player
	player = $.extend({AI: false, type:0}, player);

	this.Field;
	this.move = false;
	this.moves = 0;
	this.AI = null;
	this.gameOver = false;

	this.giveRound = function(callback, $field){
		var $marker = $field.find(".marker");
		if(player.type==0){
			$field.bind("click mousemove mouseout", function(ev){
				if(ev.type=="mouseout"){
					$marker.hide();
					return;
				}
				var p = {
					x: Math.floor((ev.layerX+1)/33),
					y: Math.floor((ev.layerY+1)/33)
				};
				if(ev.type=="click"){
					$(this).unbind("click mousemove");
					$marker.hide();
					callback(p);
					return;
				}
				//mousemove
				$marker.css({
					left: p.x*33, top: p.y*33
				}).show();
			});
		}
		else {
			if(this.isAI()){
				var prepareAttack = this.AI.doAttack();
				setTimeout(function(){
					callback(prepareAttack);
				},800);
			}
		}
	}

	this.attack = function(pos){
		var s = this.Field.attackGrid(pos.x, pos.y);

		if(s) this.moves++;

		if(typeof s[0] !== 'undefined' && typeof s[1] !== 'undefined'){
			if(s[0] && s[1]){
				if(this.Field.Ships.allDamaged()) this.gameOver = true;
			}
		}

		return s;
	}

	this.isAI = function(){
		return player.AI && !!this.AI;
	}

	this.addLabel = function(){
		var $label = $("<div/>", {class: "playerlabel "+ (player.type==0 ? "me" : "enemy")}).append(
			$("<span/>", {text: player.name})
		);
		this.Field.$.after($label);
	}

	this.addDamagedShips = function(){
		var ships = this.Field.Ships.getAll(),
			$list = $("<div/>", {class: "todamage"});

		for(var s in ships){
			$list.append(
				ships[s].$.clone().removeClass("rotated")
			);
		}

		this.Field.$.after($list);
	}

	this.getPlayer = function(i){
		return typeof i !== 'undefined' ? player[i] : player;
	}

	this.init = function(){
		this.Field = new Field();

		if(player.AI){
			this.Field.setShipsRandomly(false); //param defines visibility ship
			var AI = require('./AI');
			this.AI = new AI();
		}
	}

	this.init();
};