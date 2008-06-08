<?php
/*
 * Images controller 
 * Upload, organize and manage
 * 
 */

class ImagesController extends AppController
{
	var $name = 'Images';
	var $helpers = array('Html','Javascript','Tree', 'Ajax');
	var $components = array('ContentList','SwfUpload');
	var $uses = array('Mag','Volume','Image','Album','Admin');
	var $layout = 'ajax';//To start, later the default may change to something else.
	//todo fix this for directory seperator
	var $cacheDir = 'cache/'; // relative to 'img'.DS .'cachdir'
	var $pictures = "";
	//TODO: get this from the config, or however that will work out
	var $fullURL =  "";
	
	function beforeFilter()
    {
    	//this will enable some features, but will not redirect. specifically, this will set admin_enable (t or f)
        //$this->checkSessionAll();
    	$this->set('content_list', $this->Volume->findAllThreaded());
    	$this->set('magid', 0);//reset this if we have a priciple mag
    	$this->set('admin_enable', false);
    	$this->imgfolder = APP . DS . WEBROOT_DIR . DS . "img" . DS . "pictures" . DS;
		$this->pictures = $this->Admin->siteVar('imagepath');
		$this->fullURL = $this->Admin->siteVar('absoluteimageurl');

    }
    
    function index($album=null){
    	$this->checkSession();
		//TODO: must load a special layout to include swfupload.
		$alid=0;
    	if($album == null){
    		$files = $this->Image->findAllByAlbumId('0');
    	}else{
    		if(is_numeric($album)){
				$files = $this->Image->findAllByAlbumId($album);
				$alid = $album;
			}else{
				$album = $this->Album->findAllByName($album);				
				$files = $this->Image->findAllByAlbumId($album[0]['Album']['id']);
				$alid = $album[0]['Album']['id'];
			}
    	}
		$this->set('selectedalbum',$alid);
		$this->set('albums', $this->Album->findAll());//go away
    	$this->set('files',$files);
    	$this->set('path',$this->pictures);
    	$this->set('baseurl', $this->fullURL);
    	$this->set('debug', "");
    	
    }
	
	function dynamic($id = null, $width=0, $height=0, $aspect = 1 ){
		if($id != null){
			//get the image data , 
			//read from the file
			//set the location and size and do output in view
			$this->Image->id = $id;
			$img = $this->Image->read();
			$this->set('image',$img);
			$this->set('width',$width);
			$this->set('height',$height);
			$this->set('asp',$aspect);
			$this->set('path',$this->Admin->siteVar('imglocalpath'));
			$this->render('dynamic','ajax');
		}
	}
	
	function adminside($album=null){
		//TODO: must load a special layout to include swfupload. ooooh, special
		$album = mysql_real_escape_string($album);
		$aid = 0;
    	if($album == null){
    		//$files = $this->Image->findAllByAlbumId('0');
			//only get the last 10 pics....
			$files = $this->Image->findAll("`album_id`=0",null,"`Image`.`id` DESC",10);
    	}else{
    		if(is_numeric($album)){
				$files = $this->Image->findAllByAlbumId($album);
				$aid = $album;
			}else{
				$album = $this->Album->findAllByName($album);				
				$files = $this->Image->findAllByAlbumId($album[0]['Album']['id']);
				$aid = $album[0]['Album']['id'];
			}
    	}
		$this->set('selectedalbum',$aid);
    	$this->set('files',$files);
    	$this->set('path',$this->pictures);
    	$this->set('baseurl', $this->fullURL);
    	$this->set('debug', "");
	}
	
	function adminsidefiles($album=null){
		$this->checkSession();
    	if($album == null){
    		//$files = $this->Image->findAllByAlbumId('0');
			//only get the last 10 pics....
			$files = $this->Image->findAll("`album_id`=0",null,"`Image`.`id` DESC",10);
    	}else{
    		if(is_numeric($album)){
				$files = $this->Image->findAllByAlbumId($album);
			}else{
				$album = $this->Album->findAllByName($album);
				$files = $this->Image->findAllByAlbumId($album[0]['Album']['id']);
			}
    	}
    	$this->set('files',$files);
    	$this->set('justimages',true);
		$this->set('path',$this->pictures);
    	$this->set('baseurl', $this->fullURL);
    	$this->set('debug', "");
		$this->render('adminside','ajax');
	}
	
    /*
     * Upload takes pictures from swfupload, makes a thumb and then puts them in the db.
     * This should make use of the functions in the image model, as there is quite a lot
     * of code duplications.
     */
    function upload ($from = null) {		
		//$this->checkSession();
		//check session doesnt work cause swf doesnt have the same cookie.
		//TODO: fix upload to allow you to choose an album
		/*
		 * Called by swfupload scripts. this returns an error that swfupload will understand with 
		 * an http error message or 
		 */
		$stat = array("status"=>false,"message"=>"unknown error");
    	$this->layout = 'ajax';
		//$this->log($this->params);
		$this->log($this->params);
		$albumid = $this->data['Image']['album_id'];
		if($albumid == ""){
			$albumid = 0;
		}
		// Check the upload
		
		$output = "";
		if (!isset($_FILES["Filedata"]) || !is_uploaded_file($_FILES["Filedata"]["tmp_name"]) || $_FILES["Filedata"]["error"] != 0) {
			$stat['message'] = "No file or upload did not complete or form is incorrect";
			$this->set('output',$stat);
			$this->render('textarea','ajax');
			exit(0);
		}
		
    	$filen = $_FILES["Filedata"]["tmp_name"];
    	$filename = $_FILES["Filedata"]["name"];
		$fp = $this->imgfolder.$_FILES["Filedata"]["name"];
			//`cp $filen /tmp/mydata.jpg`;
		if(!move_uploaded_file($filen,$fp)){
			$stat['message'] = "File move failed, check your /img/pictures folder for writability";
			$this->set('output',$stat);
			$this->render('textarea','ajax');
    		exit(0);
		}else{
			//construct the array
			//I 
			//TODO: get the album for the image, or attempt to
			//TODO: check for existing file, this will clobber that and we will end up with 2 db entries pointing toward the same file
			$img = array();
			$img['Image'] = array();
			$img['Image']['location'] = $_FILES["Filedata"]["name"];
			$img['Image']['name'] = $_FILES["Filedata"]["name"];
			$img['Image']['album_id'] = $albumid;
			$img['Image']['user_id'] = 0;
			$thumb = $this->Image->resize($filename,100,100);//Returns them thumb relative to the base images folder cache/imgs.jpg for example
			//these should be site variables. secondary
			//TODO make these in settings.
			$fullpath = ROOT.DS.APP_DIR.DS.WEBROOT_DIR.DS.'img'.DS.'pictures'.DS;
	    	$url = $fullpath.$filename;			
			$this->log("Saved image: ". $filename);
	    	if (file_exists($url)) {
	    		$csize = getimagesize($url);
	    		//$cached = ($csize[0] == $width && $csize[1] == $height); // image is cached
	    		$img['Image']['width'] = $csize[0];
	    		$img['Image']['height'] = $csize[1];
	    	}
	    	
	    	if($this->Session->check('User')){
	    		$user = $this->Session->read('User');
	    		$img['Image']['user_id'] = $user['id'];
	    	}
	    	
	    	if($this->Session->check('Site')){
	    		$site = $this->Session->read('Site');
	    		$img['Image']['album_id'] = $site['default_album'];
	    	}
	    	
	    	//TODO read further information and setup a secondary table to store exif info, size on disk, coordinates
			
	    	$img['Image']['thumb'] = $thumb;
			if(!$this->Image->save($img)){
				$stat['message'] = "Failed to save file to the database";
				$this->set('output',$stat);
				$this->render('textarea','ajax');
				exit(0);
			}else{
				//get last inst
				$id = $this->Image->getLastInsertId();
				$stat['message'] = "Saved file! - ".$id;
			}
			
		} 	
		//Convert this to JSON
		$this->log($img);
		$this->set('output',$stat);
		$this->render('textarea','ajax');
    }
	
    function thumbnail($image_id = false){
    	$this->checkSession();
		//TODO: delete this function
    	//$image_id = isset($_GET["id"]) ? $_GET["id"] : false;
				
		if ($image_id === false) {
			header("HTTP/1.1 500 Internal Server Error");
			echo "No ID";
			exit(0);
		}
		
		if($this->Session->check('file_info')){
			$finfo = $this->Session->read('file_info');
			
			if (!is_array($finfo) || !isset($finfo)) {
				header("HTTP/1.1 404 Not found");
				exit(0);
			}
		}
	
		header("Content-type: image/jpeg") ;
		header("Content-Length: ".strlen($finfo[$image_id]));
		//$this->set('fileoutput', $finfo[$image_id]);
		$this->set('fileoutput', $this->Image->resize($filename,100,100));
		$this->render('thumbnail', 'ajax');
		exit(0);
    }
    
	function edit($id=NULL){
		$this->checkSession();
		/*
		 * This is the dialog output on the image gallery admin page
		 */
		$this->layout = 'ajax';
		//do something when id is null
		//CANNOT be used to add like other functions
		if($id != NULL){				
			$this->Image->id = $id;
			if(!empty($this->data)){
				 if (!$this->Image->save($this->data))
		         {
		            $this->validateErrors($this->Image);		            
		         }
			}
		}else{
			$id = '0';
		}
		/*************Generate form***********/
		$this->Image->id = $id;
		$imgdata = $this->Image->read();
		$this->data = $imgdata;		
		if($imgdata['Image']['width']>0){
			$vals = $this->Image->aspectResize($imgdata['Image']['width'],$imgdata['Image']['height'],400);
			$this->set('width', $vals[0]);
			$this->set('height',$vals[1]);
		}
		
		$this->set('file',$imgdata);
    	$this->set('path',$this->pictures);
    	$this->set('baseurl', $this->fullURL);
		
    	$this->set('debug', "");
		
	}//end edit
    
	function delete($id=NULL){
		$this->checkSessionAjax();
		$status = false;
		
		if($id == NULL){
			$message = "FAILED - no id passed to delete";
			$status = false;
		}else{
			//TODO: add more information on failure
			if($this->Image->del($id)){
				$message = "DELETED - $id";
				$status = true;
			}else{
				$message = "FAILED - $id";
			}
		}
		$this->set('output',array("status"=>$status,"message"=>$message));
		$this->render('json','ajax');
	}
	
	function update($id){
		$this->checkSessionAjax();
		vendor('JSON');
		$js = new Services_JSON();
		$output = file_get_contents('php://input');
		$input = $js->decode($output);
		$stat = array("status"=>false,"message"=>"failed for some reason");
		if($id != NULL){				
			$this->Image->id = $id;
			if(!empty($input)){
				$imgdata = $this->Image->read();
				//	currently not updating album, only the name
				$imgdata['Image']['name']=$input->value; 
			
				 if (!$this->Image->save($imgdata))
		         {
		            //$this->validateErrors($this->Image);
		            $stat['message'] = "Failed to save to db - ".$this->validateError($this->Image);
		         }else{
		         	$stat['status'] = true;
					$stat['message'] = "Saved new name - ".$input->value;
		         }
			}else{
				$stat['message'] = "Failed to decode, or empty - ".$output;
			}
		}else{
			$stat['message'] = "No ID in url";
		}
		$this->set('output', $stat);
		$this->render('json','ajax');
	}
}

?>