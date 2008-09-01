if(!dojo._hasResource["capuchn.TextEditor"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["capuchn.TextEditor"] = true;
dojo.provide("capuchn.TextEditor");

dojo.require("dijit.form.Button");
dojo.require("dijit.Toolbar");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");

dojo.declare(
	"capuchn.TextEditor",
	[dijit.layout.ContentPane, dijit._Templated],
{
	title: "",
	
	/* Text Editr template
	<div class=\"${baseClass}\" dojoAttachPoint=\"containterNode\">
		<div dojoAttachPoint=\"toolbar\" dojoType="dijit.Toolbar">
			<div dojoType="dijit.form.Button" dojoAttachPoint=\"saveButton\" iconClass="dijitEditorIcon dijitEditorIconSave" showLabel="false">
        	    Save
        	 </div>
			 <div dojoType="dijit.form.Button" dojoAttachPoint=\"refreshButton\" iconClass="dijitEditorIcon dijitEditorIconRedo" showLabel="false">Refresh</div>
   		</div>
		<textarea name=\"textContent\" dojoAttachPoint=\"textBox\">${content}</textarea>
	</div>,
	*/
	
	templateString: "<div class=\"${baseClass}\" dojoAttachPoint=\"outerNode\"><div dojoAttachPoint=\"toolbar\" dojoType=\"dijit.Toolbar\"><div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"saveButton\" iconClass=\"dijitEditorIcon dijitEditorIconSave\" showLabel=\"false\">Save</div><div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"refreshButton\" iconClass=\"dijitEditorIcon dijitEditorIconRedo\" showLabel=\"false\">Refresh</div></div><textarea name=\"textContent\" dojoAttachPoint=\"containerNode\"></textarea></div>",
	
	baseClass:"baseclass",
	saveUrl: "",
	refreshUrl: "",
	saveTemplate: {id:"", name:"", content:""},
	//toolbar: "",
	widgetsInTemplate: true,
	textname: "",
	nameTextBox: "",
	nameRegEx: "[\\w]+",
	nameInvalidMessage: "Invalid Non-Space Text.",
	textId: "",
	textPart: "",
	refreshOnShow: false,
	doLayout:false,
	addedForm: [],
	contentObject: {},
	helpUrl: "",
	
	postCreate: function(){
		this.inherited(arguments);
		this.saveButton.onClick = dojo.hitch(this, this.save);
		this.refreshButton.onClick = dojo.hitch(this, this.refresh);
		
		this.containerNode.style.width = "100%";
		this.containerNode.style.height = "100%";
		if(this.helpUrl != ""){
			this.helpButton = new dijit.form.Button({iconClass:"dijitEditorIcon dijitEditorIconHelp", showLabel:false});
			//<div dojoType="dijit.form.Button" dojoAttachPoint=\"refreshButton\" iconClass="dijitEditorIcon dijitEditorIconRedo" showLabel="false">Refresh</div>
			this.toolbar.addChild(this.helpButton);
			this.helpButton.onClick = dojo.hitch(this, this.helpwindow);
		}
		if(this.textname != null){
			console.debug(this.nameRegEx);
			this.nameTextBox = new dijit.form.ValidationTextBox({value:this.textname,regExp:this.nameRegEx,invalidMessage:this.nameInvalidMessage});
			//this.nameTextBox = new dijit.form.TextBox({});
			this.nameTextBox.setValue(this.textname);
			this.toolbar.addChild(this.nameTextBox);	
			this.nameTextBox.startup();	
		}

		
	},
	
	refresh: function(){
		this.inherited(arguments);
	},
	
	save: function(){		
		out = this.getContent();
			
		dojo.xhrPost({
			url: this.saveUrl||this.href,
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
	
	helpwindow: function(){
		if(Capuchn.newtab != undefined){
			Capuchn.newtab(this.helpUrl,'helpwindow'+this.textname,'Help');
		}
	},
	
	saveResponse: function(){
		//consider checking response in, so.. reload page data
		
		//saveResonse should return the same response as the reload function, so 
		this._setContent(arguments[0]);
		
		dojo.publish("serverResponse", arguments);
	},
	
	resize: function(size){
			var availHeight = size.h;
			if (this.toolbar) {
				//resize gets called on close, make sure that we still have toolbar
				availHeight = availHeight - this.toolbar.domNode.clientHeight - 8;
			}
			if (this.containerNode) {
				this.containerNode.style.height = availHeight + "px";
				this.containerNode.style.width = (size.w-4) + "px";
			}
	},
	
	//this grabs the json string and puts the contents into the boxes...
	_setContent: function(content){
	/*{"id":"666","part":"style","content":"my mother was a pebble","name":"testname"}*/

		console.debug("typeof conent: " + typeof(content));
		if (typeof(content) == "string") {
			var value = content;
			var cStartIdx = value.indexOf("\/*");
			var cEndIdx = value.lastIndexOf("*\/");
			var cont;
			if ((cStartIdx == -1) || (cEndIdx == -1)) {
				cont = dojo.fromJson(content);
			}
			else {
				eval("cont = " + value.substring(cStartIdx + 2, cEndIdx));
			}
		}else{
			var cont = content;
		}
		//if status was not defined, then do not die - we dont return status on init
		if (typeof(cont['status']) != "undefined") {
			if (!cont['status']) {
				//probably do something here.... but, just dont reload the data
				console.debug(cont['message']);
				return;
			}else{
				console.debug("status is defined and true");
			}
		}
		
		this.contentObject = cont;
		if(cont.name && (cont.name != "")){
			this.nameTextBox.setValue(cont.name);
			this.textname = cont.name;
		}
		
		for(var i=0; i<this.addedForm.length; i++){
			console.debug("i = "+i);
			var crName = this.addedForm[i].name;
			console.debug("crName "+crName);
			console.debug(cont);
			if(typeof(cont[crName]) != "undefined"){
				console.debug("found a return value for a post defined field(addedForm)["+cont[crName]+"]");
				this.addedForm[i].widget.setValue(cont[crName]);
			}
		}
		
		this.containerNode.value = cont.content;
		this.textId = cont.id;
		this.textPart = cont.part;
	},
	
	addFormWidget: function(frmWidget, savename){
		//take a widget and add it to the toolbar, throw the value
		this.addedForm.push({widget:frmWidget,name:savename});
		
		//var label = dojo.doc.createElement("div");
		//label.className = "toolbarlabel";
		//label.innerHTML = "candid";
		
		var tt = new dijit.Tooltip({label:savename,connectId: frmWidget.id});
		
		
		this.toolbar.addChild(frmWidget);
		
		//check if there is a value defined in the local content
		//since the editor may get the data loaded before the field is defined. check and see if 
		// we can go ahead and grab contents for he widget/form element.
		
		if(typeof(this.contentObject[savename]) != "undefined"){
			console.debug("found a return value for a post defined field(addFormWidget) ["+this.contentObject[savename]+"]");
			
			frmWidget.setValue(this.contentObject[savename]);			
		}
		
		
	},
	
	getContent: function(){
		console.debug("TextEditor.getContent should verify values");
		this.saveTemplate.id = this.textId;
		this.saveTemplate.part = this.textPart;
		this.saveTemplate.name = this.nameTextBox.getValue();
		this.saveTemplate.content = this.containerNode.value;
		
		for(var i=0; i < this.addedForm.length; i++){
			this.saveTemplate[this.addedForm[i].name]=this.addedForm[i].widget.getValue();
		}
		return this.saveTemplate;
	}
	
});

}
