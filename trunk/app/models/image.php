<?php

class Image extends AppModel {
/*
 * This might make sense to actually save the image through here, but,,, oh well.
 */
	
  	var $name = 'Image';
  	var $imgpath = "path";
  	var $cacheDir = 'cache/'; // relative to 'img'.DS .'cachdir'
	//var $pictures = '/dev/sinvert/img/pictures/';
	//TODO: get this from the config, or however that will work out
	//var $fullURL =  "http://192.168.1.33/dev/sinvert/img/pictures/";
	//TODO: fix imagefolder to work for just more than this piano man. or for other installs. fuck. you.
	//var $imgfolder = '/var/www/dev/sinvert/app/webroot/img/pictures/';
	//var $imgfolder = ROOT.DS.APP_DIR.DS.WEBROOT_DIR.DS.'img'.DS.'pictures'.DS;
  
  	var $validate = array(
    	'album_id' => VALID_NUMBER,
  		'path' => VALID_NOT_EMPTY
  	);

	var $belongsTo = array('Album' =>
  						array(	'className'  => 'Album',
                                'conditions' => '',
                                'order'      => '',
                                'foreignKey' => 'Album_id'                           
  						),
  						'User' =>
  						array(	'className'  => 'User',
                                'conditions' => '',
                                'order'      => '',
                                'foreignKey' => 'user_id'                           
  						)
                    );

	/*
	 * addImageToDB
	 * This takes the filename and some extended var, an array that includes other info such
	 * as the album_id, user_id, etc.
	 */
   	
	function addImageToDB($filename,$extended=null){
		//TODO: get the album for the image, or attempt to
		//TODO: check for existing file, this will clobber that and we will end up with 2 db entries pointing toward the same file
		
   		//album is in extended
   		
   		$img = array();
		$img['Image'] = array();
		$img['Image']['location'] = $filename;
		$img['Image']['name'] = $filename;
		if(isset($extended['album_id'])){
			$img['Image']['album_id'] = $extended['album_id'];
		}
		if(isset($extended['user_id'])){
			$img['Image']['user_id'] = $extended['user_id'];
		}
		if(isset($extended['cid'])){
			$img['Image']['cid'] = $extended['cid'];
		}
		//should still work
		$thumb = $this->resize($filename,100,100);//Returns them thumb relative to the base images folder cache/imgs.jpg for example
		//these should be site variables. secondary
		//TODO make these in settings.
		$fullpath = ROOT.DS.APP_DIR.DS.WEBROOT_DIR.DS.'img'.DS.'pictures'.DS;
		//$this->log("oldpath: ".$oldfullpath);
		//$fullpath = $this->imgfolder;
		//$this->log("newpath: ".$fullpath);
	    $url = $fullpath.$filename;			
	    if (file_exists($url)) {
	    	$csize = getimagesize($url);
	    	//$cached = ($csize[0] == $width && $csize[1] == $height); // image is cached
	    	$img['Image']['width'] = $csize[0];
	    	$img['Image']['height'] = $csize[1];
	    }
	    //TODO: get defaults
	    /*
	    if($user == 0){//unset - check
		   	if($this->Session->check('User')){ //otherwise, ok - 
		   		$user = $this->Session->read('User');
		   		$img['Image']['user_id'] = $user['id'];
		   	}
	    }
	    	
	    if($album == 0){//unset
		   	if($this->Session->check('Site')){
		   		$site = $this->Session->read('Site');
		   		$img['Image']['album_id'] = $site['default_album'];
		   	}
	    }
		*/
	    	
	    //TODO read further information and setup a secondary table to store exif info, size on disk, coordinates
			
	    $img['Image']['thumb'] = $thumb;
		if(!$this->save($img)){
			return false;
		}else{
			//get last inst
			$id = $this->getLastInsertId();
			return $id;
		}
		return false;//should not be able to get here.
	}
    

	function beforeDelete(){	
		$fullpath = ROOT.DS.APP_DIR.DS.WEBROOT_DIR.DS.'img'.DS.'pictures'.DS;
		$img = $this->read(null,$this->id);
		$filepath = $fullpath.$img['Image']['location'];
		$thumbpath = $fullpath.$img['Image']['thumb'];
		$error = true;
		if(is_file($filepath)){
			if(unlink($filepath)){
				$this->log("Image file deleted: ".$filepath);
			}else{
				$this->log("Image file delete UNSUCCESSFUL: ".$filepath);
				$error = false;
			}
		}else{
			$this->log("Image file not a valid file, at least not for me:".$filepath);
			$error = true;//allow delete on the database because the file is not valid to us anyway
		}
		if(is_file($thumbpath)){
			if(unlink($thumbpath)){
				$this->log("Image file deleted: ".$thumbpath);
			}else{
				$this->log("Image file delete UNSUCCESSFUL: ".$thumbpath);
			}
		}else{
			$this->log("Image file not a valid file, at least not for me:".$thumbpath);
		}
		//delete the entry anyway?
		return $error;
	}
	
	/*
	 * savePic
	 * This takes a base64 picture and converts it to a file and saves it in the database
	 * this is used by the email to album component.
	 */
	function savePic($pic, $filename, $extended = null){
    	//$pic is base64, $filename is the image name, and $extended should handle album, user, etc.
    	//convert $pic,
		$fullpath = ROOT.DS.APP_DIR.DS.WEBROOT_DIR.DS.'img'.DS.'pictures'.DS;
   		$image_save_path = $fullpath.$filename;
		
   		if(file_exists($image_save_path)){
   			$this->log("File exists writing different file..");
			//the file already exists.... fix the save path by adding a (int) to the end of the filename
			$add=0;
			while(file_exists($image_save_path)){
				//Iterate through numbers until we find a filename that is unique
				$add++;
				$fileparts = explode(".",$filename);
				if(sizeOf($fileparts) > 2 ){
					$numparts = sizeOf($fileparts);
					$basename = $fileparts[0];
					for($i=1;$i<($numparts-1);$i++){
						$basename .= ".".$numparts[$i];
					}
					$extention = $fileparts[$numparts-1];
					$fileparts = array($basename,$extention);
				}
				
				if(sizeOf($fileparts)<2){
					//tack it on to the beginning...
					$newfilename = $add."-".$newfilename;
					
					$image_save_path = $fullpath.$newfilename;
					$this->log("Image save path modified (Possible bad filename wrong number of '.'s) : ".$image_save_path);
					
				}else{
					
					$fileparts[0] .= "(".$add.")"; 
					$newfilename = $fileparts[0].".".$fileparts[1];
					//update filename to reflect during save in db
					$image_save_path = $fullpath.$newfilename;
					$this->log("Image save path updated to: ".$image_save_path);
				}
			}
			$filename = $newfilename;//if iterates more than once, filename will be changed more than once
		}

		if (!$handle = fopen($image_save_path, 'w')) {
			$this->log("Cannot open file ($image_save_path)");
	         return false;
	    }
	    if ((fwrite($handle, $pic)) === FALSE) {	        
	    	$this->log("Cannot write to file ($image_save_path)");
	        exit;
	    }		
	    fclose($handle);		
	
		
		//TODO: save the image from an email to the correct user and album
		if(($id = $this->addImageToDB($filename,$extended))===false){//should handle saving to db..
			return false;
		}
		return $id;
    }

    /**
	   * Automatically resizes an image and returns the path to the cached thumbnail
	   * THIS IS THE SAME FUCKING FUNCTION AS IMAGECONTROLLER!!!!!!!!!!
	   * @param string $path Path to the image file, relative to the webroot/img/ directory.
	   * @param integer $width Image of returned image
	   * @param integer $height Height of returned image
	   * @param boolean $aspect Maintain aspect ratio (default: true)
	   */
	function resize($path, $width, $height, $aspect = true) {
	    
		$types = array(1 => "gif", "jpeg", "png", "swf", "psd", "wbmp"); // used to determine image type
	    	    
	    $fullpath = ROOT.DS.APP_DIR.DS.WEBROOT_DIR.DS.'img'.DS.'pictures'.DS;
	    //echo "FULLPATH:".$fullpath;
	    
	    $url = $fullpath.$path;
	    //echo "URL:".$url;
	    if (!($size = getimagesize($url))) 
	      return; // image doesn't exist 
	    
	    if ($aspect) { // adjust to aspect.
	    	if (($size[1]/$height) > ($size[0]/$width))  // $size[0]:width, [1]:height, [2]:type
	    		$width = ceil(($size[0]/$size[1]) * $height);
	    	else
	      		$height = ceil($width / ($size[0]/$size[1]));
	    }
	
	    //$relfile = $this->webroot.'img'.'/pictures/'.$this->cacheDir.$width.'x'.$height.'_'.basename($path); // relative file
	    $relfile = $this->cacheDir.$width.'x'.$height.'_'.basename($path); // relative file
	    $cachefile = $fullpath.$this->cacheDir.DS.$width.'x'.$height.'_'.basename($path);  // location on server
		
	    if (file_exists($cachefile)) {
	    	$csize = getimagesize($cachefile);
	    	$cached = ($csize[0] == $width && $csize[1] == $height); // image is cached
	      	if (@filemtime($cachefile) < @filemtime($url)) // check if up to date
	      		$cached = false;
	    } else {
	    	$cached = false;
	    }
	
	    if (!$cached) {
	      $resize = ($size[0] > $width || $size[1] > $height) || ($size[0] < $width || $size[1] < $height);
	    } else {
	      $resize = false;
	    }
	
	    if ($resize) {
	      $image = call_user_func('imagecreatefrom'.$types[$size[2]], $url);
	      if (function_exists("imagecreatetruecolor") && ($temp = imagecreatetruecolor ($width, $height))) {
	        imagecopyresampled ($temp, $image, 0, 0, 0, 0, $width, $height, $size[0], $size[1]);
	      } else {
	        $temp = imagecreate ($width, $height);
	        imagecopyresized ($temp, $image, 0, 0, 0, 0, $width, $height, $size[0], $size[1]);
	      }
	      call_user_func("image".$types[$size[2]], $temp, $cachefile);
	      imagedestroy ($image);
	      imagedestroy ($temp);
	    } else {
	      copy($url, $cachefile);
	    }
	    return $relfile;
	} 
	
	function aspectResize($w, $h, $max = 400){
		if($w>=$h){
			$newh = ceil(($max)/($w/$h));
			$neww = $max;
		}else{
			$ratio = $h/$w;
			$neww = $max/$ratio;
			$newh = $max;
		}
		return array($neww,$newh);
	}
	
    
	
}

?>