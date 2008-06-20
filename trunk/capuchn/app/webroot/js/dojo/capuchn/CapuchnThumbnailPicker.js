if (!dojo._hasResource["capuchn.CapuchnThumbnailPicker"]) { //_hasResource checks added by build. Do not use _hasResource directly in your code.
	dojo._hasResource["capuchn.CapuchnThumbnailPicker"] = true;
	dojo.provide("capuchn.CapuchnThumbnailPicker");
	//dojo.experimental("dojox.image.ThumbnailPicker");
	//
	// dojox.image.ThumbnailPicker courtesy Shane O Sullivan, licensed under a Dojo CLA 
	// @author  Copyright 2007 Shane O Sullivan (shaneosullivan1@gmail.com)
	//
	// For a sample usage, see http://www.skynet.ie/~sos/photos.php
	//
	//	document topics.
	dojo.require("dojox.image.ThumbnailPicker");
	
	dojo.declare("capuchn.CapuchnThumbnailPicker", dojox.image.ThumbnailPicker, {
		albumListStore: null,
		
		
		
		
		init: function(){
			this.inherited(arguments);
			console.debug(arguments);
		}
		
		
	
	});
}