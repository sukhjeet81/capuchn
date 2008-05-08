    //TODO: !!! this code needs to be removed since the move to iframes for the editors.
    /*
	tinyMCE.init({
	    theme : "advanced",
	    mode : "exact",
	    elements : "elm1,elm2",
	    save_callback : "customSave",
	    content_css : "example_advanced.css",
	    extended_valid_elements : "a[href|target|name]",
	    plugins : "table",
	    //theme_advanced_buttons3_add_before : "tablecontrols,separator",
	    //invalid_elements : "a",
	    theme_advanced_styles : "Header 1=header1;Header 2=header2;Header 3=header3;Table Row=tableRow1", // Theme specific setting CSS classes
	    //execcommand_callback : "myCustomExecCommandHandler",
	    theme_advanced_toolbar_align : "left",
	    theme_advanced_buttons3 : "",
	    theme_advanced_toolbar_location : "top",
	    apply_source_formatting : true,
	    gecko_spellcheck : true,
	    debug : false,
	    width : "100%",
	    height : "90%"
	});
 
      // Custom event handler
	function myCustomExecCommandHandler(editor_id, elm, command, user_interface, value) {
	    var linkElm, imageElm, inst;
	
	    switch (command) {
	        case "mceLink":
	            inst = tinyMCE.getInstanceById(editor_id);
	            linkElm = tinyMCE.getParentElement(inst.selection.getFocusElement(), "a");
	
	            if (linkElm)
	                alert("Link dialog has been overriden. Found link href: " + tinyMCE.getAttrib(linkElm, "href"));
	            else
	                alert("Link dialog has been overriden.");
	
	            return true;
	
	        case "mceImage":
	            inst = tinyMCE.getInstanceById(editor_id);
	            imageElm = tinyMCE.getParentElement(inst.selection.getFocusElement(), "img");
	
	            if (imageElm)
	                alert("Image dialog has been overriden. Found image src: " + tinyMCE.getAttrib(imageElm, "src"));
	            else
	                alert("Image dialog has been overriden.");
	
	            return true;
	    }
	
	    return false; // Pass to next handler in chain
	}
 
    // Custom save callback, gets called when the contents is to be submitted
	function customSave(id, content) {
    	alert(id + "=" + content);
    }
    function fileBrowserCallBack(field_name, url, type, win) {
		// This is where you insert your custom filebrowser logic
		alert("Filebrowser callback: field_name: " + field_name + ", url: " + url + ", type: " + type);

		// Insert new URL, this would normaly be done in a popup
		win.document.forms[0].elements[field_name].value = "someurl.htm";
	}
	*/

   /* -----------------------------------------------
  Floating layer - v.1
  (c) 2006 www.haan.net
  contact: jeroen@haan.net
  You may use this script but please leave the credits on top intact.
  Please inform us of any improvements made.
  When usefull we will add your credits.
 ------------------------------------------------ */
 //TODO: move scripts to a common jscript library file. 
   x = 20;
   y = 20;
   function setVisible(obj)
   {
       //Scrollbar width is 40
       var width = document.documentElement.clientWidth-40;
       //var height = document.documentElement.clientHeight;
       var height = window.innerHeight-0;
      
       obj = document.getElementById(obj);
       obj.style.visibility = (obj.style.visibility == 'visible') ? 'hidden' : 'visible';
       alert("setVisible");
       obj.style.width = width + "px";
       obj.style.height = height + "px";
       
   }
   
	function show () {
		for (var i = 0; i < arguments.length; i++) {
	    	var e = document.getElementById(arguments[i]);
	        //var e =  $(arguments[i]);
	        if (e){
	           	e.style.visibility = (e.style.visibility == 'visible') ? 'hidden' : 'visible';
	       	}
	    }
	}//end show()
   
   
   
   //TODO: fix setsizes so that it functions with arguments, to ensure that it doesnt fail
   function setSizes(){
       var left = document.getElementById('left');
       var main = document.getElementById('main');
       var editor = document.getElementById('elm1');
       var width = document.documentElement.clientWidth;
       var height = document.documentElement.clientHeight;
       height = window.innerHeight;
       //alert("width "+ width + " mainstyle " + main.style.width);
       var hmargins = 10 + 10 + 10 + 10;
       var vmargins = 10 + 10 + 10 + 10 + 10;
       //if(main != null){
       	main.style.width = (width - hmargins - 210) + "px";
       	main.style.height = (height - vmargins - 110) + "px";
       	main.style.overflow = "auto";
       //}
       if(left != null){
       	left.style.height = (height - vmargins - 110) + "px";
       }
       if(editor != null){
       	//editor.style.height = (height - vmargins - 16) + "px";
       }      
   }
   
   setSizebox = function(){
       var left = document.getElementById('left');
       var main = document.getElementById('main');
       var editor = document.getElementById('elm1');
       var width = document.documentElement.clientWidth;
       var height = document.documentElement.clientHeight;
       height = window.innerHeight;
       //alert("width "+ width + " mainstyle " + main.style.width);
       var hmargins = 10 + 10 + 10 + 10;
       var vmargins = 10 + 10 + 10 + 10 + 10;
       //if(main != null){
       	main.style.width = (width - hmargins - 210) + "px";
       	main.style.height = (height - vmargins - 110) + "px";
       	main.style.overflow = "auto";
       //}
       if(left != null){
       	left.style.height = (height - vmargins - 110) + "px";
       }
       if(editor != null){
       	//editor.style.height = (height - vmargins - 16) + "px";
       }      
   }