<?php
/*
 * The name is somewhat decieving, since I structured the admin table to handle the 
 * Site variables, we'll see how that works.
 * 
 */

class AdminController extends AppController
{
	var $name = 'Admin';
	var $helpers = array('Html','Tree');
	var $components = array('ContentList','Files');
	var $uses = array('Volume','Mag','Admin'); 
    var $layout = 'admin';
    /*
     * Admin settings table
     * default_album = the defualt album to put pictures into
     * default_section = 
     * default_template = any new article that is created will default to this template/theme
     * Site Name = the name of the site
     * Site address = "http://mysite.com/whatever/"
     */
    
    
	function beforeFilter()
    {
        $this->checkSession();
        $this->set('content_list', $this->Volume->findAllThreaded());
		$user = $this->Session->read("User");
		if(isset($user['profile'])){
			$this->set('user_profile', $user['profile']);
		}else{
			$this->set('user_profile', "");
		}
        //no other setting as this should never use the default layout
    }
	
	/*
	 * Index
	 * 
	 * Sets up and displays the home page and dojo index, since dojo index handles way
	 * more now than the backend, then... welll..... this does not really do a whole
	 * lot.
	 */
	function index(){
		//a list of volumes and mags.
		$this->layout = "dojoindex";
		$this->set('admin_def', "NO OUTPUT");
		$this->set('tab1href', "href=\"user/home\"");
		$this->set('tablist',array());
	}
	
	/*
	 * Site renders the site editor form, but posts to update site
	 */		
	function site(){
		//just the facts maam
		$datas = $this->Admin->findAll();
		$this->set('data',$datas);
		$this->render('site','ajax');
	}
	
	function readfile($file = null){
		
		if($file == "default"){
			$output = file_get_contents(LAYOUTS."default.thtml");
			$filename = "default.thtml";
			$filetype = "php";
		}else if($file == "style"){
			$output = file_get_contents(CSS."style.css");
			$filename = "style.css";
			$filetype = "css";
		}else if($file == "mce"){
			$output = file_get_contents(CSS."mce.css");
			$filename = "mce.css";
			$filetype = "css";
		}else{
			$output = "Invalid file - DO NOT WANT";
			$filename = "Invalid";
			$filetype = "php";
		}
		$this->set('filetype',$filetype);
		$this->set('filecontents',$output);
		$this->set('filename',$filename);
		$this->render('readfile','ajax');
	}
	
	/*
	 * Update site variables, this data comes from the form created by site
	 * There is currently no way to add new variables, although that seems like
	 * it should be easy enough
	 */
	function updatesite(){
		$stat = array('status'=>false, 'message'=>"unknown error happened",'error'=>'');
		if(!empty($this->params['form'])){
			$frm = $this->params['form'];
			//should be in the form of $frm[name] = $var
			$stat['status'] = true; //default to true, update when a save fails
			$stat['message'] = 'Site variables saved';
			foreach($frm as $name => $sitevar){
				if(!$this->Admin->saveSiteVar($name, $sitevar)){
					$stat['error'] .= "Failed to save : ".$name. "=>" .$sitevar."<br/>\n";
					$stat['status'] = false;
					$stat['message'] = "Some errors occured - see error log";
				}
			}
		}else{
			$stat['message'] = 'No form data submitted (not in params[form])';
		}
		$this->set('output',$stat);
		$this->render('json','ajax');
	}
	
	/*
	 * savetofile is for editing files on the site, currently there should really only be
	 * 2 or 3 files that I might want to edit. default.thtml, style.css, and maybe mce.css
	 */
	
	function savetofile(){
		$stat = array('status'=>false, 'message'=>"Error occured. dont know", 'error'=>'');
		if(!empty($this->params['form'])){
			$frm = $this->params['form'];
			if(isset($frm['filename'])){
				switch($frm['filename']){
					case "default.thtml":
						$path = LAYOUTS . "default.thtml";
						break;
					case "style.css":
						$path = CSS . "style.css";
						break;
					case "mce.css": 
						$path = CSS . "mce.css";
						break;
					default:
						$stat['message'] = "Attempting to edit invalid file".$frm['filename'];
						$this->log("Attempting to edit invalid file".$frm['filename']);
						exit();
				}
				
				if(is_writable($path)){
					if($fconent = file_get_contents($path)){
						if(is_writeable($path.".backup")){
							if(file_put_contents($path.".backup", $fconent)){							
								$this->log('Successful backup of '.$path);
							}else{
								$this->log('failed to write backup file'.$path);
							}
						}
					}
					if($frm['savetext'] != ""){
						if(file_put_contents($path,$frm['savetext'])){
							$stat['message'] = "Successful write to file";
							$stat['status'] = true;
							$this->log("Wrote new file: ".$path);
						}else{
							$this->log("Failed to write to file: ".$path);
							$stat['message'] = "Failed to write to file: ".$path;
						}
					}else{
						$stat['message'] = "No text submitted";
					}	
				}else{
					$stat['message'] = "The file $path is not writeable, make sure that permissions are set properly";
				}				
			}else{
				$stat['message'] = "Wrong form submitted";
			}
		}else{
			$stat['message'] = "No form submitted";
		}
		//OK, either it saved or not, however the messages should be set
		$this->set('output',$stat);
		$this->render('json','ajax');
	}//end save to file
	
	function readfromfile(){
		
	}
}

?>