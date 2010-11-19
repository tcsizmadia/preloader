dojo.provide("ttcon.image.Preloader");
dojo.require("ttcon.image._loaderGroup");
// summary:
//			Advanced image preloader
// description:
//			This preloader fires an event, when an image is loaded, providing the number of
//			remaining images.
dojo.declare("ttcon.image.Preloader", null, {
	constructor: function(){
		this._numOfImages = 0;
		this._numImagesLoaded = 0;
		this._contexts = [];
		
		dojo.subscribe("preloader/preload-context", this, this._preload);
		dojo.subscribe("preloader/image-added", this, function(){
			this._numOfImages++;
		});
		
		return this;
	},
	addContext: function(/*String*/ newContext){
		// summary:
		//		Creates a context (an image._loaderGroup, technically) and associates it with
		//		the preloader.
		// description:
		//		You can call this method when a new preload-context is required. A context is
		//		used to group images and preloading-tasks together. Using this technique it is
		//		possibe to trigger code when a specified kind of images are preloaded, for example.
		// returns: Object
		//		Returns an image._loaderGroup object for further reference.
		var context = new ttcon.image._loaderGroup({ context: newContext });
		this._contexts.push(context);
		 
		return context;		
	},
	_preloadOne: function(/*String*/ imageSource, /*int*/ imageIndex, /*Object*/context){
		// summary:
		//		Preloads a specified image from a specified context.
		// description:
		//		Places a temporary image in the DOM and connects to it's events to 
		//		handle the further processing.
		// image: Object
		//		The temporary image node. After the image is loaded, the method will destroy 
		//		it gracefully.
		// tags:
		//		private
		
		var numOfImages = context.get("total");
		var contextName = context.get("context");
	
		dojo.publish("preloader/" + contextName + "/image-loading", [{
			current: imageIndex + 1,
			total: numOfImages,
			src: imageSource
		}]);
		
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
			var imagesLoaded = context.get("loaded") + 1;
			
			dojo.publish("preloader/" + contextName + "/image-loaded", [{
				current: imagesLoaded,
				total: numOfImages,
				src: image.src
			}]);

			if(imagesLoaded == numOfImages){
				dojo.publish("preloader/" + contextName + "/done", [{
					total: imagesLoaded
				}]);
			}
			
			if(++this._numImagesLoaded == this._numOfImages){
				dojo.publish("preloader/done", [{
					total: this._numImagesLoaded
				}]);
			}
			 
			dojo.destroy(image);
		});
	},
	_preload: function(context){
		// summary:
		// 		Invoke the preloading mechanism.
		// description:
		//		You should call this method, when every image has been added to the queue,
		//		and ready to do the work (in the background). The module will add invisible
		//		images to the DOM and triggers the corresponding event when it is loaded.
		//		After that, the temporary image will be destroyed.
		// tags:
		//		private
		dojo.forEach(context.get("images"), function(item, idx){
			this._preloadOne(item, idx, context);
		}, this);
	},
	clear: function(/*String*/ context){
		// summary:
		//		Clears the queue of images
		// description:
		//		Removes every src attribute from the queue, so the module will be
		//		ready for preloading another bunch of images.
		// returns: Boolean
		//		Always true
		this._numOfImages = 0;
		this._numImagesLoaded = 0;
		this._currentImage = 0;
		
		dojo.publish("preloader/clear", []);
		
		return true;
	}
});