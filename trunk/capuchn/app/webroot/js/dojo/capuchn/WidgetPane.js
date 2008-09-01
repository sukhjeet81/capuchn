if(!dojo._hasResource["capuchn.WidgetPane"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["capuchn.WidgetPane"] = true;
dojo.provide("capuchn.WidgetPane");

dojo.require("dijit.form.Button");
dojo.require("dijit.Toolbar");
dojo.require("capuchn.CapuchnWidget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");

//The WidgetPane provides an encapsulation widget to hold and manipulate cWidgets
dojo.declare("capuchn.WidgetPane",dijit.layout.ContentPane,{
	
	//globalConfig 
	//	stores the configuration for all the widgets.
	globalConfig:{prefs:[]},
	column: "",
	numColumns: 2,
	configUrl:"",
	
	postCreate: function(){
		
		this.inherited(arguments);
		this.column = [];
		
		dojo.subscribe("/capuchnWidget/add", this, this.addNewWidget);
		dojo.subscribe("cWidget/close", this, this.closeWidget);
		dojo.subscribe("cWidget/moveUp", this, this.upWidget);
		dojo.subscribe("cWidget/moveDown", this, this.downWidget);
		dojo.subscribe("cWidget/moveRight", this, this.rightWidget);
		dojo.subscribe("cWidget/moveLeft", this, this.leftWidget);
		
		
		if(this.configUrl != ""){
			this.getConfig();
		}else{
			this.postConfig();
		}		
		
	},
	
	postConfig: function(){
		//if we where passed a config object then we should
		//create widgets.		
		//var columnWidth = (100/this.numColumns)+"%"
		//console.debug(this.domNode);
		var columnWidth = (this.domNode.clientWidth/this.numColumns)+"px";
		for (var i = 0; i < this.numColumns; i++) {
			this.column[i] = dojo.doc.createElement("div");
			this.column[i].style.width = columnWidth;			
			this.column[i].className = "WidgetPaneColumn";		
			//this.column[i].innerHTML = "column"+i;	
			this.domNode.appendChild(this.column[i]);
		}
		
		//globalConfig is an array of configObjects
		console.debug(this.globalConfig.prefs);
		for(var i = 0; i<this.globalConfig.prefs.length; i++){
			this.addWidget(this.globalConfig.prefs[i]);
		}
		
		
		
	},
	
	//insertWidget
	//	Take a widget object and optional position and insert it into a grid
	//	that may or may not be 1 to 1 on widgets for position and may or may
	//	not have multiple widgets in a single position (should not be the case)
	//	but should be acceptable.
	
	insertWidget: function(cWidget, column, vposition){
		//cWidget is the capuchnWidget
		
		//take the created widget and place it into the dom as indicated by column and vposition
		if(vposition == undefined){vposition=0;}
		if(column == undefined){column=0;}

		var childNodes = dojo.query(">", this.column[column]),
			childWidgets = childNodes.filter("[widgetId]");
		
		//The expected position	
		cWidget.column = column;
		cWidget.vposition = vposition;
		
		var lastWidget = null;
		var inserted = false;
		for(var i = 0; i<childWidgets.length; i++){
			var currDWidget = dijit.byId(childWidgets[i].id);
			if (currDWidget.vposition != undefined) {
				if (vposition < currDWidget.vposition) {
					console.debug("inserting before ", childWidgets[i]);
					this.column[column].insertBefore(cWidget.domNode, childWidgets[i]);//use domnode here
					inserted = true;
					break;
				}else{
					console.debug("vpos is not less");
				}
				
			}else{
				console.debug("undef");
			}
		}
		//if we fell through loop, append. Not sure if we need to add the dom node, or what
		if(!inserted){			
			this.column[column].appendChild(cWidget.domNode);
		}
		cWidget.startup();
		
		//
		
	},
	
	//Take a widget configuration object and create the cwidget and set the instance
	//variables in the cwidget
	addWidget: function(configObject){
		//Create a new widget from the configObject should look like:
		//	{name:"widgetName", myVariable:"value"}
		var newCWidget = new capuchn.CapuchnWidget({href:"widget/showWidget/"+configObject.serverId,title:configObject.name});
		newCWidget.instanceId = configObject.instanceId;
		this.insertWidget(newCWidget, configObject.column, configObject.vposition);
	},

	//Add new widget will add a new widget to the configuration
	addNewWidget: function(widgetId){
		//create new widget and query it for prefrences
		//set its location to 0,0 and then call insert widget
		
		//create instance id
		var rand = Math.random();
		var srand = rand+"";
		srand = srand.substring(3,7);
		
		var newCWidget = new capuchn.CapuchnWidget({href:"widget/showWidget/"+widgetId,title:"cWidget"});
		
		var instanceObj = {name:newCWidget.title, instanceId: srand, serverId:widgetId, column:0, vposition:0};
		this.globalConfig.prefs.push(instanceObj);
		console.debug(this.globalConfig);
		this.insertWidget(newCWidget,0,0);		
		this.saveConfig();
	},
		
	saveConfig: function(){		
		dojo.xhrPost({
				url: 'user/saveconfig',
				content: {
					globalConfig: dojo.toJson(this.globalConfig)
				},
				handleAs: "json-comment-filtered",
				load: dojo.hitch(this, this.saveResponse),
				error: function(data, ioArgs){
					console.debug("Error saving item");
				},
				timeout: 2000
			});
	},
	
	getConfig: function(){
			dojo.xhrPost({
				url: 'user/getconfig',
				content:this.globalConfig,
				handleAs: "json-comment-filtered",
				load: dojo.hitch(this, this.getResponse),
				error: function(data, ioArgs){
					console.debug("Error saving item");
				},
				timeout: 2000
			});
	},
	
	saveResponse: function(){
		dojo.publish("serverResponse", arguments);
	},
	
	getResponse: function(responseObj){		
		console.debug(responseObj);
		this.globalConfig = responseObj;
		this.postConfig();
	},
	
	reloadConfig: function(){},
	
	refreshWidgets: function(){},
	
	closeWidget: function(){
		console.debug("in close widget");
		console.debug(arguments);
		var currWidget = arguments[0];
		
		for(var i = 0; i<this.globalConfig.prefs.length; i++){
			console.debug(this.globalConfig.prefs[i]);
			console.debug(currWidget.instanceId);
			if(this.globalConfig.prefs[i].instanceId == currWidget.instanceId ){
				this.globalConfig.prefs.splice(i);
				break;
			}
		}
		this.saveConfig();
		currWidget.destroy();
	},
	
	upWidget: function(){
		var moveWidget = arguments[0];
		var pos = this.getWidgetPosition(moveWidget);
		//console.debug(this.globalConfig.prefs);
		this.verticalMove(moveWidget,false,pos.col);
		pos = this.getWidgetPosition(moveWidget);
		//console.debug(this.globalConfig.prefs);
		this.saveConfig();
	},
	
	downWidget: function(){
		var moveWidget = arguments[0];
		var pos = this.getWidgetPosition(moveWidget);
		//console.debug(this.globalConfig.prefs);
		this.verticalMove(moveWidget,true,pos.col);
		pos = this.getWidgetPosition(moveWidget);
		//console.debug(this.globalConfig.prefs);
		this.saveConfig();
	},
	
	leftWidget: function(){
		var moveWidget = arguments[0];
		var pos = this.getWidgetPosition(moveWidget);
		
		if (pos.col <= 0) {
			console.debug('cannot move left');
		}
		else {
			var childNodes = dojo.query(">", this.column[pos.col]), childWidgets = childNodes.filter("[widgetId]");
			//childWidgets is a domNode already		
			for (var i = 0; i < childWidgets.length; i++) {
				//var currWidget = dijit.byId(childWidgets[i].id);
				if (childWidgets[i] == moveWidget.domNode) {
					this.column[pos.col].removeChild(childWidgets[i]);	
					this.column[pos.col-1].appendChild(childWidgets[i]);
					break;
				}				
			}
			var pos = this.getWidgetPosition(moveWidget);
			this.saveConfig();
		}
		
	},
	
	rightWidget: function(){
		var moveWidget = arguments[0];
		var pos = this.getWidgetPosition(moveWidget);
		
		if (pos.col >= this.column.length-1) {
			console.debug('cannot move right', pos);
		}
		else {
			var childNodes = dojo.query(">", this.column[pos.col]), childWidgets = childNodes.filter("[widgetId]");
			//childWidgets is a domNode already		
			for (var i = 0; i < childWidgets.length; i++) {
				//var currWidget = dijit.byId(childWidgets[i].id);
				if (childWidgets[i] == moveWidget.domNode) {
					this.column[pos.col].removeChild(childWidgets[i]);	
					this.column[pos.col+1].appendChild(childWidgets[i]);
					break;
				}				
			}
			var pos = this.getWidgetPosition(moveWidget);
			this.saveConfig();
		}
	},
	
	getWidgetPosition: function(wgt){
	
		//run through widgets and reset the order according to actual layout
		var widgetPos = -1;
		var col = -1;		
		for (var k = 0; k < this.column.length; k++) {
			console.debug("k="+k);
			var childNodes = dojo.query(">", this.column[k]), childWidgets = childNodes.filter("[widgetId]");
			
			
			console.debug("Child Widgets :")
			for (var i = 0; i < childWidgets.length; i++) {
				var currWidget = dijit.byId(childWidgets[i].id);
				//console.debug(currWidget);
				//console.debug("InstanceID of child: "+currWidget.instanceId);
				//It *should* be safe to assume that all will have an instanceId here, now find the
				//matching config.
				
				if (wgt == currWidget) {
					console.debug("found current widget k="+k);
					widgetPos = i;
					col = k;
				}
				
				for (var j = 0; j < this.globalConfig.prefs.length; j++) {
					if (this.globalConfig.prefs[j].instanceId == currWidget.instanceId) {
						//console.debug("found "+currWidget.instanceId+" at "+i);
						this.globalConfig.prefs[j].vposition = i;
						this.globalConfig.prefs[j].column = k;
						break;
					}
				}
			}
		}
		//nothing is actuall done with this
		return {
			col: col,
			pos: widgetPos
		};
		
	},
	//swapWidget will swap the positions of 2 widgets in a column
	//	topWidget - the widget to move.
	//	down - boolean - the direction of the swap
	//	
	verticalMove: function(topWidget, down, column){
		//the column var is the pointer to all the dom nodes so
		var childNodes = dojo.query(">", this.column[column]),
			childWidgets = childNodes.filter("[widgetId]");
		//childWidgets is a domNode already		
		for (var i = 0; i < childWidgets.length; i++) {
			//var currWidget = dijit.byId(childWidgets[i].id);
			if (childWidgets[i] == topWidget.domNode) {
				//found the first of the 2 we are swapping
				console.debug("topWidget found");
				if (down) {
					//this is the first widget
					if (i < childWidgets.length - 1) {
						//can do
						this.column[column].removeChild(childWidgets[i + 1]);
						this.column[column].insertBefore(childWidgets[i + 1], childWidgets[i]);
					}
					else {
						//last node
						console.debug("widget is at bottom");
					}
				}
				else {
					if (i > 0) {//not the first
						//(i == childWidgets.length-1)){//cannot be the first
						//this is the last widget
						this.column[column].removeChild(childWidgets[i]);
						this.column[column].insertBefore(childWidgets[i], childWidgets[i - 1]);
					}
					else {
						console.debug("widget is at the top");
					}
				}
			}
		}
	}
	
	});
}
