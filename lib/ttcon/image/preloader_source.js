dojo.provide("ttcon.image.preloader");
// summary:
//			Advanced image preloader
// description:
//			This preloader fires an event, when an image is loaded, providing the number of
//			remaining images.
dojo.declare("ttcon.image.preloader", null, {
	constructor: function(/*String[]?*/ images){
		this.VERSION = "0.1.1";
		this._images = [];
		this._numOfImages = 0;
		this._numImagesLoaded = 0;
		this._currentImage = 0;
		
		if (dojo.isArray(images)){
			this.add(images);
		}
		
		return this;
	},
	_addImage: function(/*String*/ image){
		// summary:
		//		Adds an image to the queue.
		// description:
		//		Adds an image to the end of the queue and increments the number of total images.
		if (dojo.isString(image)){
			this._images.push(image);
			this._numOfImages++;
		}
	},
	_preloadOne: function(/*String*/ imageSource, /*int*/ imageIndex){
		// summary:
		//		Preloads a specified image in the queue.
		// description:
		//		Places a temporary image in the DOM and connects to it's events to 
		//		handle the further processing.
		var image = dojo.create("img", {
			id: "pre" + imageIndex,
			src: imageSource,
			style: {
				position: "absolute",
				left: "-9999px",
				top: "0px"
			}
		}, dojo.body(), "last");
		
		dojo.connect(image, "onload", this, function(){
			this.onImageLoaded({
				current: ++this._numImagesLoaded,
				total: this._numOfImages,
				src: image.src
			});
			
			if (this._numImagesLoaded == this._numOfImages){
				this.onPreloadDone({ total: this._numImagesLoaded });
			}
			
			dojo.destroy(image);
		});
	},
	onImageLoaded: function(/*Object*/ results){
		// summary: 
		// 		Triggered when one image has been preloaded.
		// tags:
		//		callback
		// results: Object
		//		current: the index of the currently loaded image
		//		total: number of the images
		//		src: the currently loaded image's src attribute
	},
	onPreloadDone: function(/*int*/ results){
		// summary: 
		//		Triggered when ALL of the images has been preloaded.
		// tags:
		//		callback
		// results: Object
		//		total: the number of the images preloaded
	},
	add: function(/*String[]|String*/ images){
		// summary: 
		//		Add image(s) to the queue.
		// description:
		//		This method adds an array of images or just one image to the queue.
		//		Every image is represented by it's src attribute. The method implements the
		//		fluent interface so it is possible to chain add methods together.
		// returns: Object
		//		For the fluent interface.
		if (dojo.isArray(images)){
			dojo.forEach(images, this._addImage, this);
		}else{
			this._addImage(images);
		}
		
		return this;
	},
	preload: function(){
		// summary:
		// 		Invoke the preloading mechanism.
		// description:
		//		You should call this method, when every image has been added to the queue,
		//		and ready to do the work (in the background). The module will add invisible
		//		images to the DOM and triggers the corresponding event when it is loaded.
		//		After that, the temporary image will be destroyed.
		// returns: Object
		//		For the fluent interface.
		dojo.forEach(this._images, this._preloadOne, this);
		
		return this;
	},
	clear: function(){
		// summary:
		//		Clears the queue of images
		// description:
		//		Removes every src attribute from the queue, so the module will be
		//		ready for preloading another bunch of images.
		// returns: Boolean
		//		Always true
		this._images = [];
		
		return true;
	}
});