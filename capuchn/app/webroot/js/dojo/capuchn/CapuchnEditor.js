if (!dojo._hasResource["capuchn.CapuchnEditor"]) { //_hasResource checks added by build. Do not use _hasResource directly in your code.
	dojo._hasResource["capuchn.CapuchnEditor"] = true;
	dojo.provide("capuchn.CapuchnEditor");
	dojo.require("dijit.Editor");
	dojo.require("dijit.InlineEditBox");
	dojo.require("dojo.dnd.Source");
	dojo.require("dijit._editor.plugins.AlwaysShowToolbar");
	dojo.require("dijit.form.FilteringSelect");
	//dojo.require("dojox._editor.plugins.EditorImageDialog");
	dojo.require("dijit._editor.plugins.ImageDialog");

dojo.declare("capuchn.CapuchnEditor", dijit.Editor, {
		
		//Extending this widget to provide a complete
		//widget to edit and save 
		
		itemname: "Type name here",
		itemid: null,
		itemtype: null,
		volumeid: null,
		volumestore: "volumeStore",
		volumeselect: null,
		saveUrl: "mags/editor",
		nameObj: null,
		/*
		constructor: function(){
			this.extraPlugins = [
				'dijit._editor.plugins.AlwaysShowToolbar',
				'dojox._editor.plugins.EditorImageDialog',
				'dijit._editor.plugins.LinkDialog'
				];
		},
		*/
		
		postCreate: function(){
			this.inherited(arguments);
		
			var nameDom = dojo.doc.createElement("span");
			nameDom.innerHTML = "name here";
			nameDom.style.width = "10em";
			var nameDij = new dijit.InlineEditBox({width:"10em"},nameDom);
			this.toolbar.addChild(nameDij);
			
			
			this.volumestore = dijit.byId("volumeStore");
			
			this.nameObj = nameDij;
			var volSelect = dojo.doc.createElement("input");
			this.volumeselect = new dijit.form.FilteringSelect({store:popStore,query: {type:"volume"},name:"volumeselect"},volSelect);
			if(this.volumeid != null){				
				popStore.fetch({
					query:{id:"v-"+this.volumeid},
					onComplete:dojo.hitch(this,this.setVolume)
				});
			}
			this.toolbar.addChild(this.volumeselect );			
			
			this.volumeselect.onChange = dojo.hitch(this,this.changeVolume);
			//TODO: drop down menu for volumes
			//TODO: add save button
			//this.iframe.parentNode.style.border = "1px solid";
			//dndtarget = new dojo.dnd.Source(this.iframe.parentNode);
			//dndtarget.startup();
			console.debug(this.iframe);
			this.addKeyHandler('h',this.KEY_CTRL,this.insertText);
			
			
		},
		
		insertText: function(){
			var nNode = dojo.doc.createElement("div");
			nNode.innerHTML = "This is new text";
			this.editNode.appendChild(nNode);
		},
		
		changeVolume: function(value){
		
			var vals = value.split("-");
			if(vals.length >1){
				this.volumeid = vals[1];
				console.debug("volumeid changed to :"+ this.volumeid);
			}else{
				this.volumeid = value;
			}
		},
		
		//Returns an object with the variables that would have been in a form
		//	since there are multiple data items, this will return them all in
		//	object form.
		getContent: function(){
		
			return {content:this.getValue(),id:this.itemid,name:this.nameObj.getValue(),volumeid:this.volumeid};
		},
		
		setVolume: function(){
		
			this.volumeselect.setDisplayedValue(arguments[0][0].name[0]);			
		},
		
		//resize is the implimentation of the new thing
		//	
		resize: function(size){
		
			//size is {l,t,w,h}
			//	not sure what l and t are
			console.debug(size);
			var availHeight = size.h;
			availHeight = availHeight - this.toolbar.domNode.clientHeight - 2;
			//console.debug(this.iframe.clientHeight);
			//console.debug(availHeight);
			
			this.iframe.style.height = availHeight+"px";
			//this.iframe.parentNode.syle.height = availHeight+"px"; //so dnd works
			//return true;
		},
		
		//uses the seturl function to send a request for data from the server
		//	will populate the form
		getData: function(){
	
			dojo.xhrPost({
		    	url: this.saveUrl,
				handleAs: "json-comment-filtered",
		 		load: dojo.hitch(this, setData),
		    	error: function(data, ioArgs){
		            console.debug("An error occurred: ", data);
	        	},
		    	timeout: 2000
			});
		},
		
		//How to save this form to the server
		//	need to connect the save button to this... somewhere
		save: function(){
			
			out = this.getContent();
			
			dojo.xhrPost({
				url: this.saveUrl,
				content:out,
				handleAs: "json-comment-filtered",
				load: dojo.hitch(this, this.saveResponse),
				error: function(data, ioArgs){
					console.debug("Error saving item");
				},
				timeout: 2000
			});
			//update tab name....

			
		},
		
		saveResponse: function(){
			
			console.debug(arguments);
			this.itemid = arguments[0].savedata.Mag.id;
			this.volumeid = arguments[0].savedata.Volume.id;
			parentId = this.domNode.parentNode.id;
			dijParent = dijit.byId(parentId);
			console.debug(dijParent);
			if(dijParent != undefined){
				dijParent.controlButton.containerNode.innerHTML = arguments[0].savedata.Mag.header + " - ( "+ this.itemid +" )";
			}
			dojo.publish("serverResponse", arguments);
		},
		
		//Takes a object with the following parameters
		//	content - main content
		//	id - the id of the item
		//	name - the name of the item
		//	 - more?
		setData: function(responseObj){
		
			//Object
			console.debug("setData: ", arguments );
			this.setValue(responseObj.content);
			this.nameObj.setValue(responseObj.name);
			this.itemid = responseObj.id;			
		},
		
	});
}
