module.exports = new (function () {
	this.getRandom = function(min, max) {
		return Math.floor(Math.random()*(max-min+1)+min);
	}

	/*this.variety = function(number, a, b, c){
		number = Math.abs(number);
		if (number === 1) return number+" "+a;
		var rest10 = number % 10;
		var rest100 = number % 100;
		if (rest10 > 4 || rest10 < 2 || (rest100 < 15 && rest100 > 11)) return number+" "+c;
		return number+" "+b;
	}*/
})();