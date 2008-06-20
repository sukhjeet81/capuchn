dojo.provide("dojox._editor.plugins.EditorImageDialog");
dojo.experimental("dojox._editor.plugins.EditorImageDialog");

dojo.require("dijit._editor.plugins.LinkDialog");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("dojox.image.ThumbnailPicker");

dojo.declare("dojox._editor.plugins.EditorImageDialog",
	dijit._editor.plugins.LinkDialog,
	{
		_initButton: function(props){
			props = dojo.mixin({
//				showLabel: true,
//				iconClass: "",
				dropDown: this.dropDown,
				tabIndex: "-1",
				parseWidgets: true
			}, props || {});
			this.inherited(arguments);
		},

		_setContent: function(staticPanel){
			//<div jsId="imageItemStore" dojoType="dojo.data.ItemFileReadStore" url="images.json"></div>
			/*
			this.dropDown.setContent(
				"<div dojoType='dijit.layout.TabContainer' id='abc' style='width: 600px; height: 320px;'>"+
					"<div id='tab1' dojoType='dijit.layout.ContentPane' title='Image Properties'>"
						+staticPanel+
					"</div>"+
					"<div id='tab2' dojoType='dijit.layout.ContentPane' title='Image Gallery'>"+
						"<div dojoType='dojox.image.ThumbnailPicker' size='500' useHyperlink='true' >"+
					"</div>"+
				"</div>"
				);
			*/
//			this.dropDown.startup();
			this.dropDown.setContent("<div dojoType='dijit.layout.TabContainer' id='abc' style='width: 600px; height: 320px;'><div id='tab1' dojoType='dijit.layout.ContentPane' title='Image Properties'>"+staticPanel+"</div><div id='tab2' dojoType='dijit.layout.ContentPane' title='Image Gallery'><div id='thumbPick' dojoType='dojox.image.ThumbnailPicker' size='500' useHyperlink='true' ></div></div>");

			var itemRequest = {
				query: {},
				count: 20
			};
			var itemNameMap = {
				imageThumbAttr: "thumb",
				imageLargeAttr: "large"
			};
			
			dijit.byId('thumbPick').setDataStore(capuchnImageStore, itemRequest, itemNameMap);			

		}
	}
);

dojo.subscribe(dijit._scopeName + ".Editor.getPlugin",null,function(o){
	if(o.plugin){ return; }
	switch(o.args.name){
	case "ImageDialog":
		o.plugin = new dojox._editor.plugins.EditorImageDialog({command: "insertImage"});
	}
});
