if(!dojo._hasResource["dijit._editor.plugins.ImageDialog"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._editor.plugins.ImageDialog"] = true;
dojo.provide("dijit._editor.plugins.ImageDialog");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._editor._Plugin");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("dojox.image.ThumbnailPicker");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.form.ComboBox");
dojo.requireLocalization("dijit._editor", "LinkDialog", null, "pt,ru,gr,ja,es,hu,zh,ROOT,zh-tw,de,fr,cs,it,pl,ko");

dojo.declare("dijit._editor.plugins.ImageDialog",
	dijit._editor._Plugin,
	{
		//	summary:
		//		This plugin provides dialogs for inserting images into the editior
		//
		//	description:
		//		* insertImage
		//		The current status: we need to to general cleanup and testing, everthing seems to be working as expected
		//		needs to be able to choose the album though...
		//		Nees a whole lot of tlc for the spinner size thing. probably removal
		

		buttonClass: dijit.form.DropDownButton,
		useDefaultCommand: false,
		//urlRegExp: "((https?|ftps?)\\://|)(([0-9a-zA-Z]([-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?\\.)+(arpa|aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|xxx|jobs|mobi|post|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|eu|es|et|fi|fj|fk|fm|fo|fr|ga|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sk|sl|sm|sn|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])))(\\:(0|[1-9]\\d*))?(/([^?#\\s/]+/)*)?([^?#\\s/]+(\\?[^?#\\s/]*)?(#[A-Za-z][\\w.:-]*)?)?",
		urlRegExp: ".",
		ImageDialogTemplate: [
			"<table><tr><td colspan=2>",
			"<div id='${id}_thumbPick' dojoType='dojox.image.ThumbnailPicker' size='300'></div>",
			"</td></tr><tr><td>",
			"<label for='${id}_urlInput'>${url}</label>",
			"</td><td>",
			"<input dojoType='dijit.form.TextBox' required='true' id='${id}_urlInput' name='urlInput'></input>",
			"</td></tr><tr><td>",
			"<label for='${id}_textInput'>${text}</label>",
			"</td><td>",
			"<input dojoType='dijit.form.TextBox' required='true' id='${id}_textInput' name='textInput'></input>",
			"</td></tr><tr><td>",
			"<label for='${id}_linkInput'>Link</label>",
			"</td><td>",
			"<input dojoType='dijit.form.TextBox' id='${id}_linkInput' name='linkInput' ></input>",			
			"</td></tr><tr><td>",
			"<label for='${id}_styleInput'>Class</label>",
			"</td><td>",
			"<select id='${id}_styleInput' dojoType='dijit.form.ComboBox' value='' name='styleInput'>",
			"<option value='left'>Float Left</option>",
			"<option value='right'>Float Right</option>",
			"<option value='top'>Top</option>",
			"<option value='bottom'>Bottom</option>",
			"</select>",
			"</td></tr><tr><td>",
			"<label for='${id}_widthInput'>Width</label>",
			"</td><td>",
			"</select>",
			"<input id='${id}_widthInput' name='widthInput' dojoType=\"dijit.form.NumberSpinner\" smallDelta=\"10\" constraints=\"{min:9,max:1550,places:0}\" maxlength=\"20\" />",
			"</td></tr><tr><td>",
			"<button dojoType='dijit.form.Button' type='submit'>Save</button>",
			"</td><td>",
			"<button dojoType='dijit.form.Button' type='cancel'>Cancel</button>",
			"</td></tr></table>"
		].join(""),
		
		imageStore: null,
		imageStoreUrl: "images/imageStore", //need to set this val from external... but I am not sure how I can...
		currImage:null,
		currLink:null,	
		width:null,
		height:null,
		
		_initButton: function(){
			
			var _this = this;
			
			var messages = dojo.i18n.getLocalization("dijit._editor", "LinkDialog", this.lang);
			
			var dropDown = (this.dropDown = new dijit.TooltipDialog({
				title: messages[this.command + "Title"],
				execute: dojo.hitch(this, "setValue"),
				onOpen: function(){
					_this._onOpenDialog();
					dijit.TooltipDialog.prototype.onOpen.apply(this, arguments);
				},
				onCancel: function(){
					setTimeout(dojo.hitch(_this, "_onCloseDialog"),0);
				},
				onClose: dojo.hitch(this, "_onCloseDialog")
			}));
			
			messages.urlRegExp = this.urlRegExp;
			
			messages.id = dijit.getUniqueId(this.editor.id);
			
			this._setContent(dropDown.title + "<div style='border-bottom: 1px black solid;padding-bottom:2pt;margin-bottom:4pt'></div>" + dojo.string.substitute(this.ImageDialogTemplate, messages));
			
			dropDown.startup();
			
			/* no dynamic updating
			this.widthSpinner = dijit.byId(messages.id+"_widthInput");
			this.widthSpinner.onChange = dojo.hitch(this, this.spinnerChange);
			
			this.styleMenu = dijit.byId(messages.id+"_styleInput");
			this.styleMenu.onChange = dojo.hitch(this, this.styleChange);
			*/
			//Redo all this stuff when we setEditor... and then get the url from the editor. that would 
			//be the only way to get that data
			
			this.thumbPick = dijit.byId(messages.id+"_thumbPick");
			dojo.subscribe(this.thumbPick.getClickTopicName(), dojo.hitch(this,this.selectImage));
			this.inherited(arguments);
		},

		_setContent: function(staticPanel){
			this.dropDown.setContent(staticPanel);			
		},

		setValue: function(args){
			// summary: callback from the dialog when user hits "set" button
			//TODO: prevent closing popup if the text is empty
			
			this._onCloseDialog();
			if(dojo.isIE){ //see #4151
				var a = dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, [this.tag]);
				if(a){
					dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [a]);
				}
			}
			
			//we want to check the form, 
			//if there is a link we need to add it to the selected bit, 
			
			console.debug(args);
			//using 3 templates for 3 optional cases
			var linkTemplate = "<a href=${link}>${content}</a>";
			var imgTemplate = "<img class='${styleInput}' src='${urlInput}' _djrealurl='${urlInput}' alt='${textInput}' ${size} />";
			var sizeTemplate = "width='${width}' height='${height}'";
			
			var imgobj = {};
			imgobj.urlInput = args.urlInput;
			imgobj.textInput = args.textInput;
			imgobj.size = "";
			imgobj.styleInput = args.styleInput;
			
			/*
			if(this.width){
				//height should also be set. and here is where we should modify
				var sizeobj = {};
				sizeobj.width = this.width;
				sizeobj.height = this.height;
				imgobj.size = dojo.string.substitute(sizeTemplate, sizeobj); 
			}
			*/
					
			var outString = dojo.string.substitute(imgTemplate, imgobj);
			
			if(args.linkInput != ""){
				console.debug("got link", args.linkInput);
				var linkobj = {};
				linkobj.link = args.linkInput;
				linkobj.content = outString;
				outString = dojo.string.substitute(linkTemplate, linkobj);
			}
			
			this.editor.execCommand('inserthtml',outString);
 		},
		
		_onCloseDialog: function(){
			console.debug("close");
			// FIXME: IE is really messed up here!!
			if(dojo.isIE){
				if("_savedSelection" in this){
					var b = this._savedSelection;
					delete this._savedSelection;
					this.editor.focus();
					this.editor._moveToBookmark(b);
				}
			}else{
				this.editor.focus();
			}
		},

		_onOpenDialog: function(){
			console.debug("open");
			var url, text, link, imgclass, width, height;
			
			var se = dojo.withGlobal(this.editor.window, "getSelectedElement", dijit._editor.selection);
			
			console.debug("selected elememnt : ", se);
			console.debug("this.tag ", this.tag);
		
			if (se) {
				//if we have an img selected, populate the form with the current data
				console.debug("selected: "+se.tagName);
				if(se.tagName == "A"){
					se = dojo.withGlobal(this.editor.window, "selectElementChildren", dijit._editor.selection, [se]);
					console.debug("selected children of a: "+se.tagName);
				}
				
				if (se.tagName == "IMG") {
					//We have an element that is selected and it appears to be an image.
					//Get the information to populate the form.
					//url, alt text, width, height, style.
					url = se.getAttribute('_djrealurl');
					text = se.getAttribute('alt');
					this.currImage = se; // will be used in callback
					//imgclass = se.getAttribute('class');
					imgclass = se.className;
					width = se.width;
					height = se.height;
					console.debug("image class: ", imgclass);
					//this.widthSpinner.setValue(width);
					//this.styleMenu.setValue(imgclass);
				}
			}
			
			//Check if this image is a link as well. 		
			var a = dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, ['a']);
			console.debug(a);
			if(a){
				this.currLink = a;				
				link = a.href;			
				//select the whole beast, want to make sure I rewrite this whole area
				dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [a, true]);
				console.debug("selected node: ", a);
			}
								
			// FIXME: IE is *really* b0rken
			if(dojo.isIE){
				this._savedSelection = this.editor._getBookmark();
			}
			
			//this.dropDown.reset();

			this.dropDown.setValues({urlInput: url || '', textInput: text || '', linkInput: link || '', widthInput: width || '', styleInput: imgclass || ''});
			
			this.imageStore = new dojo.data.ItemFileReadStore({url:this.imageStoreUrl});
			this.thumbPick.setDataStore(this.imageStore,{query:{},count:20},{imageThumbAttr: "thumb",imageLargeAttr:"large"});
			
			//dijit.focus(this.urlInput);
			console.debug("Open form done");
		},
		
		spinnerChange: function(){
			console.debug("SpinnerChange: ", arguments);
			//this.currImage.width = arguments[0];
			//get aspectRation
			if(arguments[0] == "")return;
			var ratio = this.currImage.width / this.currImage.height;
			console.debug("ration:", ratio);
			var newWidth = arguments[0];
			var newHeight = newWidth/ratio;
			this.width = newWidth;
			this.height = newHeight;
			this.currImage.width = this.width;//temp for display
			this.currImage.height = this.height;
			this.sizeDirty = true; // the size has been updated.		
		},
		
		styleChange: function(){
			console.debug("Wtf? ");
			console.debug("stylechange: ", arguments);
		},
		
		selectImage: function(packet){
			//alert(arguments);
			//+ "<br/><b>Index:</b> " + packet.index
			//+ "<br/><b>Url:</b> " + packet.url
			//+ "<br/><b>Large Url:</b> " + packet.largeUrl
			//+ "<br/><b>Title:</b> " + packet.title
			//+ "<br/><b>Link:</b> " + packet.link
			
			//instead of insert - update form
			//set the id of the image
			
			//get the image source dialog. 
			console.debug(packet.data.id[0]);
				
			console.debug("inserting image",packet);
			var htm = "<img src=\""+packet.url+"\" _djrealurl='"+packet.url+"' _djimageid='"+packet.id+"' alt=\""+packet.title+"\"></img>"; 
			this.editor.execCommand('inserthtml', htm);
			return true;
		}
		
		
		
		/*,

//TODO we don't show this state anymore
		updateState: function(){
			// summary: change shading on button if we are over a link (or not)

			var _e = this.editor;
			if(!_e || !_e.isLoaded){ return; }
			if(this.button){
				// display button differently if there is an existing link associated with the current selection
				var hasA = dojo.withGlobal(this.editor.window, "hasAncestorElement", dijit._editor.selection, [this.tag]);
				this.button.setAttribute('checked', hasA);
			}
		}
*/
	}
);

dojo.subscribe(dijit._scopeName + ".Editor.getPlugin",null,function(o){
	if(o.plugin){ return; }
	switch(o.args.name){
	case "createLink": case "insertImage":
		o.plugin = new dijit._editor.plugins.ImageDialog({command: o.args.name});
	}
});

}
