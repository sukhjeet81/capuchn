<?php
class TemplateController extends AppController
{
	var $layout = "admin";
	var $helpers = array('Html','Javascript','Tree');
	var $components = array('ContentList','Files');
	var $uses = array('Volume','Mag','Admin'); 
    
	function beforeFilter()
    {
        $this->checkSession();
        $this->set('content_list', $this->Volume->findAllThreaded());
    }
		
	function csslist($template_id = NULL){
		/*
		 * Get a list of all the css files, template_id will come later and will only display files associated
		 * with a particular template
		 */
		$css_files = $this->Files->php4_scandir(WWW_ROOT.DS."css/");
		$this->set('fileslist', $css_files);
		$this->render('filelist');
	}
	
	function layoutlist($template_id = NULL){
		$layout_files = $this->Files->php4_scandir(APP_ROOT.DS."view".DS."layouts".DS);
		$this->set('fileslist',$layout_files);
		$this->render('filelist');
	}
	
	function viewlist($template_id = NULL){
		//$layout_files = $this->Files->php4_scandir(APP_ROOT.DS."view".DS."layouts".DS);
		$layout_files = array('This function is not yet finished'.__FILE__);
		$this->set('fileslist',$layout_files);
		$this->render('filelist');
	}
	
	function txtedit($filetype,$filename){
		if($filetype == "css"){
			//css file editor
			$basepath = WWW_ROOT.DS."css/";			
			
		}else if($filetype == 'layout'){
			$basepath = APP_ROOT.DS."view".DS."layouts".DS;
		}else if($filetype == 'view'){
			$basepath = APP_ROOT.DS."view".DS;
		}else{
			$this->set('filedata', 'This txtedit was called with the incorrect parameters'.__FILE__);
			$this->set('filepath', '/tmp/badfile');
			$this->set('form', "template/savefile/");
			$this->set('filetype', 'bad');		
			exit();
		}
		
		
		$filepath = $basepath.$filename;
		
		$fh = fopen($filepath, 'r');
		$filedata = fread($fh,filesize($filepath));
		fclose($fh);
		$this->set('filedata', $filedata);
		$this->set('filepath', $filepath);
		$this->set('form', "template/savefile/");
		$this->set('filetype', $filetype);		
	}
	
	function savefile(){
		//lets just post for now
		//$this->data['template']['content'] = the file data! < this is how this will come through
		//not really sure how to error check at this point, i suppose i could make sure its not empty..
		$output = "";
		$filepath = $this->data['template']['filepath'];
		if (is_writable($filepath)) {
		    if (!$handle = fopen($filepath, 'w')) {
		         $output .= "Cannot open file ($filepath)";
		         exit();
		    }
		
		    // Write $somecontent to our opened file.
		    if (fwrite($handle, $this->data['template']['content']) === FALSE) {
		        $output .= "Cannot write to file ($filepath)";
		        exit();
		    }
		
		    $output .= "Success, wrote to file ($filepath)";
		
		    fclose($handle);
		
		} else {
		    $output .=  "The file $filepath is not writable";
		}
		
		$this->set('saveout', $output);
		$this->set('debug', $this->data);
	}
	
}
?>