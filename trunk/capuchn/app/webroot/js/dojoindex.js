	/**
	* @author Scott Fennell
	* Rev 15
	* 
	*/
	var Capuchn = {};
	dojo.require("dijit.Tooltip");
	dojo.require("dojo.io.iframe");
	dojo.require("dijit.Toolbar");
	
	/*Global variables*/
	var editorID = 0;
	var lastResponse = Array();
	var currentDragNode = null;
	
	var currentAlbum = 0;
	var contentDirectory;
	var albumDirectory;
	var mostrecenteditor = "tinymce";
	
	dojo.subscribe("updateTree", function(caller){
		loadTree();
		console.debug(caller);				
	});
	
	dojo.subscribe("changeAlbum", function(albumId){	
		currentAlbum = albumId;
		//maybe change album...
		//check if the manager display is open
		newTabId = "imageManageTab";
		mywidget = dijit.byId(newTabId);
		if(mywidget){
			tabUrl = "images/index/"+currentAlbum;
			mywidget.setHref(tabUrl);
		}
		
		var kw = {
		url: "images/adminsidefiles/"+albumId,
		load: function(response){
				var thumbdiv = dijit.byId("sidethumbnails");
				thumbdiv.destroyDescendants();
				thumbdiv.setContent(response);
				//dojo.parser.parse(thumbdiv);
			},
		error: function(data){
				console.debug("An error occurred: ", data);
			},
		timeout: 2000
		};
		dojo.xhrPost(kw);
	});
	
	dojo.subscribe("updateAlbums", function(){
		console.debug("updateAlbums needs to go");
	});
	
	dojo.subscribe("/dnd/start", function(source,nodes,iscopy){
	  currentDragNode = nodes;
	});
	
	dojo.subscribe("/dnd/drop", function(source,nodes,iscopy){
		currentDragNode = null;
		return true;
	});
	
	
	dojo.subscribe("/dnd/cancel", function(){			
		currentDragNode = null;
	});
	
	/*Capuchn globals*/
	function CapuchnGlobals(){
		//marker for editor
	}
	Capuchn.getElementsByClassName = function(strClassName,type){
		oElm = document;
		if (type == undefined) {
			strTagName = "div";
		}else{
			strTagName = type;
		}
		var arrElements = (strTagName == "*" && document.all)? document.all : oElm.getElementsByTagName(strTagName);
	    var arrReturnElements = new Array();
	    strClassName = strClassName.replace(/\-/g, "\\-");
	    var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
	    var oElement;
	    for(var i=0; i<arrElements.length; i++){
			oElement = arrElements[i];
	        if(oRegExp.test(oElement.className)){
	            arrReturnElements.push(oElement);
	        }
	    }
	    return (arrReturnElements)
	}

		
	Capuchn.newtab = function(url,id,title){
		//Create the tab that lists all the themes
		var taburl = url;
		var new_tab_id = id;
		var mywidget = dijit.byId(new_tab_id);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {
		
			var newtab = new dojox.layout.ContentPane({
				id: new_tab_id,
				title: title,
				closable: true,
				selected: true,
				href: taburl,
				executeScripts: true
				//onLoad: seteditor
			});
			newtab.onClose = function(){
				this.destroyDescendants();
				return true;
			}
			tabcontain.addChild(newtab);
			
		}else{
			newtab = mywidget;
			console.debug("old widget found.");
		}
	   	tabcontain.selectChild(newtab);
	}
	
	Capuchn.refreshTabs = function(){
		tabContain  = dijit.byId('mainTabContainer');
		childs = tabContain.getChildren();
		for(i=0;i<childs.length;i++){
			childs[i].refresh();
		}
	}
	
	/*Capuchn theme code*/
	function CapuchnTheme(){
		//marker for editor
		this.name = "Capuchn theme functions and data";
	}
	
	Capuchn.theme = new CapuchnTheme();
	
	Capuchn.theme.clone = function(themeid){
		var kw = {
	    	url: "theme/clonetheme/"+themeid,
			handleAs: "json-comment-filtered",
	 		load: function(responseObj, ioArgs){
				save_response_callback_json(responseObj);
				tlt = dijit.byId("themelisttab");
				if(tlt != undefined){
					tlt.refresh();
				}else{
					console.debug('Theme tab not open?');
				}
	    	},
	    	error: function(data, ioArgs){
		            console.debug("An error occurred: ", data);
	        },
	        timeout: 2000
		};
		dojo.xhrPost(kw);
	}
	
	Capuchn.theme.edit = function(themeid, part){
		//part is layout, style, or mce
		var taburl = "theme/edittab/"+themeid+"/"+part;
		var new_tab_id = "theme_"+part+"_"+themeid;
		var mywidget = dijit.byId(new_tab_id);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {
		
			var newtab = new dojox.layout.ContentPane({
				id: new_tab_id,
				title: "Theme " + part + " - " + themeid,
				closable: true,
				selected: true,
				href: taburl,
				executeScripts: true
				//onLoad: seteditor
			});
			newtab.onClose = function(){
				console.debug("May still have an open codepress obj");
				this.destroyDescendants();
				return true;				
			}
			tabcontain.addChild(newtab);
			
		}else{
			newtab = mywidget;
			console.debug("old widget found.");
		}
	   	tabcontain.selectChild(newtab);
		
	}
	
	Capuchn.theme.deletetheme = function(id,row){
		if (confirm('DeleteTheme' + id + "?")) {
			//send 
			fakeform = {"confirmed":"true"};
			
			var kw = {
				url: "theme/delete/" + id,
				handleAs:"json-comment-filtered",
	 			content: fakeform,
				load: function(responseObj,ioargs){
					
					save_response_callback_json(responseObj);
				},
				error: function(data){
					console.debug("An error occurred: ", data);
				},
				timeout: 2000
			};
			dojo.xhrPost(kw);
			if(row){
				row.parentNode.removeChild(row);
			}	
		}
	}
	
	Capuchn.theme.tab = function(){
		//Create the tab that lists all the theme
		Capuchn.newtab("theme/themelist","themelisttab","Theme List");
	}
	
	//I do not believe that this is currently implimented.
	Capuchn.theme.nameeditbox = function(idOfBox,value){
		var myalbid = idOfBox.split("_");//sleeping beauty
    	if(myalbid.length > 1){
    		var url = myalbid[2];
			var field = myalbid[1];
    	}else{
    		console.debug("cannot parse image id:"+idOfBox);
    	}
		album = {"id":url, "value":value,"field":field};
		dojo.rawXhrPost( {
	        url: "theme/editbox",
	        handleAs: "json-comment-filtered",
	        postData: dojo.toJson(album),
	        timeout: 1000,
	        load: function(response, ioArgs) {
	                console.debug(response);
					dojo.publish("updateAlbums",['albumeditor'])
	        },
	        error: function(response, ioArgs) {
	                return response;
	        }
		});
	}
	
	Capuchn.theme.save = function(button,textareaid){
		Capuchn.codepress[textareaid].toggleEditor();
		console.debug(Capuchn.codepress[textareaid]);
	    var currentForm = dojo.byId(button.id).form;
	    console.debug(currentForm);
		var kw = {
	    	url: "theme/save",
			handleAs:"json-comment-filtered",
	 		load: function(responseObj,ioargs){
				save_response_callback_json(responseObj);
	    	},
	    	error: function(data){
		            console.debug("An error occurred: ", data);
	        },
	        timeout: 2000,
	    	form: currentForm.id
		};
		dojo.xhrPost(kw);		
		//Turn the editor back on
		Capuchn.codepress[textareaid].toggleEditor();
	}
	
	function CapuchnAlbum(){
		this.albums = {};
		this.selected = 1;//default selected id
		this.sideAlbumSelected = 0;
		this.mainAlbumSelected = 0;
	}
	
	Capuchn.album = new CapuchnAlbum();
	
	Capuchn.album.adddialog = function(){
		diag = new dijit.Dialog({title:"Add New Album"});
		diag.execute = function(frm){
			var kw = {
			url: "albums/add/" + frm.name,
			handleAs:"json-comment-filtered",
			load: function(responseObj, ioargs){					
					if(responseObj.status){
						dojo.publish("updateAlbums",[]);
					}else{
						console.debug(responseObj.message);
					}
					//reload the tab
				},
			error: function(data){
					console.debug("An error occurred: ", data);
				},
			timeout: 2000
			};
			dojo.xhrPost(kw);
		}
		content = "<table><tr><td><label for=\"name\">Album Name </label></td>";
		content += "<td><input dojoType=\"dijit.form.TextBox\" trim=\"true\" name=\"name\"></td></tr><tr><td colspan=\"2\" align=\"center\">";
        content += "<button dojoType=dijit.form.Button type=\"submit\">OK</button></td></tr></table>";
   		diag.setContent(content);
		diag.startup();
		diag.show();
	}
	
	Capuchn.album.editBoxHandler = function(idOfBox,value){
		var myalbid = idOfBox.split("_");//sleeping beauty
    	if(myalbid.length > 1){
    		var url = myalbid[2];
			var field = myalbid[1];
    	}else{
    		console.debug("cannot parse image id:"+idOfBox);
    	}
		album = {"id":url, "value":value,"field":field};
		dojo.rawXhrPost( {
	        url: "albums/editbox",
	        handleAs: "json-comment-filtered",
	        postData: dojo.toJson(album),
	        timeout: 1000,
	        load: function(response, ioArgs) {
	                console.debug(response);
					dojo.publish("updateAlbums",['albumeditor'])
					if(response['status']){
						Capuchn.album.change(value);
					}
	        },
	        error: function(response, ioArgs) {
	                return response;
	        }
		});
	}
	
	Capuchn.album.change = function(content){
		if (content == "sideAlbum") {
			Capuchn.album.select({
				value: Capuchn.album.sideAlbumSelected
			}, "sideAlbum");
		}else{
			Capuchn.album.select({
				value: Capuchn.album.mainAlbumSelected
			}, "mainAlbum");			
		}
	}
	
	Capuchn.album.select = function(option,selectid){	
		console.debug(arguments);
		//option.text is the album name... or at least the text
		//option.value is the id
		if(selectid == "sideAlbum"){
			Capuchn.album.sideAlbumSelected = option.value;
			var kw = {
				url: "images/adminsidefiles/"+option.value,
				load: function(response){
						var thumbdiv = dijit.byId("sidethumbnails");
						thumbdiv.destroyDescendants();
						thumbdiv.setContent(response);
					},
				error: function(data){
						console.debug("An error occurred: ", data);
					},
				timeout: 2000
			};
			dojo.xhrPost(kw);
		}else{
			Capuchn.album.mainAlbumSelected = option.value;
			mywidget = dijit.byId("imageManageTab");
			if(mywidget){
				tabUrl = "images/index/"+option.value;
				mywidget.setHref(tabUrl);
			}
		}
	}
	
	Capuchn.album.update = function(){
		//get json albumlist
		var kw = {
		url: "albums/aslist",
		handleAs:"json-comment-filtered",
		load: function(responseObj, ioargs){
				if (responseObj['status']) {
					Capuchn.album.list = responseObj['list'];
					asb = Capuchn.getElementsByClassName("albumSelect", "select");
					if (asb.length > 0) {
						for (k in asb) {
							tmp = asb[k];
							tmp.onChange = Capuchn.album.select;
							tmp.options.length = 0;
							count = 0;										
							for (j in Capuchn.album.list.items) {
								console.debug(j);
								tmp.options[count] = new Option(Capuchn.album.list.items[j]['name'], Capuchn.album.list.items[j]['id']);	
								count++;
							}
						}

					}else{
						console.debug("no elements found");
					}
				}else{
					console.debug("status not ture");
				}
			},
		error: function(data){
				console.debug("An error occurred: ", data);
			},
		timeout: 2000
		};
		dojo.xhrPost(kw);
	}
	
	Capuchn.album.del = function(albumid, nodeToRemove){
		//	function deleteAlbum(albumid, nodeToRemove){
		if (confirm('Delete Album' + albumid + "?")) {
			//send 
			var kw = {
				url: "albums/delete/" + albumid,
				handleAs:"json-comment-filtered",
	 			load: function(responseObj,ioargs){
					Capuchn.album.update();
					//dojo.publish("updateAlbums", ["deleteAlbum"]);
					save_response_callback_json(responseObj);
				},
				error: function(data){
					console.debug("An error occurred: ", data);
				},
				timeout: 2000
			};
			dojo.xhrPost(kw);
			if(nodeToRemove){
				nodeToRemove.parentNode.removeChild(nodeToRemove);
			}
			
		}
	
	}
	
	function CapuchnImage(){
		//marker and defaults.
	}
	
	Capuchn.image = new CapuchnImage();
	
	Capuchn.image.upload = function(tform){
		thisform = dojo.byId(tform);
		if (tform == "imgextendedside") {
			albumid = Capuchn.album.sideAlbumSelected;
			content = "sideAlbum";
		}else{
			albumid = Capuchn.album.mainAlbumSelected;
			content = "mainAlbum";
		}
		if(thisform != undefined){
			if(thisform['Filedata'].value == ""){
				alert("select file first");
				return;
			}
			console.debug("currentAlbum: "+albumid);
			thisform['data[Image][album_id]'].value = albumid;			
		}
		
		var bindArgs = {
			url: "images/upload",
			form: tform,
			method: "post",
			handleAs: "json",
			load: function(data) {
				Capuchn.album.change(content);
			},
			error: function(data) {
				alert('Error uploading see console');
				console.debug(data);
			}
		};
		
		// dispatch the request
		req=dojo.io.iframe.send(bindArgs);			
		return false;
	}
	
	Capuchn.image.del = function(){
		
	}
	
	Capuchn.image.multimove = function(){
		alert("multi move is not yet implimented");
	}
	
	Capuchn.image.multidelete = function(){	
		var frm = dojo.byId("imgindexform");
		var selectedImages = Array();		
		/*FF only
		for( img in frm.elements ){
			if ((frm.elements[img].name == "imgcheck") && (frm.elements[img].checked==true)) {
				selectedImages.push(frm.elements[img]);
			}
		}
		*/
		
		for (var i=0; i < frm.elements.length; i++) {
		   var element = frm.elements[i];
		   if ((element.name == "imgcheck") && (element.checked==true)) {
				selectedImages.push(element);
		   }		   
		}
		
		if (confirm("Delete images?")) {
			for (slc in selectedImages) {
				console.debug(selectedImages[slc].id);
				var myimgid = selectedImages[slc].id.split("_");//sleeping beauty
				if (myimgid.length > 1) {
					//the id of the image should be the very last section of the id
					var url = myimgid[myimgid.length - 1];
				}
				else {
					alert("cannot parse image id");
				}
				deleteImage(url,true)
				
			}
		}else{
			console.debug("delete canceled")
		}
	}
	
	Capuchn.image.editname = function(idOfBox, value){
    	console.debug("Edited value from "+idOfBox+" is now "+value);
    	var myimgid = idOfBox.split("_");//sleeping beauty
    	if (myimgid.length > 1) {
			//the id of the image should be the very last section of the id
			var url = myimgid[myimgid.length-1];
		}else{
    		alert("cannot parse image id");
    	}
		
		img = {"id":url, "value":value};
		dojo.rawXhrPost( {
	        url: "images/update/"+url,
	        handleAs: "json-comment-filtered",
	        postData: dojo.toJson(img),
	        timeout: 1000,
	        load: function(response, ioArgs) {
				save_response_callback_json(response);
	        },
	        error: function(response, ioArgs) {
	                return response;
	        }
		});		
	}
	
	Capuchn.image.editlink = function(idOfBox, value){
		//called when the link is clicked		
    	console.debug("not editable - disable editing... make this onClick and set to copy");
	}
	
	Capuchn.image.thumbclick = function(obj){
    	var tid=obj.id;
    	var idarr = tid.split("_");
    	if(idarr.length > 1){
    		var myid = idarr[idarr.length-1];//seems to be the way to go.
    	}else{
    		var myid = "0";
    	}	
    	var editpath = "images/edit/"+myid;
    	var diagid = "imgdialog"+myid
    	//check for existing
    	if(dojo.byId(diagid) == null){
    		var myimgdialog = new dijit.Dialog({id:diagid, href:editpath});
    	}else{
    		var myimgdialog = dijit.byId(diagid);
    	}
    	myimgdialog.show();
	}


	function loadTree()
	{
	        oldTree =  dijit.byId("contentTree");
			oldTree.destroy();
			contentDirectory = new dojo.data.ItemFileReadStore({url: "volumes/jsnavmenu"});
			mytree = new dijit.Tree(
	                {store : contentDirectory, labelAttr : name, id : 'contentTree', label : 'Site Contents', 'onClick' : onTreeClick},
	                document.createElement('div')
	        );                 
	        dojo.byId('treeBox').appendChild(mytree.domNode);
	}
	
	function onTreeClick(item, node){
		var currentIndex = contentDirectory.getIdentity(item);
		console.debug(currentIndex);
		if(currentIndex.charAt(0) == 'm'){
			//the current item is a mag, loaderup
			loadMag(currentIndex.substring(2));
		}else{
			//the current item is volume, do something else
			loadVol(currentIndex.substring(2));
		}
	}
		
	function editFileTab(file){
		//This should be the model for a tab creator function... since most are very similar
		tabUrl = "admin/readfile/"+file;
		newTabId = "editFileTab"+file;
		tabTitle = "Edit file: "+file;
		mywidget = dijit.byId(newTabId);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {		
			var newtab = new dojox.layout.ContentPane({
				id: newTabId,
				title: tabTitle,
				closable: true,
				selected: true,
				href: tabUrl,
				executeScripts: true
			});
			newtab.onClose = function(){
				this.destroyDescendants();
				return true;
			}		
			tabcontain.addChild(newtab);		
		}else{
			newtab = mywidget;
			console.debug("old widget found.");
		}
	   	tabcontain.selectChild(newtab);		
	}
	
	
	Capuchn.viewSiteTab = function(){
		//This should be the model for a tab creator function... since most are very similar
		tabUrl = baseurl;
		newTabId = "viewSiteTab";
		tabTitle = "Live Site";
		mywidget = dijit.byId(newTabId);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {		
			ifr = document.createElement('iframe');
			ifr.src = tabUrl;
			var newtab = new dojox.layout.ContentPane({
				id: newTabId,
				title: tabTitle,
				closable: true,
				selected: true,
				href: tabUrl,
				executeScripts: true
			},ifr);
			newtab.onClose = function(){
				this.destroyDescendants();
				return true;
			}		
			tabcontain.addChild(newtab);		
		}else{
			newtab = mywidget;
			console.debug("old widget found.");
		}
	   	tabcontain.selectChild(newtab);		
	}
	
	function mailboxesTab(){
		tabUrl = "mailboxes/edit";
		newTabId = "mailboxEditTab";
		mywidget = dijit.byId(newTabId);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {
		
			var newtab = new dojox.layout.ContentPane({
				id: newTabId,
				title: "Mailboxes",
				closable: true,
				selected: true,
				href: tabUrl,
				executeScripts: true
				//onLoad: seteditor
			});
			newtab.onClose = function(){
				this.destroyDescendants();
				return true;
			}				
			tabcontain.addChild(newtab);
		}else{
			newtab = mywidget;
		}
	   	tabcontain.selectChild(newtab);
	}
	

	
	function deleteMailbox(mboxid,nodeToRemove){
		if (confirm('Delete mailbox ' + mboxid + "?")) {
			//send 
			var kw = {
				url: "mailboxes/deletebox/" + mboxid,
				load: function(response){
					json_response_callback(response);
					//reload the tab
				},
				error: function(data){
					console.debug("An error occurred: ", data);
				},
				timeout: 2000
			};
			dojo.xhrPost(kw);
			if(nodeToRemove){
				nodeToRemove.parentNode.removeChild(nodeToRemove);
			}
			
		}
	}
	
	function editWidget(widgetid){
		var taburl = "widget/edit/"+widgetid;
		var new_tab_id = "widget_"+widgetid;
		var mywidget = dijit.byId(new_tab_id);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {
		
			var newtab = new dojox.layout.ContentPane({
				id: new_tab_id,
				title: "Widget " + widgetid,
				closable: true,
				selected: true,
				href: taburl,
				executeScripts: true
				//onLoad: seteditor
			});
			newtab.onClose = function(){
				this.destroyDescendants();
				return true;
			}
			tabcontain.addChild(newtab);
			
		}else{
			newtab = mywidget;
			console.debug("old widget found.");
		}
	   	tabcontain.selectChild(newtab);
	}
	

	
	function loadVol(volindex){
		//window.open("admin/volumes/"+volindex, "_top");
		var taburl = "volumes/edit/"+volindex;
		var new_tab_id = "vol_"+volindex;
		var mywidget = dijit.byId(new_tab_id);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {
		
			var newtab = new dojox.layout.ContentPane({
				id: new_tab_id,
				title: "Volume " + volindex,
				closable: true,
				selected: true,
				href: taburl,
				executeScripts: true
				//onLoad: seteditor
			});
			newtab.onClose = function(){
				this.destroyDescendants();
				return true;
			}
			tabcontain.addChild(newtab);
		}else{
			newtab = mywidget;
			console.debug("old widget found.");
		}
	   	tabcontain.selectChild(newtab);
	}
	//When we change the editor
	function editor(controlelement){
		console.debug("Fix the editor");
		var currentForm = dojo.byId(controlelement.id).form;
		parts = currentForm.id.split("_");
		if(parts.length > 1){
    		var myid = parts[parts.length-1];
    	}else{
    		var myid = "0";
    	}
		
		contentelement = "magcontent_"+myid;
		currcontelm = dojo.byId(contentelement);
		// ooooor just check the form and change, wtf.
		if (currentForm["data[Mag][type]"].value == "html") {
			//currently a codepress node
			eval("magcontent_"+myid+".toggleEditor()");
			
			if(currcontelm == undefined){
				currcontelm = dojo.byId(contentelement+"_cp");
				currcontelm.id = contentelement;
			}
			currcontelm.className = "tinymceelement";
			tinyMCE.execCommand('mceAddControl',true,contentelement);
		}else{
			//currently a tinymce window.
			tinyMCE.triggerSave();
			tinyMCE.execCommand('mceRemoveControl',true,contentelement);
			currcontelm.className = "codepress php linenumbers-on";
			currcontelm.width = "100%";
			CodePress.run();
		}
	}
	
	function loadMag(magindex){		
		var taburl = "mags/edit/"+magindex;
		var new_tab_id = "mag_"+magindex;
		var mywidget = dijit.byId(new_tab_id);
		var tabcontain = dijit.byId('mainTabContainer');
		magcontrolid = "magcontent_"+magindex;
		if (!mywidget) {
			var seteditor = function(){
				console.debug(mostrecenteditor);
				if(mostrecenteditor == "codepress"){
					currcontelm = dojo.byId(magcontrolid);
					currcontelm.className = "codepress php linenumbers-on";
					currcontelm.width = "100%";
					CodePress.run();
				}else{
					tinyMCE.execCommand('mceAddControl', true, magcontrolid);					
				}
			}
			var newtab = new dojox.layout.ContentPane({
				id: new_tab_id,
				title: "Post " + magindex,
				closable: true,
				selected: true,
				href: taburl,
				executeScripts: true,
				onLoad: seteditor
			});
			newtab.onClose = function(){
				//Get the editor, I suspect that this is not functioning correctly
				//sometimes because triggerSave fails
				try{
					if(!tinyMCE.execCommand('mceRemoveControl',false,magcontrolid)){
						console.debug("Failed to destroy/remove tinyMCE control: " + magcontrolid);
					}	
				}catch(e){
					console.debug("no mce control");
				}
							
				this.destroyDescendants();
				return true;
			}
			tabcontain.addChild(newtab);
		}else{
			newtab = mywidget;
			console.debug("old widget found.");
		}
	   	tabcontain.selectChild(newtab);
	}
	
	function deleteMag(magid, magheader){
		if (confirm('Delete ' + magheader + "?")) {
			//send 
			var kw = {
				url: "mags/delete/" + magid+ "/conf",
				load: function(response){
					dojo.publish("updateTree", ["deleteMag"]);				
					json_response_callback(response);
					//reload the tab
				},
				error: function(data){
					console.debug("An error occurred: ", data);
				},
				timeout: 2000
			};
			dojo.xhrPost(kw);
		}
	}
	
	function mceSubmitForm(editid){    		
		if(document.forms.length == 0){
			//there is no form loaded.... 
			alert("No name set");
			editor = dijit.byId('SettingsPane');
			dijit.byId('mainTabContainer').selectChild(editor);
		}else{
			//need to loop throught to get the correct form, although....
			//submitForm(dojo.byId("savemagbutton"));
			//bit of a hack but... it works. maybe
			for(elm in tinyMCE.editors[editid].formElement.elements){
				if(tinyMCE.editors[editid].formElement.elements[elm].type == "button"){
					submitForm(tinyMCE.editors[editid].formElement.elements[elm]);
				}
			}
		}
	}
	
	//This will show the simple response for a moment to notify of success or fail	
	function save_response_callback_json(responseObj){
		console.debug(responseObj);
		if (responseObj.status) {
			//cant get any f-ing effects to work, so
			sn = dojo.byId("save_note_0");
			sn.innerHTML = "Saved! : "+responseObj.message;
			sn.style.opacity = "0.8";
			setTimeout(function(){
				sn.style.opacity = 0.0
			}, 2000);
		}else{
			sn = dojo.byId("save_note_0");
			sn.innerHTML = "Save failed: "+responseObj.message;
			sn.style.opacity = "0.8";
			setTimeout(function(){
				sn.style.opacity = 0.0
			}, 2000);	
		}
	}
	
	function json_response_callback(response){
		//var parsed = eval("["+response+"]");
		console.debug(response);
		var parsed = eval(response);
		console.debug(parsed);
		return parsed;			
	}
	
	function submitForm(button,aurl,formObj,response_callback){
		//This should not take too much, and I believe that trigger save just writes
		//back to the old TextArea element. so let it happen everytime- just in case
		try{
			tinyMCE.triggerSave(); //This should write back to its corresponding form. 		
		}catch(e){
			console.debug(e);
		}
	    var currentForm = dojo.byId(button.id).form;
		try{
			if((currentForm['data[Mag][type]'].value == "php")||(currentForm['data[Mag][type]'] == "html-code")){
				//codepress element
				alert("writing back...");
				ta = currentForm['data[Mag][content]'].id;
				taparts = ta.replace("_cp","");
				eval(taparts+".toggleEditor()");
			}
		}catch(e){
			;
		}
	    
		var kw = {
	    	url: currentForm.action,
			handleAs: "json-comment-filtered",
	 		load: function(responseObj, ioArgs){
				save_response_callback_json(responseObj);
				dojo.publish("updateTree", ["submitForm(saveMag)"]);
	    	},
	    	error: function(data, ioArgs){
		            console.debug("An error occurred: ", data);
	        },
	        timeout: 2000,
	    	form: currentForm.id
		};
		dojo.xhrPost(kw);
		try{
			if(taparts != undefined){//was php
				eval(taparts+".toggleEditor()");
			}
		}catch(e){
			
		}
	}
	
	function submitFormData(aurl, formObj, callback){
		//alert(formObj.id);
		var kw = {
			url: aurl,
			load: function(response){
				if(callback != null){
					callback(response);
				}
			},
			error: function(data){
				console.debug("An error occurred: ", data);
			},
			timeout: 2000,
			form: formObj
		};
		dojo.xhrPost(kw);				
	}
	
	function getWidget(name){
		alert('Old getWidget name')
		var kw = {
			url: "widget/getAdmin/"+name,
			timeout: 2000,
			handleAs: "json-comment-filtered",
			error: function(data,ioargs){
				console.debug("error occurred in getWidget: ",data);
			},
			load: function(response,ioargs){
				displayWidget(response);
			}
		}
		dojo.xhrGet(kw);
	}
	
	function messageClick(msgid){
		//create tab with the href of mailboxes/view/+msgid
		//      <div id="HanselGretel" dojoType="dijit.layout.ContentPane"
	   //title="Hansel and Gretel" closable="true" selected="true">
	   var tabid = "msg_tab_"+msgid;
	   var taburl = "mailboxes/view/"+msgid;
	   
	   
	   var newtab = new dijit.layout.ContentPane({
		   		id:tabid,
		   		title:"Message "+msgid,
		   		closable:true,
		   		selected:true,
		   		href:taburl
	   		});
	   		
	   var tabcontain = dijit.byId('mainTabContainer');
	   tabcontain.addChild(newtab);
	   tabcontain.selectChild(newtab);
		
	}	
	
	function messageCheck(msgid){
		return;
	}
	
	function call_message_function(choice){			
		var msgForm = document.getElementById("messageForm");
		var checked_msg_ids = Array();
		for(i=0;i<msgForm.elements.length;i++){
			currid = msgForm.elements[i].id
			
			if(currid.substring(0,6) == "cb_msg"){				
				if(msgForm.elements[i].checked){
					checked_msg_ids.push(currid.substring(7));
				}
			}
		}			
		//now i gotta do stuff with it?
		//and funny, now that we struggled through that... just submit the form
		
		posturl = "mailboxes/"+choice;
		
		insert_into_msg = function(response){
			msgpne = dijit.byId("MessagesListPane");
			msgpne.setContent(response);
			
			var myloading = dojo.byId('mailchecktime');
			ourdate = new Date();
			myloading.innerHTML = ourdate.toLocaleString();
			
		}
		
		submitFormData(posturl, msgForm, insert_into_msg);
		 
	}	
	

	


	

    



	
    var updateResponse = function(response){
    	//what to be done?
    }

	
	function loadWidget(thename){
		console.debug("you rang?");
	}
	
	function CapuchnWidget(){
		this.columns = 2;
		this.layout = [];
		this.config = {"last":1,"layout":[[],[]]};//default config
	}
	
	Capuchn.widget = new CapuchnWidget();
	
	Capuchn.widget.saveConfig = function(){
		
		dojo.rawXhrPost({
				url: "user/saveconfig",
				handleAs: "json-comment-filtered",
				postData: dojo.toJson(Capuchn.widget.config),
				timeout: 1000,
				load: function(response, ioArgs){
					console.debug(response);
					return response;
				},
				error: function(response, ioArgs){
					console.debug(response);
					return response;
				}
		});
		
	}
	
	Capuchn.widget.add = function(widgetId){
		Capuchn.widget.config.last++;
		console.debug("Length is " + Capuchn.widget.config.layout[0].length);
		idx = Capuchn.widget.config.layout[0].length++;
		
		//uneeded, just do it in the layout itself
		//Capuchn.widget.config[Capuchn.widget.config.last] = {"id":widgetId};//config options
		Capuchn.widget.config.layout[0][idx] =  {"id":widgetId,"instanceid":Capuchn.widget.config.last} ;
		console.debug("Length is now: " + idx);
		console.debug(Capuchn.widget.config);
		Capuchn.widget.saveConfig();
		Capuchn.widget.get(Capuchn.widget.config.last);
	}
	
	Capuchn.widget.info = function(iid){
		//search for the widget in the layout by its instance id and
		//return the config object along with its 'address'
		widg = null
		for (j in Capuchn.widget.config.layout) {
			for (i in Capuchn.widget.config.layout[j]) {
				if (Capuchn.widget.config.layout[j][i].instanceid == iid) {
					widg = Capuchn.widget.config.layout[j][i];
					widg.col = j;
					widg.row = i;
					break;
				}
			}
			if(widg != null)break;//not sure if the above will break both loops
		}
		return widg;		
	}
	
	Capuchn.widget.get = function(instanceid){
		if(Capuchn.widget.pending != null){
			console.debug("Pending widget still, cannot get", Capuchn.widget.pending);
			return;
		}
		
		Capuchn.widget.pending = Capuchn.widget.info(instanceid);
		console.debug("row,col - "+Capuchn.widget.pending.row+" , "+Capuchn.widget.pending.col);
		if(Capuchn.widget.pending == null){
			Console.debug('Failed to fetch widget info');
			return;
		}
		//getting ajax widget.... 
		var kw = {
			url: "widget/getajaxwidget/"+instanceid,
			postData: {"requested":"1"},
			timeout: 2000,
			//handleAs: "json-comment-filtered",
			error: function(data,ioargs){
				console.debug("error occurred in Capuchn.get.widget: ",data);
			},
			load: function(response,ioargs){
				Capuchn.widget.display(response);
				//displayWidget(response);
			}
		}
		dojo.xhrPost(kw);
	}
	
	Capuchn.widget.display = function(response){
		//there is really no good reason why I would want to do this
		//the way I have been. so.... just
		if(Capuchn.widget.pending == null){
			alert("No widgets pending display");
			return;
		}
		
//		var widgetWrapper = document.createElement("div");
//		widgetWrapper.innerHTML(response);
		
		superNode = document.createElement('div');
		superNode.innerHTML = response;
		for(i in superNode.childNodes){
			if (superNode.childNodes[i].tagName == "DIV") {
				widgetNode = superNode.childNodes[i];
				break;
			}
		}
		
		//widgetNode = document.createTextNode(response);
		console.debug('The column is : column_'+Capuchn.widget.pending.col);
		column = dojo.byId('column_'+Capuchn.widget.pending.col);
		rowcount = 0;
		added = false;
		
		for(i in column.childNodes){
			if(column.childNodes[i].tagName == "DIV"){
				if (Capuchn.widget.pending.row == rowcount) {
					column.insertBefore(widgetNode, column.childNodes[i]);
					added = true;
					break;
				}else if (Capuchn.widget.pending.row < rowcount) {
					//I dont think I can ever get here.
					column.appendChild(widgetNode);
					added = true;
					break;
				} else {
					rowcount++;//found a div
				}
			}
		}
		//fell off the end... append
		if(!added)column.appendChild(widgetNode);
		
		//been inserted. i guess. set pending to null
		Capuchn.widget.pending = null;

	}
	
	Capuchn.widget.move = function(iid,dir){
		
		curr = Capuchn.widget.info(iid);
		
		if (dir == "left") {
			if (curr.col == 0) {
				console.debug('Already in left most col');
				return;
			}
			//update the config,
			//update the dom
			Capuchn.widget.config.layout[curr.col].splice(curr.row, 1);
			Capuchn.widget.config.layout[curr.col - 1].push(curr);
			//just in case someone is relying on row and col 
			curr = Capuchn.widget.info(iid);
			currNode = dojo.byId("wrapper_" + iid);
			curr.col = parseInt(curr.col);
			oldcol = dojo.byId("column_" + (curr.col + 1));
			newcol = dojo.byId("column_" + curr.col);
			oldcol.removeChild(currNode);
			newcol.appendChild(currNode);
		} else if (dir == "right"){
			
			if (curr.col ==	(Capuchn.widget.columns-1)) {
				console.debug('Already in right most col');
				return;
			}
			//update the config,
			//update the dom
			curr.col = parseInt(curr.col);
			console.debug(typeof curr.col);
			Capuchn.widget.config.layout[curr.col].splice(curr.row, 1);
			Capuchn.widget.config.layout[curr.col + 1].push(curr);
			//just in case someone is relying on row and col 
			curr = Capuchn.widget.info(iid);
			currNode = dojo.byId("wrapper_" + iid);
			oldcol = dojo.byId("column_" + (curr.col - 1));
			newcol = dojo.byId("column_" + curr.col);
			oldcol.removeChild(currNode);
			newcol.appendChild(currNode);
		} else if (dir == "up"){
			if(curr.row == 0){
				console.debug("already at top");
				return;
			}
			//swap in array
			tmp = Capuchn.widget.config.layout[curr.col][curr.row-1]	
			Capuchn.widget.config.layout[curr.col][curr.row-1] = curr;
			Capuchn.widget.config.layout[curr.col][curr.row] = tmp;
			aboveiid = Capuchn.widget.config.layout[curr.col][curr.row].instanceid;
			currNode = dojo.byId("wrapper_" + iid);
			aboveNode = dojo.byId("wrapper_" + aboveiid);
			currcol = dojo.byId("column_" + curr.col);
			currcol.removeChild(currNode);
			currcol.insertBefore(currNode,aboveNode);

		}else if (dir == "down"){
			console.debug(Capuchn.widget.config.layout[curr.col].length);
			console.debug(curr.row);
			if(curr.row >= (Capuchn.widget.config.layout[curr.col].length-1)){
				console.debug("already at bottom");
				return;
			}
			//swap in array
			curr.row = parseInt(curr.row);
			tmp = Capuchn.widget.config.layout[curr.col][curr.row+1]	
			console.debug(tmp);
			Capuchn.widget.config.layout[curr.col][curr.row+1] = curr;
			Capuchn.widget.config.layout[curr.col][curr.row] = tmp;
			
			belowiid = Capuchn.widget.config.layout[curr.col][curr.row].instanceid;
			currNode = dojo.byId("wrapper_" + iid);
			currcol = dojo.byId("column_" + curr.col);
			currcol.removeChild(currNode);
			//if at bottom, append, otherwise, insert befire the next node.
			if (Capuchn.widget.config.layout[curr.col].length >= (curr.row + 2)) {
				currcol.appendChild(currNode);
			}
			else {
				aboveiid = Capuchn.widget.config.layout[curr.col][curr.row + 2].instanceid;
				aboveNode = dojo.byId("wrapper_" + aboveiid);
				currcol.insertBefore(currNode,aboveNode);
			}
		}
		Capuchn.widget.saveConfig();
		
	}
	
	Capuchn.widget.close = function(iid){
		curr = Capuchn.widget.info(iid);
		curr.col = parseInt(curr.col);;
		Capuchn.widget.config.layout[curr.col].splice(curr.row, 1);
		//just in case someone is relying on row and col 
		currNode = dojo.byId("wrapper_" + iid);
		oldcol = dojo.byId("column_" + (curr.col));
		oldcol.removeChild(currNode);
		Capuchn.widget.saveConfig();
	}
	
	Capuchn.widget.instanceedit = function(iid){
		//get vars, any type
		Capuchn.widget.createPrefsForm(iid);
	}
	
	Capuchn.widget.createPrefsForm = function(iid){
		//I suppose it needs to be iid to get the html node
		curr = Capuchn.widget.info(iid);
		currNode = dojo.byId("wrapper_" + iid);
		prefs = currNode.getElementsByTagName("PREFERENCES");
			
		formelm = [];	
		for(i in prefs){
			formelements = {}
			if (prefs[i].attributes != undefined) {
				for (j in prefs[i].attributes) {
					if (prefs[i].attributes[j].name == "default") {
						formelements.def = prefs[i].attributes[j].value;
					}
					else 
						if (prefs[i].attributes[j].name == "type") {
							val = prefs[i].attributes[j].value;
							switch (val) {
								case "number":
									formelements.type = "number";
									break;
								case "number":
									formelements.type = "boolean";
									break;
								case "number":
									formelements.type = "static";
									break;
								case "text":
								default:
									formelements.type = "text";
							}
						}
						else 
							if (prefs[i].attributes[j].name == "value") {
								formelements.value = prefs[i].attributes[j].value;
							}
							else {
								formelements[prefs[i].attributes[j].name] = prefs[i].attributes[j].value;
							}
				}
				formelm.push(formelements);
			}
			//could check here to make sure there are enough elements. but i dont want to
			
		}
		console.debug(formelm);
		
		//generate a form based off of this 
		////////////////////////////
		//see if we have thi saved and make sure to use the save values as defaults
		////////////////////////////
		
		//create table		
		tbl = document.createElement("table");
		for(obj in formelm){
			cname = formelm[obj].name;
			cval = formelm[obj].value;
			cdef = formelm[obj].def;
			rw = document.createElement("tr");
			dttitle = document.createElement("td");
			dttitle.innerHTML = cname;
			rw.appendChild(dttitle);

			dt = document.createElement("td");
			rw.appendChild(dt);
			switch (formelm[obj].type){
				case "text":
					ipt = document.createElement("input");
					ipt.name = cname;
					ipt.value = cval;
					ipt.innerHTML = cval;
					dt.appendChild(ipt)
					console.debug("ipt: "+cval);
					dipt = new dijit.form.TextBox({name:cname,value:cval},ipt);					
					break;
				case "boolean":
					ipt = document.createElement("input");
					dt.appendChild(ipt)
					dipt = new dijit.form.CheckBox({},ipt);
					dipt.name = cname;
					dipt.value = cval;
					break;
				case "static":
					dt.appendChild(document.createTextNode(cval));
					break;
			}
			tbl.appendChild(rw);
		}
		btn = document.createElement('button');
		nrw = document.createElement("tr");
		nd = document.createElement("td");
		nd.colspan = "2";
		nrw.appendChild(nd);
		nd.appendChild(btn);
		tbl.appendChild(nrw);
		btn.innerHTML = "submit";
		dbtn = new dijit.form.Button({type:"submit"},btn);
	
		diag = document.createElement("div");
		diag.appendChild(tbl);
		ddiag = new dijit.Dialog({},diag);
		ddiag.execute = function(){
			console.debug(arguments);
			Capuchn.widget.savewidgetinstance(arguments[0]);
		}
		ddiag.show()
	}
	
	Capuchn.widget.savewidgetinstance = function(){
		console.debug("still not saving instance vars");
		console.debug(arguments[0]);
		//arguments 0 here seems to have all the form data needed, we probably also want to add
		//the instance id in the form... just for good measure :)
	}
	
	
	//editor
	function saveWidget(button){
		dataWidgetAdmin.toggleEditor();
		dataWidgetDisplay.toggleEditor();
		dataWidgetCallback.toggleEditor();
	    var currentForm = dojo.byId(button.id).form;
	    console.debug(currentForm);
		var kw = {
	    	url: "widget/edit",
			handleAs:"json-comment-filtered",
	 		load: function(responseObj,ioargs){
				save_response_callback_json(responseObj);
	    	},
	    	error: function(data){
		            console.debug("An error occurred: ", data);
	        },
	        timeout: 2000,
	    	form: currentForm.id
		};
		dojo.xhrPost(kw);		
		//Turn them back on...
		dataWidgetAdmin.toggleEditor();
		dataWidgetDisplay.toggleEditor();
		dataWidgetCallback.toggleEditor();
	}

	function saveSiteVars(){
		var kw = {
	    	url: 'admin/updatesite',
			handleAs: "json-comment-filtered",
	 		load: function(responseObj, ioArgs){
				save_response_callback_json(responseObj);					
	    	},
	    	error: function(data, ioArgs){
		            console.debug("An error occurred: ", data);
	        },
	        timeout: 2000,
	    	form: 'sitevarsform'
		};
		dojo.xhrPost(kw);		
	}
	
	function saveFile(){
		//need to write back to file
		fileEditor.toggleEditor();
		var kw = {
	    	url: 'admin/savetofile',
			handleAs: "json-comment-filtered",
	 		load: function(responseObj, ioArgs){
				save_response_callback_json(responseObj);					
	    	},
	    	error: function(data, ioArgs){
		            console.debug("An error occurred: ", data);
	        },
	        timeout: 4000,
	    	form: 'fileeditform'
		};
		dojo.xhrPost(kw);
		fileEditor.toggleEditor();
	}
		
	function deleteImage(imageId,needconfirm){
		console.debug("delete image " + imageId);
		
		if (needconfirm==true || confirm('Delete image id: ' + imageId + "?")) {
			//also find the image in the sidebar
			//should just reload the pages... but whatever
			try{
				console.debug("deleting : "+"thumbddock_"+imageId);
				imgdiv = dojo.byId("thumbddock_"+imageId);
				console.debug(imgdiv);
				if(imgdiv){
					imgdiv.parentNode.removeChild(imgdiv);
				}
			}catch(e){
				console.debug("image not in main screen",e);
			}
			
			try{
				sideimgdiv = dojo.byId("sidethumbddock_"+imageId);
				console.debug(sideimgdiv);
				if(sideimgdiv){
					sideimgdiv.parentNode.removeChild(sideimgdiv);
				}
			}catch(e){
				console.debug("image not in sidebar",e);
			}
			//send 
			var kw = {
				url: "images/delete/" + imageId,
				handleAs: "json-comment-filtered",
				load: function(response,ioargs){
					save_response_callback_json(response);
				},
				error: function(data,ioargs){
					console.debug("An error occurred: ", data);
				},
				timeout: 2000
			};
			dojo.xhrPost(kw);
		}
		
	}
	
	    
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
			urlconverter_callback: "conurl", 
			//documentBaseURL : baseurl,
		    gecko_spellcheck : true,
		    debug : true,
		    init_instance_callback : "myInitFunction",
			handle_event_callback : "myHandleEvent",
		    width : "100%",
			height: "100%"
		    
	});
	
	function conurl(url, node, on_save) {
	   // strUrl=strUrl.replace("../","");
	   t = tinyMCE.activeEditor;
	   u = t.documentBaseURI.toAbsolute(url, t.settings.remove_script_host);
	   strUrl = url;
	   
	   console.debug("Convert url:"+strUrl);
	   return strUrl;
	} 
	
	function myHandleEvent(e) {
		//console.debug( "event:" + e.type);
		if (e.type == "mouseup") {			
		    mySelection = tinyMCE.activeEditor.selection.getNode();
	        if (mySelection.tagName == "IMG") {
				var imgdbid = mySelection.id.split("_");
				if (imgdbid.length > 2) {
					//the id of the image should be the very last section of the id
					var url = imgdbid[imgdbid.length - 1];
					
					//dynamic url, uses 100pixel width
					var nimgurl = baseurl + "images/dynamic/" + url + "/" + mySelection.width + "/" + mySelection.height;
					mySelection.src = nimgurl;
					for (attrib in mySelection.attributes) {
						if (mySelection.attributes[attrib].nodeName == "src") {
							mySelection.attributes[attrib].value = nimgurl;
							break;
						}
					}
				}
	        }

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
					//get  image id
					//
					var imgdbid = curnode.id.split("_");
					if (imgdbid.length > 1) {
						//the id of the image should be the very last section of the id
						var url = imgdbid[imgdbid.length - 1];
					}
					//dynamic url, uses 100pixel width
					var nimgurl = baseurl+"images/dynamic/"+url+"/100";
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
					
					//new_img.src = newimagesource;
					console.debug(nimgurl);
					new_img.src = nimgurl;
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
	    editorResize(inst);
		window.onresize = function () {
	        editorResize(inst);
			
	    };
	}
	
	function editorResize(inst) {
	    var editorFrame, editorX, editorY, winHeight, editorMaxHeight, IE;    
	    var oldElement = inst.getElement();
		if (oldElement != undefined) {
			editorY = oldElement.parentNode.offsetParent.offsetHeight;
			document.getElementById(inst.editorId).style.height = (editorY - 103) + "px";
			//TODO: add this function to the function list
			frame = document.getElementById(inst.editorId + "_ifr");
			frame.style.height = (editorY - 103) + "px";
		}
		//if oldElelment is undefined then this instance is no longer valid
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
		console.debug("Filebrowser callback: field_name: " + field_name + ", url: " + url + ", type: " + type);

		// Insert new URL, this would normaly be done in a popup
		win.document.forms[0].elements[field_name].value = "someurl.htm";
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
	

   /*
    * dump (object, string, "<br/>", "&nbsp;", 5)
    */
	function dump(theItem,theItemName,recDelim,aNester,
	      howDeep,begString,endString) {
	   dumpDepthCount = 0;
	   maxDumpDepth = 5;
	   newline = "";
	   nester = "";
	   debugString = "";
	   if (howDeep) {
	      if (howDeep > maxDumpDepth) {
	         keepItUp = confirm("The debugging function dump() is being called with a greater nest level than is recommended.\nThis may take a 	       while, and it may error out or crash your 	         browser.\nContinue?");
	         if (!keepItUp) { 
	            return;
	         }
	      }
	      maxDumpDepth = howDeep;
	   }
	   recDelim ? newline = recDelim : newline = '\n';
	   aNester ? nester = aNester : nester = '\t';
	
	   function indent() {
	      var retVal = "";
	      for (var i=dumpDepthCount; i>1; i--) {
	         retVal += nester;
	      }
	      return retVal;
	   }
   	   function asdlkasf(theItem,theItemName) {
	      dumpDepthCount++;
	      if (dumpDepthCount >= maxDumpDepth) {
	         dumpDepthCount--;
	         return;
	      }
	      var itemType = typeof theItem;
	      switch(itemType) {
	         case "number":
	         case "boolean":
	            debugString += indent() + theItemName + 
	            ', a ' + itemType + ': ' + 
	            theItem.toString().toLowerCase() + newline;
	            break;
	         case "string":
	            debugString += indent() + theItemName + 
	            ", a string: '" + theItem + "'" + newline;
	            break;
	         case "function":
	            if (theItem.toString().indexOf(
	            'native code]') == -1) {
	               indentStr = newline+indent();
	               debugString += indent() + theItemName + 
	                  ', a function: ' + 
	                  theItem.toString().replace(
	                     /(\\n|\<br\>)/g, indentStr) + 
	                  newline;
	            }
	            break;
	         case "object":
	            try {
	               debugString += indent() + theItemName + 
	                  ', an object' + newline;
	               for (att in theItem) {
	                  if (att && att != "undefined" && 
	                     theItem[att] && 
	                     theItem[att] != "undefined" && 
	                     att != 'parentNode' && 
	                     att != 'offsetParent' && 
	                     att != 'ownerDocument' && 
	                     att != 'nextSibling' && 
	                     att != 'previousSibling') {
	                        asdlkasf(theItem[att],att) + 
	                           newline;
	                  }
	               }
	            } catch (ex) {
	               debugString += indent() + "(" + att + 
	                  " inaccessible as object attribute)" 
	                  + newline;
	            }
	            try {
	               if (theItem[0]) {
	                  debugString += indent() + theItemName 
	                     + ', an array' + newline;
	                  dumpDepthCount++;
	                  for (var i=0;i<theItem.length;i++) { 
	                     if (theItem[i]) {
	                        if (theItem[i] && 
	                           theItem[i] != "undefined") {
	                           debugString += indent() + 
	                              "Index " + i + newline;
	                           asdlkasf(theItem[i],i) + 
	                              newline;
	                        }
	                     }
	                  }
	                  dumpDepthCount--;
	               }
	            } catch (ex) {
	               debugString += indent() + "(Index " + i 
	                  + " inaccessible as array element)" 
	                  + newline;
	            }
	            break;
	         case "undefined":
	            debugString += indent() + 
	               "(type undefined)";
	            break;
	      }
	      dumpDepthCount--;
	   }
	
	   if (begString && begString.length > 0) {
	      debugString += begString;
	   }
	   asdlkasf(theItem,theItemName,recDelim,aNester);
	   if (endString && endString.length > 0)  {
	      debugString += endString;
	   }
	   return debugString;
	}

	
