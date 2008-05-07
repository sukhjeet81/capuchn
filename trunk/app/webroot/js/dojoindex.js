	/**
	* @author Scott Fennell
	* 
	* 
	*/

	dojo.require("dijit.Tooltip");
	dojo.require("dojo.io.iframe");
	
	/*Global variables*/
	var editorID = 0;
	var lastResponse = Array();
	var currentDragNode = null;
	
	var currentAlbum = 0;
	var contentDirectory;
	var albumDirectory;
	
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
		loadAlbumSelect();
	});
	
	
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
	
	function loadAlbumSelect(){
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
	
	function newAlbum(){
		dojo.publish("updateAlbums",[]);
		alert("creating a newAlbum");
	}
	

	function addNewAlbum(dialogFields) {
		//alert(dialogFields.albumName);
		console.debug(dialogFields[0].name);
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
	
	function imagesTab(){
		//create
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
			console.debug("old widget found.");
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
	
	
	function viewSiteTab(){
		//This should be the model for a tab creator function... since most are very similar
		tabUrl = baseurl;
		newTabId = "viewSiteTab";
		tabTitle = "Live Site";
		mywidget = dijit.byId(newTabId);
		var tabcontain = dijit.byId('mainTabContainer');
		if (!mywidget) {		
			//<iframe src="http://localhost:8080/TestHelloWorld" id="tab1" 
			//	dojoType="ContentPane" label="Test"
	  		//	refreshOnShow="true" cacheContent="false" style="display: 
			//	none;border:0px; width:100%; height:100%"></iframe>
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
				load: function(response){
					dojo.publish("updateAlbums", ["deleteAlbum"]);				
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
	
	
	function loadMag(magindex){		
		var taburl = "mags/edit/"+magindex;
		var new_tab_id = "mag_"+magindex;
		var mywidget = dijit.byId(new_tab_id);
		var tabcontain = dijit.byId('mainTabContainer');
		magcontrolid = "magcontent_"+magindex;
		if (!mywidget) {
			var seteditor = function(){
				tinyMCE.execCommand('mceAddControl', true, magcontrolid);
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
				//Get the editor
				if(!tinyMCE.execCommand('mceRemoveControl',false,magcontrolid)){
					console.debug("Failed to destroy/remove tinyMCE control: " + magcontrolid);
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
	
	function openTab(tab){
		console.debug("Depreciated openTab function being used.");
		var taburl = "posts/editview";
		if(tab == 'albums'){
			taburl = "albums/editview";
		}
	
		var newtab = new dojox.layout.ContentPane({
	   		id:tab,
	   		title:tab,
	   		closable:true,
	   		selected:true,
	   		href:taburl,
	   		executeScripts:true
	   		});
	   	
	   	var tabcontain = dijit.byId('mainTabContainer');
	   	tabcontain.addChild(newtab);
	   	tabcontain.selectChild(newtab);
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
	
	function save_response_callback(response){
		//TODO: do something with this list...
		lastResponse.push(response);
		//cant get any f-ing effects to work, so
		sn = dojo.byId("save_note_0");
		sn.innerHTML = "Saved";
		sn.style.opacity = "0.8";
		setTimeout(function(){sn.style.opacity = 0.0},2000);
	}
	
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
	   		href:taburl,
	   		});
	   		
	   var tabcontain = dijit.byId('mainTabContainer');
	   tabcontain.addChild(newtab);
	   tabcontain.selectChild(newtab);
		
	}	
	
	function messageCheck(msgid){
		388-2200
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
	
	dojo.subscribe("/dnd/start", function(source,nodes,iscopy){
	  console.debug(nodes);
	  console.debug(source);
	  currentDragNode = nodes;
	});
	
	dojo.subscribe("/dnd/drop", function(source,nodes,iscopy){
		currentDragNode = null;
		return true;
	});
	//This will most likely be the case since we are got it.
	dojo.subscribe("/dnd/cancel", function(){			
		currentDragNode = null;
	});
	
	function setswfuparams(){
		swfu.settings.post_params.Album = currentAlbum;
		swfu.setPostParams(swfu.settings.post_params);
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
			
	function swfuInit(target){	
		return false;		
		//MAKE this go away....
		if(!target)target = "";
		swfu = new SWFUpload({
			// Backend Settings
			upload_url: "http://sinvertical.grizzlyracing.org/images/upload/45",	// Relative to the SWF file
			post_params: {"PHPSESSID": phpsessionid,"Album": ""},

			// File Upload Settings
			file_size_limit : "2048",	// 2MB
			file_types : "*.*",
			file_types_description : "All",
			file_upload_limit : "0",

			// Event Handler Settings - these functions as defined in Handlers.js
			//  The handlers are not part of SWFUpload but are part of my website and control how
			//  my website reacts to the SWFUpload events.
			file_queue_error_handler : fileQueueError,
			file_dialog_complete_handler : fileDialogComplete,
			upload_progress_handler : uploadProgress,
			upload_error_handler : uploadError,
			upload_complete_handler : uploadComplete,
			file_complete_handler : fileComplete,

			// Flash Settings
			// flash_url : "/js/swfupload/swfupload_f8.swf",	// Relative to this file
			flash_url : "http://sinvertical.grizzlyracing.org/js/swfupload/swfupload.swf",
			// UI Settings
			swfupload_element_id : target+"swfu_container",
			//ui_container_id : target+"swfu_container",
			degraded_container_id : target+"degraded_container",

			// Debug Settings
			debug: true
		});
		swfu.customSettings.upload_target = target+"divFileProgressContainer";
	}
	
	function changeAlbum(){
	//get the new album, set the href of tab1
	
	}
	
	function initEditor(){
	  tinyMCE.idCounter=0;
	  tinyMCE.execCommand( 'mceAddControl', true, 'elm1' );		  
	}
	// Destroys the instance - very important otherwise you get all sorts of nasty errors
	function killEditor() {
	  tinyMCE.execCommand( 'mceRemoveControl', true, 'elm1' );
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
		
		for( img in frm.elements ){
			if ((frm.elements[img].name == "imgcheck") && (frm.elements[img].checked==true)) {
				selectedImages.push(frm.elements[img]);
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
	
	function editor(){
		//this is here because the editor changing script went away some time ago.
		
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
	
	

	
	
		/*
	dojo.addOnLoad(function() {
	   //initEditor();
	   updateMessageStore();
		});
		*/
	
