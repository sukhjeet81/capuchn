	/**
	* @author Scott Fennell
	* Rev 15
	* 
	*/
	var Capuchn = {};
	dojo.require("dijit.Tooltip");
	dojo.require("dojo.io.iframe");
	
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
	
	function loadAlbumSelect(){
		console.debug("loadAlbumSelect still being called");
		dojo.publish('updateAlbums');
	}
	dojo.subscribe("updateAlbums", function(){
				oldselect = dijit.byId("AlbumSelect");
		if (oldselect) {
			oldselect.destroy();
		}
		albumDirectory = new dojo.data.ItemFileReadStore({url:"albums/jslist"})
		myfilterselect = new dijit.form.FilteringSelect(
								{
									store: albumDirectory,
									searchAttr:'name',
									name:'albumselect',
									id:'AlbumSelect',
									autocomplete:true
								});
		myfilterselect.onChange = function (newvalue){
			
			albumDirectory.fetchItemByIdentity({
			  identity: newvalue, 
			  onItem: function(item){
			    ip = dijit.byId("ImagesPane");
				dojo.publish("changeAlbum", [albumDirectory.getValue(item,"id")])
				console.debug("The ID for the album you have chosen is: ", albumDirectory.getValue(item,"id"));
			  }
			});			
		}
		
		dojo.byId('albumSelectBox').appendChild(myfilterselect.domNode);	
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
	
	function addNewAlbum(dialogFields) {
		//console.debug(dialogFields[0].name);
		var kw = {
		url: "albums/add/" + dialogFields[0].name,
		handleAs:"json-comment-filtered",
		load: function(responseObj, ioargs){
				
				if(responseObj.status){
					dojo.publish("updateAlbums",[]);
				}else{
					alert(responseObj.message);
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
	
	function albumTab(){
		tabUrl = "albums/index";
		newTabId = "albumManageTab";
		mywidget = dijit.byId(newTabId);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {
		
			var newtab = new dojox.layout.ContentPane({
				id: newTabId,
				title: "Albums",
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
	function changeAlbum(){
	//get the new album, set the href of tab1
	
	}
	
	function albumEditBoxHandler(idOfBox,value){
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
	        },
	        error: function(response, ioArgs) {
	                return response;
	        }
		});
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


	
	function imagesTab(){
		if(currentAlbum == undefined){
			currentAlbum = 0;
		}
		tabUrl = "images/index/"+currentAlbum;
		newTabId = "imageManageTab";
		mywidget = dijit.byId(newTabId);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {
			var newtab = new dojox.layout.ContentPane({
				id: newTabId,
				title: "Images",
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
		}
	   	tabcontain.selectChild(newtab);		
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
	
	function albumTab(){
		tabUrl = "albums/index";
		newTabId = "albumManageTab";
		mywidget = dijit.byId(newTabId);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {
		
			var newtab = new dojox.layout.ContentPane({
				id: newTabId,
				title: "Albums",
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
	
	function deleteAlbum(albumid, nodeToRemove){
		if (confirm('Delete Album' + albumid + "?")) {
			//send 
			var kw = {
				url: "albums/delete/" + albumid,
				handleAs:"json-comment-filtered",
	 			load: function(responseObj,ioargs){
					dojo.publish("updateAlbums", ["deleteAlbum"]);
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
	
	function dojofileupload(target){
		//setup the form
		thisform = dojo.byId('imgextended');
		if(thisform != undefined){
			if(thisform['Filedata'].value == ""){
				alert("select file first");
				return;
			}
			console.debug("currentAlbum: "+currentAlbum);
			thisform['data[Image][album_id]'].value = currentAlbum;
			console.debug(thisform);		
		}
		
		var bindArgs = {
			url: "images/upload",
			form: "imgextended",
			method: "post",
			handleAs: "json",
			load: function(data) {				
				console.debug(data);
				dojo.publish('changeAlbum',[currentAlbum]);
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
	


    function thumbClick(obj){
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
	

    
	function myHandler(idOfBox, value) {
    	console.debug("Edited value from "+idOfBox+" is now "+value);
    	var myimgid = idOfBox.split("_");//sleeping beauty
    	if (myimgid.length > 1) {
			//the id of the image should be the very last section of the id
			var url = myimgid[myimgid.length-1];
		}else{
    		alert("cannot parse image id");
    	}
    	var ext = dojo.byId("imgextended");
    	ext.elements[0].value=url;
    	ext.elements[1].value = value;
    	ext.elements[2].value = "";//userid ... not yet. 
    	ext.elements[3].value = "";//albumid
    	
    	submitFormData("images/update/"+url, ext, updateResponse);		
    }    
	


	
    var updateResponse = function(response){
    	//what to be done?
    }
    function imageLinkHandler(idOfBox, value){
    	console.debug("not editable - disable editing... make this onClick and set to copy");
    }
	
	function loadWidget(thename){
		console.debug("you rang?");
	}
	
	function addWidget(widgetId){
		//need to pull the configuration, 
		if(widgetConfig != undefined){			
			widgetConfig[""+widgetId] = {"prof":"save"};
			widgetConfig.layout.columnOne.push(widgetId);
			this.saveWidgetConfig();
		}else{
			console.debug("WidgetConfig... what a concept");
		}
		getWidget(widgetId);
	}
	
	function saveWidgetConfig(){
		if (widgetConfig != undefined) {
			dojo.rawXhrPost({
				url: "user/saveconfig",
				handleAs: "json-comment-filtered",
				postData: dojo.toJson(widgetConfig),
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
		}else{
			console.debug("widgetConfig is not here...")
		}
		
	}
	
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
	
	
	function moveWidgetLeft(wid){
		col = 0;
		pos = -1;
		//Find the widget in the layout array, probably a better way to do this but...
		for (var x = 0; x < widgetConfig.layout.columnOne.length; x++) {
			if (widgetConfig.layout.columnOne[x] == wid) {
				col = 1;
				pos = x;
				break;
			}
		}
		if (col == 0) {
			for (var x = 0; x < widgetConfig.layout.columnTwo.length; x++) {
				if (widgetConfig.layout.columnTwo[x] == wid) {
					col = 2;
					pos = x;
					break;
				}
			}
		}
		if(col < 1){
			console.debug("already as far left as possible");
		}else{
			var widgetLimbo  = widgetConfig.layout.columnTwo[pos];
			for(x = pos; x < widgetConfig.layout.columnTwo.length-1; x++){
				widgetConfig.layout.columnTwo[x] = widgetConfig.layout.columnTwo[x+1];				
			}
			widgetConfig.layout.columnTwo.pop();
			widgetConfig.layout.columnOne.push(widgetLimbo);
			parentCol = activeWidgets[widgetLimbo].parentNode;
			parentCol.removeChild(activeWidgets[widgetLimbo]);
			newCol = dojo.byId("widgetcolumnone");
			newCol.appendChild(activeWidgets[widgetLimbo]);
			saveWidgetConfig();
		}
		
		
	}
	
	function moveWidgetRight(wid){
		col = 0;
		pos = -1;
		//Find the widget in the layout array, probably a better way to do this but...
//		if (widgetConfig.layout.columnOne.length == 1) {
//			console.debug("cannot remove last widget from this column")
//		}
		for (var x = 0; x < widgetConfig.layout.columnOne.length; x++) {
			if (widgetConfig.layout.columnOne[x] == wid) {
				col = 1;
				pos = x;
				break;
			}
		}
		if (col == 0) {
			for (var x = 0; x < widgetConfig.layout.columnTwo.length; x++) {
				if (widgetConfig.layout.columnTwo[x] == wid) {
					col = 2;
					pos = x;
					break;
				}
			}
		}
		if((col == 2)|| (col == 0)){
			console.debug("cannot move this widget col is :" + col);
			console.debug(widgetConfig.layout);
		}else{
			var widgetLimbo  = widgetConfig.layout.columnOne[pos];
			for(x = pos; x < widgetConfig.layout.columnOne.length-1; x++){
				widgetConfig.layout.columnOne[x] = widgetConfig.layout.columnOne[x+1];				
			}
			widgetConfig.layout.columnOne.pop();
			widgetConfig.layout.columnTwo.push(widgetLimbo);
			parentCol = activeWidgets[widgetLimbo].parentNode;
			parentCol.removeChild(activeWidgets[widgetLimbo]);
			newCol = dojo.byId("widgetcolumntwo");
			newCol.appendChild(activeWidgets[widgetLimbo]);
			saveWidgetConfig();
		}
	}
	
	function moveWidgetUp(wid){
		col = 0;
		pos = -1;
		for (var x = 0; x < widgetConfig.layout.columnOne.length; x++){
			if(widgetConfig.layout.columnOne[x]==wid){
				col = 1;
				pos = x;
				break;
			}
		}
		if(col == 0){
			for (var x = 0; x < widgetConfig.layout.columnTwo.length; x++){
				if(widgetConfig.layout.columnTwo[x]==wid){
					col = 2;
					pos = x;
					break;
				}
			}
		}
		if((col == 0) || (pos == 0)){
			console.debug("cannot move this widget...")
		}else{
			if (col == 1) {
				movewidget = widgetConfig.layout.columnOne[pos];
				movedwidget = widgetConfig.layout.columnOne[pos - 1];
				widgetConfig.layout.columnOne[pos - 1] = movewidget;
				widgetConfig.layout.columnOne[pos] = movedwidget;
			}else{
				movewidget = widgetConfig.layout.columnTwo[pos];
				movedwidget = widgetConfig.layout.columnTwo[pos - 1];
				widgetConfig.layout.columnTwo[pos - 1] = movewidget;
				widgetConfig.layout.columnTwo[pos] = movedwidget;
			}
			parentCol = activeWidgets[movewidget].parentNode;
			parentCol.removeChild(activeWidgets[movewidget]);
			parentCol.insertBefore(activeWidgets[movewidget],activeWidgets[movedwidget]);
			saveWidgetConfig();
		}
	}
	
	function moveWidgetDown(wid){
		col = 0;
		pos = -1;
		//Find the widget in the layout array, probably a better way to do this but...
		for (var x = 0; x < widgetConfig.layout.columnOne.length; x++) {
			if (widgetConfig.layout.columnOne[x] == wid) {
				col = 1;
				pos = x;
				break;
			}
		}
		if (col == 0) {
			for (var x = 0; x < widgetConfig.layout.columnTwo.length; x++) {
				if (widgetConfig.layout.columnTwo[x] == wid) {
					col = 2;
					pos = x;
					break;
				}
			}
		}
		
		if (col == 1){
			var currcolLength = widgetConfig.layout.columnOne.length;
		}else if(col == 2){
			var currcolLength = widgetConfig.layout.columnTwo.length;
		}
		//Reposition elements in layout array and in dom
		if((col == 0) || (pos == (currcolLength-1))){
			console.debug("cannot move this widget...")

		}else{
			if (col == 1) {
				movewidget = widgetConfig.layout.columnOne[pos];
				movedwidget = widgetConfig.layout.columnOne[pos + 1];
				widgetConfig.layout.columnOne[pos + 1] = movewidget;
				widgetConfig.layout.columnOne[pos] = movedwidget;
			}else{
				movewidget = widgetConfig.layout.columnTwo[pos];
				movedwidget = widgetConfig.layout.columnTwo[pos + 1];
				widgetConfig.layout.columnTwo[pos + 1] = movewidget;
				widgetConfig.layout.columnTwo[pos] = movedwidget;
			}
			parentCol = activeWidgets[movewidget].parentNode;
			parentCol.removeChild(activeWidgets[movewidget]);
			parentCol.insertAfter(activeWidgets[movewidget],activeWidgets[movedwidget]);
			saveWidgetConfig();	
		}
		
		
	}
	
	function closeWidget(wid){
		col = 0;
		pos = -1;
		//Find the widget in the layout array, probably a better way to do this but...
		for (var x = 0; x < widgetConfig.layout.columnOne.length; x++) {
			if (widgetConfig.layout.columnOne[x] == wid) {
				col = 1;
				pos = x;
				break;
			}
		}
		if (col == 0) {
			for (var x = 0; x < widgetConfig.layout.columnTwo.length; x++) {
				if (widgetConfig.layout.columnTwo[x] == wid) {
					col = 2;
					pos = x;
					break;
				}
			}
		}
		if (col == 1) {
			var widgetLimbo = widgetConfig.layout.columnOne[pos];
			for (x = pos; x < widgetConfig.layout.columnOne.length - 1; x++) {
				widgetConfig.layout.columnOne[x] = widgetConfig.layout.columnOne[x + 1];
			}
			widgetConfig.layout.columnOne.pop();
		}else{
			var widgetLimbo = widgetConfig.layout.columnTwo[pos];
			for (x = pos; x < widgetConfig.layout.columnTwo.length - 1; x++) {
				widgetConfig.layout.columnTwo[x] = widgetConfig.layout.columnTwo[x + 1];
			}
			widgetConfig.layout.columnTwo.pop();
		}
		widgetLimbo = dojo.byId(activeWidgets[widgetLimbo].id);
		//console.debug( activeWidgets[widgetLimbo]);
		parentCol = widgetLimbo.parentNode;
		parentCol.removeChild(widgetLimbo);		
		saveWidgetConfig();
		console.debug("Deleted widget"+wid);
	}
	
	
	function imageDeleteFiles(){
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
	
	function siteTab(){
		tabUrl = "admin/site";
		newTabId = "siteManageTab";
		mywidget = dijit.byId(newTabId);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {
			var newtab = new dojox.layout.ContentPane({
				id: newTabId,
				title: "Site",
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
		}
	   	tabcontain.selectChild(newtab);
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

	
