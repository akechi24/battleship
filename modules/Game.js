var Player = require('./Player'),
	Functions = require('./Functions');

module.exports = function($arena){
	var self = this;

	var player1, player2;

	this.createListOfShips = function(){
		var $list = $("<div/>", {class: "choice"}),
			ships = player1.Field.Ships.getAll();

		for(var i in ships){
			(function(i){
				var fixPos = {x:0, y:0};

				ships[i].$.draggable({
					start: function(ev, ui){
						var left = parseInt($(this).css('left'),10),
							top = parseInt($(this).css('top'),10);

						fixPos.x = (isNaN(left) ? 0 : left) - ui.position.left;
						fixPos.y = (isNaN(top) ? 0 : top) - ui.position.top;
						player1.Field.deleteShip(i); //unregisters ship
					},
					drag: function(ev, ui){
						ui.position.left += fixPos.x;
						ui.position.top += fixPos.y;

						player1.Field.setCollider(i, ui);
					},
					stop: function(ev, ui){
						player1.Field.setShip(i, ui);
						player1.Field.hideCollider();
					}
				}).dblclick(function(){player1.Field.Ships.rotate(i)}).appendTo($list);
			})(i);
		}

		return $list;
	}

	this.prepareArena = function(){
		player1.Field.$.removeClass("start");
		player1.Field.Ships.disbaleDragging();
		$arena.find("> *").not(player1.Field.$).remove();
		$arena.append(
			player2.Field.$.addClass("start enemy-field").append(
				$("<div/>", {class:"marker"})
			).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
				$(this).removeClass("start");
			})
		);
		player1.addLabel(); player2.addLabel(); player2.addDamagedShips();
	}

	this.play = function(){
		if(!this.checkShipsBeforeStart()) return alert("Sprawdź jeszcze raz ustawienie swoich statków!");

		this.prepareArena();

		if(!player1.move && !player2.move){
			switch(Functions.getRandom(0,1)){
				case 0: player1.move = true; break;
				case 1: player2.move = true; break;
			}
		}

		this.gameLoop(true);
	}

	this.checkShipsBeforeStart = function(){
		if(!player1.Field.update()) return false;

		var ships = player1.Field.Ships.getAll();
		for(var i in ships){
			if(!player1.Field.checkCollider(ships[i])) return false;
		}
		return true;
	}

	this.gameLoop = function(initData){
		if(player1.move){
			if(initData!==true){
				var a = player1.attack(initData);
				if(!a) return player2.giveRound(self.gameLoop, player1.Field.$);
				if(player2.isAI()) player2.AI.analyze(a);
			}
			if(self.detectEnd()) return;
			player1.giveRound(self.gameLoop, player2.Field.$);
			player1.move = false;
			player2.move = true;
		} else if(player2.move){
			if(initData!==true){
				if(!player2.attack(initData)) return player1.giveRound(self.gameLoop, player2.Field.$);
			}
			if(self.detectEnd()) return;
			player2.giveRound(self.gameLoop, player1.Field.$);
			player1.move = true;
			player2.move = false;
		}
	}

	this.detectEnd = function(){
		if(player1.gameOver) return this.gameOver(player2.getPlayer(), player2.moves);
		else if(player2.gameOver) return this.gameOver(player1.getPlayer(), player1.moves);
		return false;
	}

	this.playAgain = function(){
		this.init();
	}

	this.gameOver = function(winner, moves){
		$arena.empty().append(
			$("<div/>", {class: "gameover"}).append(
				$("<h3/>", {text: "Koniec gry!"})
			).append(
				$("<span/>", {text: "Zwyciężył(a)"})
			).append(
				$("<h3/>", {text: winner.name, class: "winner "+ (winner.type===0 ? "me" : "enemy")})
			).append(
				$("<span/>", {class: "winmoves", text: "W "+ moves +" ruchach"})
			).append(
				$("<div/>", {class: "button playagain"}).append(
					$("<span/>", {text: "Zagraj ponownie", "data-text": "Zagraj ponownie"})
				).click(this.playAgain.bind(this)).after("<br/>")
			)
		);

		return true;
	}

	this.init = function(){
		player1 = new Player({name: "Gracz 1", type: 0});
		player2 = new Player({name: "Komputer", AI: true, type: 1});

		$arena.empty().append(
			player1.Field.$.addClass("my-field start").append(
				$("<div/>", {class: "collider"})
			)
		).append(this.createListOfShips()).append(
			$("<div/>", {class: "button set-randomly"}).append(
				$("<span/>", {text: "Ustaw losowo", "data-text": "Ustaw losowo"})
			).click(player1.Field.setShipsRandomly.bind(player1.Field))
		).append(
			$("<div/>", {class: "button start-game disabled"}).append(
				$("<span/>", {text: "Start!", "data-text": "Start!"})
			).click(this.play.bind(this))
		)
	}
};