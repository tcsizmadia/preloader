dojo.provide("ttcon.image._loaderGroup");
dojo.declare("ttcon.image._loaderGroup", null, {
	constructor: function(/*Object*/ args){
		this._context = args.context || "default";
		this._images = args.images || [];
		this._numImagesLoaded = 0;
		
		dojo.subscribe("preloader/clear", this, this.clear);
	},
	_addImage: function(/*String*/ image){
		// summary:
		//		Adds an image to the queue.
		// description:
		//		Adds an image to the end of the queue and increments the number of total images.
		if(dojo.isString(image)){
			this._images.push(image);
			
			dojo.publish("preloader/image-added", []);
		}
	},
	add: function(/*String[]|String*/ images){
		// summary: 
		//		Add image(s) to the queue.
		// description:
		//		This method adds an array of images or just one image to the queue.
		//		Every image is represented by it's src attribute. The method implements the
		//		fluent interface so it is possible to chain add methods together.
		if(dojo.isArray(images)){
			dojo.forEach(images, this._addImage, this);
		}else{
			this._addImage(images);
		}
		
		return this;
	},
	preload: function(){
		dojo.publish("preloader/preload-context", [this]);
		dojo.subscribe("preloader/" + this.get("context") + "/image-loaded", this, this.imageLoaded);
	},
	get: function(what){
		// summary:
		//		Returns the properties of the group.
		// description:
		//		This method returns various properties of the group, depends on the what argument.
		//		If not specified, or invalid argument given, it returns all of the properties 
		//		as an object.
		// returns: Object|mixed
		//		The object contains the properties, or a specific property (usually String).
		switch(what){
			case "images":
				return this._images;
				break;
			
			case "context":
				return this._context;
				break;
				
			case "loaded":
				return this._numImagesLoaded;
				break;
				
			case "total":
				return this._images.length;
				break;
				
			default:
				var returnObject = {
					images: this._images,
					context: this._context,
					loaded: this._numImagesLoaded,
					total: this._images.length
				};
				
				return returnObject;
		}
	},
	imageLoaded: function(){
		this._numImagesLoaded++;
	},
	clear: function(){
		this._images = [];
		this._numImagesLoaded = 0;
	}
});