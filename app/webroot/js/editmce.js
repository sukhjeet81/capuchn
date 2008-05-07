    
    //TODO: change css link
     
	tinyMCE.init({
		    theme : "advanced",
		    mode : "none",
		    //elements : "elm1",
		    //save_callback : "mySave",
		    content_css : "css/mce.css",
		    extended_valid_elements : "a[href|target|name]",
		    plugins : "save,table",
		    theme_advanced_buttons1_add_before : "code,save,separator",
		    //theme_advanced_buttons3_add_before : "tablecontrols,separator",
		    //invalid_elements : "a",
		    theme_advanced_styles : "Header 1=header1;Header 2=header2;Header 3=header3;Highlight=highlight", // Theme specific setting CSS classes
		    execcommand_callback : "myCustomExecCommandHandler",
		    theme_advanced_toolbar_align : "left",
		    theme_advanced_buttons3 : "",
		    theme_advanced_toolbar_location : "top",
		    apply_source_formatting : true,
			//document_base_url : "/dev/sinvert/",
			//relative_url : true,
			//remove_script_host : false,
			//save_callback : "MamboSave",
			//urlconverter_callback: "convLinkVC", 
		    gecko_spellcheck : true,
		    debug : true,
		    init_instance_callback : "myInitFunction",
			handle_event_callback : "myHandleEvent",
		    width : "100%",
			height: "100%"
		    
	});
	
	function convLinkVC(strUrl, node, on_save) {
	   // strUrl=strUrl.replace("../","");
	   console.debug("Convert url:"+strUrl);
	   return strUrl;
	} 
	
	function myHandleEvent(e) {
		//console.debug( "event:" + e.type);
		if(e.type == "mouseup"){
			var t = new dojo.dnd.manager();
			if(currentDragNode != null){
				console.debug("currentDragNode:"+currentDragNode);
				var t = new dojo.dnd.manager();
				if(t.nodes.length > 1){
					console.debug("more than one node dragging for some reason");
				}else{
					var curnode = t.nodes[0];					
					var inst = window.tinyMCE.selectedInstance;
					var new_img = document.createElement("img");
					var new_link = document.createElement("a");
					new_img.className = "thumb";
					new_img.id = "disp_"+curnode.id;
					console.debug("current image src: " + curnode.src);
					console.debug(t.nodes[0]);
					var newimagesource = "";
					//filename is also available here... and this will not add the absolute path
					
					for(attrib in curnode.attributes){
						if(curnode.attributes[attrib].nodeName == "src"){
							newimagesource = curnode.attributes[attrib].value;
							break;
						}
					}
					
					for(attrib in curnode.attributes){
						if(curnode.attributes[attrib].nodeName == "filename"){
							new_link.href = imagesurl + curnode.attributes[attrib].value;
							console.debug("href:"+new_link.href);
							break;
						}
					}
					
					//new_img.src = curnode.src; //baseurl is set from the BASE php var baseUrl +
					
					new_img.src = newimagesource;
					new_link.appendChild(new_img);
					tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.getBody(), new_link);
				}
				//cancel so that it does not put pic into target div like normal
				dojo.publish("/dnd/cancel");
				t.stopDrag();
			}
		}

		return true; // Continue handling
	}

	function myInitFunction(inst) {
	    var editorFrame, editorX, editorY, winHeight, editorMaxHeight, IE;	    
	    var oldElement = inst.getElement();
		editorY = oldElement.parentNode.offsetParent.offsetHeight;
	    //document.getElementById(inst.editorId).style.height = (editorY-103) + "px";	
	    //TODO: add this function to the function list
		frame = document.getElementById(inst.editorId+"_ifr");
		frame.style.height = (editorY-103) + "px";
		window.onresize = function () {
	        //if (typeof(window.oldWinOnResize) == "function")
	            //window.oldWinOnResize();
	        editorResize(inst);
	    };
	}
	
	function editorResize(inst) {
	    var editorFrame, editorX, editorY, winHeight, editorMaxHeight, IE;    
	    var oldElement = inst.getElement();
		editorY = oldElement.parentNode.offsetParent.offsetHeight;
	    document.getElementById(inst.editorId).style.height = (editorY-103) + "px";	
	    //TODO: add this function to the function list
		frame = document.getElementById(inst.editorId+"_ifr");
		frame.style.height = (editorY-103) + "px";
	}
 
      // Custom event handler
	function myCustomExecCommandHandler(editor_id, elm, command, user_interface, value) {
	    var linkElm, imageElm, inst;
	
	    switch (command) {
	        case "mceSave":
	        	mceSubmitForm(editor_id);
	        	return true;
	        	
	        case "smceLink":
	            inst = tinyMCE.getInstanceById(editor_id);
	            linkElm = tinyMCE.getParentElement(inst.selection.getFocusElement(), "a");
	
	            if (linkElm)
	                alert("Link dialog has been overriden. Found link href: " + tinyMCE.getAttrib(linkElm, "href"));
	            else
	                alert("Link dialog has been overriden.");
	
	            return true;
	
	        case "mceImages":
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
    
    function fileBrowserCallBack(field_name, url, type, win) {
		// This is where you insert your custom filebrowser logic
		alert("Filebrowser callback: field_name: " + field_name + ", url: " + url + ", type: " + type);

		// Insert new URL, this would normaly be done in a popup
		win.document.forms[0].elements[field_name].value = "someurl.htm";
	}
	
	function mySave(fname){
		
		alert("really shouldnt be called - really - mysave called - dying "+fname.name);
		/*
		//fname returns the form.
		var thisform = null;
		for (var i = 0; i < document.forms.length; i++) {
	    	alert(document.forms[i].name);
	    	if(document.forms[i].name == name){
	    		thisform = forms(i);
	    		break;
	    	}
	    }
		//Really, hear is where i would pass the data back to the main document.
		if(thisform != null){
			alert(thisform.data[Mag][contents].value);
		}else{
			alert('saved no form');
		}
		*/
	}
	
	resizeEditorBox = function (editor) {
	    // Have this function executed via TinyMCE's init_instance_callback option!
	    // requires TinyMCE3.x
	    var container = editor.contentAreaContainer, /* new in TinyMCE3.x -
	        for TinyMCE2.x you need to retrieve the element differently! */
	        formObj = document.forms[0], // this might need some adaptation to your site
	        dimensions = {
	            x: 0,
	            y: 0,
	            maxX: 0,
	            maxY: 0
	        }, doc, docFrame;
	
	    dimensions.x = formObj.offsetLeft; // get left space in front of editor
	    dimensions.y = formObj.offsetTop; // get top space in front of editor
	
	    dimensions.x += formObj.offsetWidth; // add horizontal space used by editor
	    dimensions.y += formObj.offsetHeight; // add vertical space used by editor
	
	    // get available width and height
	    if (window.innerHeight) {
	        dimensions.maxX = window.innerWidth;
	        dimensions.maxY = window.innerHeight;
	    } else {
			// check if IE for CSS1 compatible mode
	        doc = (document.compatMode && document.compatMode == "CSS1Compat")
	            ? document.documentElement
	            : document.body || null;
	        dimensions.maxX = doc.offsetWidth - 4;
	        dimensions.maxY = doc.offsetHeight - 4;
	    }
	
	    // extend container by the difference between available width/height and used width/height
	    docFrame = container.children [0] // doesn't seem right : was .style.height;
	    docFrame.style.width = container.style.width = (container.offsetWidth + dimensions.maxX - dimensions.x - 2) + "px";
	    docFrame.style.height = container.style.height = (container.offsetHeight + dimensions.maxY - dimensions.y - 2) + "px";
	}
	