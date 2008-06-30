if(!dojo._hasResource["dijit._editor.plugins.SaveButton"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._editor.plugins.SaveButton"] = true;
dojo.provide("dijit._editor.plugins.SaveButton");

dojo.require("dijit._editor._Plugin");


dojo.declare("dijit._editor.plugins.SaveButton",
	dijit._editor._Plugin,
	{
		//	summary:
		//		This plugin provides dropdown color pickers for setting text color and background color
		//
		//	description:
		//		The commands provided by this plugin are:
		//		* foreColor - sets the text color
		//		* hiliteColor - sets the background color

		
		
//TODO: set initial focus/selection state?
		
		useDefaultCommand: false,
		command: '',
		
		constructor: function(){
			//create button
			console.debug("constructing save button");
			var className = this.iconClassPrefix+" "+this.iconClassPrefix + "Save";			
			props = {
				label: "Save",
				showLabel: false,
				iconClass: className,
				dropDown: this.dropDown,
				tabIndex: "-1"
			};
			this.button = new this.buttonClass(props);
			this.connect(this.button, "onClick",
				dojo.hitch(this, "firesave")
			);

		},
		
		firesave: function(){

			this.editor.save();
		}	
	});
}
