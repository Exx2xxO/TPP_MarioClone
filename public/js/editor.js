editor = new Editor();

function imageRepository() {
	this.images = {};

	this.init = function(atlases, callback) {
		var numLoaded = 0;
		var numImages = 0;

		function imageLoaded() {
			numLoaded++;
			var percent = numLoaded/numImages * 100;
			site.loading(percent);
			if(numLoaded === numImages) {
				window.setTimeout(function() {
					if(callback) callback(site.doneLoading);
				}, 1000);
			}
		}

		for(var list in atlases) {
			numImages++;
			var img = '/res/'+list+'.png';
			this.images[list] = new Image();
			this.images[list].onload = function() {
				imageLoaded();
			}
			this.images[list].src = img;
		}
	}
}

function Drawable() {
	this.init = function(onScreenX, onScreenY, onScreenW, onScreenH) {
		this.onScreenX = onScreenX;
		this.onScreenY = onScreenY;
		this.onScreenW = onScreenW;
		this.onScreenH = onScreenH;
	}

	this.draw = function() {
	}

	this.move = function() {
	}

	this.remove = function() {
	}
}

function EditorDrawable() {
	this.item = null;
	this.image = null;
	this.cell = null;
	this.context = null;

	this.init = function(list, item) {
		this.item = item;
		this.image = editor.imageRepository.images[list];
	}

	this.setContext = function(context) {
		this.context = context;
	}

	this.setCell = function(cell) {
		this.cell = cell;
		this.onScreenX = this.cell.onScreenX;
		this.onScreenY = this.cell.onScreenY;
	}

	this.draw = function() {
		this.context.drawImage(this.image, this.item.x, this.item.y, this.item.w, this.item.h, this.onScreenX, this.onScreenY, editor.grid.tileWidth, editor.grid.tileHeight);
	}

	this.move = function(x,y) {
		var onScreenXY = editor.grid.gridToScreenCoords(x,y);
		this.remove();
		this.onScreenX = onScreenXY[0];
		this.onScreenY = onScreenXY[1];
		this.draw()
	}

	this.remove = function() {
		this.context.clearRect(this.onScreenX, this.onScreenY, editor.grid.tileWidth, editor.grid.tileHeight);
	}
}
EditorDrawable.prototype = new Drawable();

function GridElement() {

	this.init = function(x,y, onScreenX, onScreenY, parent) {
		this.x = x;
		this.y = y;
		this.item = null;
		this.onScreenX = onScreenX;
		this.onScreenY = onScreenY;
		this.parent = parent;
	}

	this.addItem = function(item, context) {
		this.item = item;

		this.item.setContext(context);
		this.item.setCell(this);
		this.item.draw();
	}

	this.removeItem = function() {
		if(this.item) {
			this.item.remove();
			this.item.setCell(null);
			this.item = null;
		}
	}

	this.changeItem = function(item) {
		this.removeItem();
		this.addItem(item, item.context);
	}

	this.getX = function() {
		return this.x;
	}

	this.getY = function() {
		return this.y;
	}

	this.getXY = function() {
		var e = [];
		e[0] = this.getX();
		e[1] = this.getY();

		return e;
	}

	this.isSet = function() {
		if(this.item) {
			return true;
		} else {
			return false;
		}
	}

	this.draw = function() {
		if(this.isSet()) this.item.draw();
	}

	this.inBound = function(mouseX, mouseY) {
		if((mouseX => this.onScreenX)&&(mouseX <= (this.onScreenX + this.parent.tileWidth))&&(mouseY => this.onScreenY)&&(mouseY <= (this.onScreenY + this.parent.tileHeight))) {
			return true;
		} else {
			return false;
		}
	}

	this.move = function(x,y) {
		var onScreenXY = this.parent.gridToScreenCoords(x,y);
		this.item.move(onScreenXY[0],onScreenXY[1]);
	}
}

function Grid() {
	this.init = function(width, height, tileWidth, tileHeight) {
		this.width = width;
		this.height = height;
		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;

		this.gridElements = [[]];

		for(var y = 0; y < this.height; y++) {
			this.gridElements[y] = [];
			for(var x = 0; x < this.width; x++) {
				var ge = new GridElement();
				ge.init(x, y, (this.tileWidth*x), (this.tileHeight*y), this);
				this.gridElements[y][x] = ge;
			}
		}

		return true;
	}

	this.addGridItem = function(x,y,item,context) {
		if(x < this.width) {
			if(this.gridElements[y][x].isSet()) {
				x++;
				this.addGridItem(x,y,item,context);
			} else {
				this.gridElements[y][x].addItem(item, context);
				return true;	
			}
		} else if(y < this.height) {
			x = 0;
			y++;
			this.addGridItem(x,y,item,context);
		} else {
			return false;
		}
	}

	this.removeGridItem = function(x,y) {
		if(this.gridElements[y][x].isSet()) this.gridElements[y][x].removeItem();
	}

	this.getGridElement = function(x,y) {
		return this.gridElements[y][x];
	}

	this.drawGrid = function() {
		var c = editor.context.grid;
		c.beginPath();
		c.rect(0,0, this.width*this.tileWidth, this.height*this.tileHeight);
		c.stroke();
		c.closePath();

		for(var y = 1; y < this.height; y++) {
			var minX = this.gridToScreenCoords(0,y);
			var maxX = this.gridToScreenCoords(this.width-1, y);

			c.beginPath();
			c.moveTo(minX[0], minX[1]);
			c.lineTo(maxX[0]+this.tileWidth, maxX[1]);
			c.stroke();
			c.closePath();
		}

		for(var x = 1; x < this.width; x++) {
			var minY = this.gridToScreenCoords(x, 0);
			var maxY = this.gridToScreenCoords(x, this.height-1);

			c.beginPath();
			c.moveTo(minY[0], minY[1]);
			c.lineTo(maxY[0], maxY[1]+this.tileHeight);
			c.stroke();
			c.closePath();
		}
	}

	this.drawElements = function() {
		for(var y = 0; y < this.height; y++) {
			for(var x = 0; x < this.width; x++) {
				this.gridElements[y][x].draw();
			}
		}
	}

	this.undrawElements = function() {

	}

	this.redrawElements = function() {
		this.removeElements();
		this.drawElements();
	}

	this.screenToGridCoords = function(onScreenX, onScreenY) {
		for(var y = 0; y < this.height; y++) {
			for(var x = 0; x < this.width; x++) {
				if(this.gridElements[y][x].inBound(onScreenX, onScreenY)) {
					var xy = [x,y];
					return xy;
				}
			}
		}

		return false;
	}

	this.gridToScreenCoords = function(x,y) {
		var onScreenXY = [this.gridElements[y][x].onScreenX, this.gridElements[y][x].onScreenY];
		return onScreenXY;
	}

	this.getWidth = function() {
		return this.width;
	}

	this.getHeight = function() {
		return this.height;
	}

	this.getTileW = function() {
		return this.tileWidth;
	}

	this.getTileH = function() {
		return this.tileHeight;
	}
}

function ItemPool() {
	this.pool;

	this.init = function(atlases) {
		this.atlases = atlases;
		this.pool = {};
		editor.imageRepository.init(atlases, this.initPool);
	}

	this.initPool = function(callback) {
		for(var list in editor.itemPool.atlases) {
			editor.itemPool.pool[list] = {};
			for(var name in editor.itemPool.atlases[list]) {
				editor.itemPool.pool[list][name] = new EditorDrawable();
				editor.itemPool.pool[list][name].init(list, editor.itemPool.atlases[list][name]);
			}
		}

		if(callback) callback();
	}

	this.getItem = function(list, name) {
		return this.pool[list][name];
	}
}

function Editor() {
	this.init = function() {
		this.itemPool = new ItemPool();
		this.imageRepository = new imageRepository();

		this.socket = io.connect('');
		this.socket.emit('getAtlas');
		this.socket.on('sendAtlas', function(data){
			editor.itemPool.init(data);
		});

		this.listener = new Listener();
		this.snap = new SnapSystem();

		this.canvas = {
			grid : document.getElementById('grid'),
			background : document.getElementById('background'),
			foreground : document.getElementById('foreground')
		}

		this.context = {
			grid : this.canvas.grid.getContext('2d'),
			background : this.canvas.background.getContext('2d'),
			foreground : this.canvas.foreground.getContext('2d')
		}

		this.grid = new Grid();
		this.grid.init(32, 18, 25, 25);

		this.grid.drawGrid();
		this.canvas.foreground.addEventListener('click', function(e) {
			mouseFinder(e, editor.canvas.foreground, editor.listener.canvasClick);
		}, false);

		this.canvas.foreground.addEventListener('mousemove', function(e) {
			mouseFinder(e, editor.canvas.foreground, editor.listener.canvasMove);
		}, false);

		this.context.actual = this.context.background;
	}

	this.addElementToGrid = function(list, name) {
		var item = this.itemPool.pool[list][name];
		if(this.grid.addGridItem(0,0,item,this.context.actual)) {
			this.grid.drawElements();
		}
	}
}

function Listener() {

	this.mouseHistory = {
		lastClick : Object,
		click : Object,
		lastPos : Object,
		newPos : Object,
		button : Number
	};

	this.canvasClick = function(mouse) {
		var self = editor.listener;

		if(self.mouseHistory.click) self.mouseHistory.lastClick = self.mouseHistory.click;
		self.mouseHistory.click = mouse;

		editor.snap.checkForChange();
	}

	this.canvasMove = function(mouse) {
		if(editor.snap.snapCache) {
			var self = editor.listener;		
			var xy = editor.grid.screenToGridCoords(mouse.x, mouse.y);
			console.log('GridCOORD: '+xy[0]+', '+xy[1]+' ScreenCOORD: '+mouse.x+', '+mouse.y);

			self.mouseHistory.lastPos = (self.mouseHistory.lastPos.x) ? self.mouseHistory.newPos.x : -1;
			self.mouseHistory.lastPos = (self.mouseHistory.lastPos.y) ? self.mouseHistory.newPos.y : -1;

			self.mouseHistory.newPos.x = xy[0];
			self.mouseHistory.newPos.y = xy[1];

			if(self.mouseHistory.lastPos !== self.mouseHistory.newPos) editor.snap.move(xy[0], xy[1]);
		}
	}

}

function SnapSystem() {
	this.init = function() {
		this.snapCache = null;
	}

	this.checkForChange = function() {
		var m = editor.listener.mouseHistory;
		var actualXY = editor.grid.screenToGridCoords(m.click.x, m.click.y);
		var gridCell = editor.grid.getGridElement(actualXY[0], actualXY[1]);

		if(this.snapCache) {
			var oldItem = this.snapCache;
			if(gridCell.isSet()) {
				var newItem = gridCell.item;
				gridCell.changeItem(oldItem);

				this.snapCache = newItem;
			} else {
				gridCell.changeItem(oldItem);
				this.snapCache = null;
			}
		} else {
			if(gridCell.isSet()) {
				this.snapCache = gridCell.item;
				gridCell.removeItem();
			}
		}
		
	}

	this.fillCache = function(gridCell) {
		if(gridCell.isSet()) this.snapCache = gridCell;
	}

	this.clearCache = function() {
		this.snapCache = null;
	}

	this.move = function(x, y) {
		if(this.snapCache) this.snapCache.move(x, y);
	}

}

var mouseFinder = function(e, canvas, callback) {

	var mouse = {
		x : Number,
		y : Number
	};

	var x = 0;
	var y = 0;
	var rect = canvas.getBoundingClientRect();

	if(e.x != undefined && e.y != undefined) {
		x = e.x;
		y = e.y;
	} else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	mouse.x = Math.round(x - rect.left);
	mouse.y = Math.round(y - rect.top);

	if(callback) callback(mouse);
}

/*

function EditorElement() {
	this.item = null;

	this.init = function(context, screenX, screenY, screenWidth, screenHeight, listName, itemName) {
		
		for(var i = 0; i < site.ap.atlases[listName].length; i++) {
			if(site.ap.atlases[listName][i].filename == itemName) {
				this.item = site.ap.atlases[listName][i].frame;
				this.item.imageName = listName;
				break;
			}
		}

		this.screenX = screenX;
		this.screenY = screenY;
		this.screenWidth = ((screenWidth != -1) ? screenWidth : this.item.w);
		this.screenHeight = ((screenHeight != -1) ? screenHeight : this.item.h);
		this.context = context;
	}

	this.draw = function() {
		this.context.drawImage(game.imageRepository.images[this.item.imageName], this.item.x, this.item.y, this.item.w, this.item.h, this.screenX, this.screenY, this.screenWidth, this.screenHeight);
	}

	this.drawScaled = function(scaledW, scaledH) {
		if(scaledW && scaledH) {
			this.context.drawImage(game.imageRepository.images[this.item.imageName], this.item.x, this.item.y, this.item.w, this.item.h, this.screenX, this.screenY, scaledW, scaledH)
		}
	}

	this.move = function(x, y) {
		this.remove();

		this.screenX = x;
		this.screenY = y;
	}

	this.remove = function() {
		this.context.clearRect(this.screenX, this.screenY, this.screenWidth, this.screenHeight);
	}
}
EditorElement.prototype = new Drawable();

function EditorElementPool() {
	this.contextPools = {};

	this.init = function(contextPools) {
		for(var key in contextPools) {
			this.contextPools[key] = [];
		}
	}

	this.addElement = function(contextPool, element) {
		this.contextPools[contextPool].push(element);
	}
}




!!!!!!!!!!!!!!!!!!!!!!! highlight

		console.log('Checking for POS!');
		var mouse = mouseFinder(e, canvas);
		var minmax = {
			w : editor.grid.getMaxW(),
			h : editor.grid.getMaxH()
		}

		var highlighted = false;
		for(var y = 0; y < minmax.h; y++) {
			for(var x = 0; x < minmax.w; x++) {
				var pos = editor.grid.getPos(x,y);
				if( (pos.onScreenX < mouse.x) && ((pos.onScreenX+minmax.w) > mouse.x) && (pos.onScreenY < mouse.y) && ((pos.onScreenY+minmax.h) > mouse.y)) {
					console.log('Dafuq hab doch was....');
					editor.grid.highlightPos(x,y);
					highlighted = true;
					break;
				}
			}
			if(highlighted) break;
		}




*/