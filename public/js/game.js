game = new Game();

function imageRepository() {
	this.images = [];

	var numLoaded = 0;
	var numImages = 0;

	function imageLoaded() {
		numLoaded++;
		p = numLoaded/numImages * 100;
		site.loading(p);
		if(numLoaded == numImages) {
			window.setTimeout(function(){
				site.doneLoading();
			}, 1000);
		}
	}

	for(var key in site.ap.atlases) {
		var p = '/res/'+key+'.png';
		numImages++;
		this.images[key] = new Image();
		this.images[key].onload = function() {
			imageLoaded();
		}
		this.images[key].src = p;
	}
}

function Drawable() {
	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	this.canvasWidth = 0;
	this.canvasHeight = 0;

	this.draw = function() {
	}

	this.move = function() {
	}
}

function Game() {
	this.init = function() {
		this.imageRepository = new imageRepository();

		this.canvas = {
			grid : document.getElementById('grid'),
			background : document.getElementById('background'),
			enemy : document.getElementById('enemy'),
			player : document.getElementById('player'),
			foreground : document.getElementById('foreground')
		}

		if(this.canvas.background.getContext) {
			this.context = {
				grid : this.canvas.grid.getContext('2d'),
				background : this.canvas.background.getContext('2d'),
				enemy : this.canvas.enemy.getContext('2d'),
				player : this.canvas.player.getContext('2d'),
				foreground : this.canvas.foreground.getContext('2d'),
				actual : null
			}

			this.context.actual = this.context.background;
		}


		return true;
	}
}