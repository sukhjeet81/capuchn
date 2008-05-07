<?php
/*
 * Pages controller will handle viewing all the pages and all that frigging shit
 * whatever.
 * fuck you
 * 
 */

class MagsController extends AppController
{
	var $name = 'Mags';
	var $helpers = array('Html','Javascript','Tree');
	var $components = array('ContentList');
	var $uses = array('Mag','Volume','Admin');
	function beforeFilter()
    {
    	//this will enable some features, but will not redirect. specifically, this will set admin_enable (t or f)
        $this->checkSessionAll();
    	$this->set('content_list', $this->Volume->findAllThreaded());
    	$this->set('magid', 0);//reset this if we have a priciple mag
    	$this->set('admin_enable', false);
    }
	
	//TODO: define how this should look, maybe just a redirect.
	function index(){
		$this->set('mag_def', $this->Mag->findAll());
	}
	
	/*
	 * view 
	 * the view from the outside, just displays the mag in the normal way...
	 */
	function view($id){
		$this->checkSessionAll();
		if($id == NULL){
			$this->redirect('/');
		}else{
			$this->Mag->id = $id;
			$thismag = $this->Mag->read();
			$this->set('volid', $thismag['Volume']['id']);
			$this->set('mag', $thismag);
			$this->set('magid',$id);
		}
	}
		
	function ajax($id){
		//currently i am just returning the strait text
		$this->layout= 'ajax';
		$this->Mag->id = $id;
		$magdata = $this->Mag->read();
		$this->set('simpleout', $magdata['Mag']['content']);
	}
		
	function delete($id,$confirm){
		$this->checkSessionAjax();
		$output = array();
		$output['statmessage'] = "delete failed somehow";
		$output['status'] = false;
		if($confirm == "conf"){
			if($this->Mag->del($id)){
				$output['statmessage'] = "Mag deleted successfully - $id";
				$output['status'] = true;
			}else{
				$output['statmessage'] = "Mag delete failed - $id";
			}
		}else{
			$output['statmessage'] = "Mag delete failed - $id";
		}		
		$this->set("output", $output);
		$this->render("json","ajax");
	}
	
	function ajaxread($id = NULL,$type = NULL){
		$this->checkSession();
		if($id == null || $id == 0){//new mag, 
			//$this->redirect('/admin');
			if(!empty($this->data)){
				 if ($this->Mag->save($this->data))
		         {
		            $id = $this->Mag->getLastInsertId();
		            $this->set('savetext', "article $id saved as new");
		         }
		         else
		         {
		            //TODO: setup variables correctly, 
		         	$this->validateErrors($this->Mag);		           
		            $this->set('section_list', $this->Volume->findAllThreaded());
					$this->set('magid', $id);
		         	$this->set('savetext', "article $id not saved, check errors"); 
		            $this->render('ajaxedit','ajax');
		            exit();
		         }
			}else{
				//No incoming data, setup fresh form
				//make defaults
				//potentially use type in the future...
				$newmag = array();
				$newmag['Mag'] = array();
				$newmag['Mag']['header'] = "New article";
				$newmag['Mag']['type'] = "html";
				$newmag['Mag']['editor'] = "html";
				$newmag['Mag']['volume_id'] = "1";//TODO: use configration
				$this->data = $newmag;
				
				$this->layout= 'ajax';
				$this->set('section_list', $this->Volume->findAllThreaded());
				$this->set('magid', $id);
				$this->set('savetext', "article $id not saved, no data");
				$this->render('ajaxedit','ajax');
				exit();
			}
		}else{//edit
			$this->Mag->id = $id;
			if(!empty($this->data)){
				if($this->Mag->save($this->data)){
					$this->set('savetext', "article $id saved");
				}else{
					$this->validateErrors($this->Mag);
					$this->set('savetext', "article $id not saved");
				}
			}else{
				$this->set('savetext', "article $id not saved, now data posted, or whatever");
			}
		}
		
		$this->layout= 'ajax';
		$this->Mag->id = $id;
		$magdata = $this->Mag->read();
		$this->set('mag', $magdata);
		$this->set('section_list', $this->Volume->findAllThreaded());
		$this->data = $magdata;
		$this->set('magid', $id);
		$this->render('ajaxedit','ajax');
	}
	
	
	function magsadmin($volid=null,$id=null){
		$this->checkSession();
		$this->layout = 'admin';
		if($volid == null){
			$output = $this->Mag->findAll();
			$this->set('maglist',$output);
		}else{
			$this->Volume->id = $id;
			$output = $this->Volume->findAllThreaded();
			$this->set('maglist', $output);
		}
		//id is currently unused.
	}
	
	function edit($id = NULL){
		$this->checkSession();	 
		//$this->redirect('/admin');
		$saveErrors = 0;
		if(!empty($this->data)){
			$status = array('status'=>false,'message'=>'Failed, unknown');
			 if ($this->Mag->save($this->data))
	         {
	            if($id == NULL)$id = $this->Mag->getLastInsertId();
	            $magdata = $this->Mag->read();
				//if($magdata['Mag']['editor'] != 'php'){
				//	$this->editorRedirect($magdata,$id);
	        	//}
	        	//otherwise this will just rerender the editor - 
	        	$this->set('savetext',"Aparticle saved! - ".$id);
				$status['status'] = true;
				$status['message'] = "Mag saved! - ".$id;
	         }
	         else
	         {
	            $saveErrors = $this->validateErrors($this->Mag);
				$status['message'] = "Failed: ".var_export($saveErrors,true);
					
	         }
			 $this->set('output',$status);
			 $this->render('json','ajax');
			 exit(0);
		}
		//not redrawing the form any longer, so only return this when a new form is needed
		$this->set('section_list', $this->Volume->findAllThreaded());
		if($saveErrors == 0){
			if($id==0){
				$this->data['Mag']['editor'] = 'html';
				$this->data['Mag']['type'] = 'html';
				$this->data['Mag']['header'] = 'New Mag';
				$this->data['Mag']['parent_id'] = $this->Admin->siteVar('defaultvolume');
				$this->set('mag_content', "");
				$this->set('mag_id',$id);
			}else{
				$this->Mag->id = $id;
				$this->set('mag_id', $id);
				$this->data = $this->Mag->read();
				$this->set('mag_content', $this->data['Mag']['content']);
			}
			//change editor to reflect any editor changes
			$editor = $this->data['Mag']['editor'];
		}else{
			$this->set('mag_content', $this->params['form']['data']['Mag']['content']);//var_export($this->params,true));
		}
		
		//editor sensitive code
		if($editor == "php"){
			$this->set('form', 'edit/'.$id);
			$jsfiles = array();
			$jsfiles[] = "editcodpress.js"; //because the way codepress searches for its path
			$jsfiles[] = "codepress/codepress.js";
			$this->set('jslinks', $jsfiles);
			$this->render('editcodepress','ajax');
		}else if($editor == "html"){
			$this->set('form', 'edit/'.$id);
			//$this->render('tinymce','ajax'); //<--old way
			$jsfiles = array();
			$jsfiles[] = "tiny_mce/tiny_mce.js";
			$jsfiles[] = "editmce.js";
			$this->set('jslinks', $jsfiles);
			$this->render('editmce','ajax');
		}else{
			$this->set('form', 'edit/'.$id);
			//default
			$jsfiles = array();
			$jsfiles[] = "tiny_mce/tiny_mce.js";
			$jsfiles[] = "editmce.js";
			$this->set('jslinks', $jsfiles);
			$this->render('editmce','ajax');
		}
	}
}

?>