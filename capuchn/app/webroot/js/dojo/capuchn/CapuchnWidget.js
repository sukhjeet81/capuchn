if(!dojo._hasResource["capuchn.CapuchnWidget"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["capuchn.CapuchnWidget"] = true;
dojo.provide("capuchn.CapuchnWidget");

dojo.require("dijit.form.Button");
dojo.require("dijit.Toolbar");

dojo.require("dijit._Templated");
dojo.require("capuchn.TitlePane");
dojo.require("dojox.layout.ContentPane");

dojo.declare("capuchn.CapuchnWidget",capuchn.TitlePane,
	{
		iframe: false,
		myframe: null,
		refreshUrl: "",
		widgetName: "",
		instanceId: "",
		widgetDataObject: "",
		baseClass: "dijitWidgetPane",
		executeScripts: true,
		
		templateString:
		"<div class=\"${baseClass}\">" + 
			"<div class=\"dijitWidgetPaneTitle\" dojoAttachPoint=\"titleBarNode,focusNode\">" + 
				"<div dojoAttachEvent=\"onclick:toggle,onkeypress: _onTitleKey,onfocus:_handleFocus,onblur:_handleFocus\" tabindex=\"0\" waiRole=\"button\" dojoAttachPoint=\"arrowNode\" class=\"dijitInline dijitArrowNode\">"+
					"<span dojoAttachPoint=\"arrowNodeInner\" class=\"dijitArrowNodeInner\">"+
					"</span>"+
				"</div>"+
				"<div dojoAttachEvent=\"onclick:closeWidget\" tabindex=\"1\" waiRole=\"button\" dojoAttachPoint=\"closeNode\" class=\"dijitInline dijitControlNode closeImage\" >"+
					"<span dojoAttachPoint=\"closeNodeInner\" class=\"dijitArrowNodeInner\">"+
					"</span>"+
				"</div>"+
				"<div dojoAttachEvent=\"onclick:up\" tabindex=\"1\" waiRole=\"button\" dojoAttachPoint=\"closeNode\" class=\"dijitInline dijitControlNode upImage\" >"+
					"<span dojoAttachPoint=\"closeNodeInner\" class=\"dijitArrowNodeInner\">"+
					"</span>"+
				"</div>"+
				"<div dojoAttachEvent=\"onclick:right\" tabindex=\"1\" waiRole=\"button\" dojoAttachPoint=\"closeNode\" class=\"dijitInline dijitControlNode rightImage\" >"+
					"<span dojoAttachPoint=\"closeNodeInner\" class=\"dijitArrowNodeInner\">"+
					"</span>"+
				"</div>"+
				"<div dojoAttachEvent=\"onclick:down\" tabindex=\"1\" waiRole=\"button\" dojoAttachPoint=\"closeNode\" class=\"dijitInline dijitControlNode downImage\" >"+
					"<span dojoAttachPoint=\"closeNodeInner\" class=\"dijitArrowNodeInner\">"+
					"</span>"+
				"</div>"+
				"<div dojoAttachEvent=\"onclick:left\" tabindex=\"1\" waiRole=\"button\" dojoAttachPoint=\"closeNode\" class=\"dijitInline dijitControlNode leftImage\" >"+
					"<span dojoAttachPoint=\"closeNodeInner\" class=\"dijitArrowNodeInner\">"+
					"</span>"+
				"</div>"+
				"<div dojoAttachPoint=\"titleNode\" class=\"dijitWidgetPaneTextNode\">"+
				"</div>"+
			"</div>"+
			"<div class=\"dijitWidgetPaneContentOuter\" dojoAttachPoint=\"hideNode\">"+
				"<div class=\"dijitReset\" dojoAttachPoint=\"wipeNode\">"+
					"<div class=\"dijitWidgetPaneContentInner\" dojoAttachPoint=\"containerNode\" waiRole=\"region\" tabindex=\"-1\">"+
					"</div>"+
				"</div>"+
			"</div>"+
		"</div>",
		
		postCreate: function(){
			if(this.iframe){
				console.debug("iframe code");
				this.myframe = dojo.doc.createElement("iframe");
				this.myframe.href = this.href;
				this.containerNode.appendChild(this.myframe);
				console.debug("container", this.containerNode);
			}
			
			//check to see if the code has any prefrence variables
			//then set them?
			
			this.inherited(arguments);			
			
		},
		
		closeWidget: function(){
			console.debug("close called");
			dojo.publish("cWidget/close", [this]);
		},
		
		up: function(){			
			dojo.publish("cWidget/moveUp", [this]);
		},
		right: function(){
			dojo.publish("cWidget/moveRight", [this]);
		},
		down: function(){
			dojo.publish("cWidget/moveDown", [this]);
		},
		left: function(){
			dojo.publish("cWidget/moveLeft", [this]);
		},
	
	});
}