<?php

class MagsController extends AppController
{
	var $name = 'Mags';
	var $helpers = array('Html','Javascript','Tree');
	var $components = array('ContentList');
	var $uses = array('Mag','Volume','Admin','Filter');
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
		if(isset($this->params['style'])){
			$style = $this->params['style'];
		}else{
			$style = "full";
		}
		//Todo need to handle this better
		if($id == NULL){
			$this->redirect('/');
		}else{
			$this->set('style',$style);
			$this->Mag->id = $id;
			$thismag = $this->Mag->read();
			if($thismag['Mag']['type'] == "html-code"){
				$thismag['Mag']['type'] = 'html';
			}
			$thismag['style'] = $style;
			$this->filter($thismag);
			$this->set('volid', $thismag['Volume']['id']);
			$this->set('mag', $thismag);
			$this->set('magid',$id);
			$this->set('themename',$thismag['Volume']['template']);
			$this->render('view','default');
		}
	}
	/*
	 * Filter is a basically a pre-scan of any mag that gets displayed.
	 * 
	 * expects $mag['style'] to be set
	 */
	function filter(&$mag){
		//get content to be filtered
		//get list of 'things' to search for
		//perform some operation,
			//types: exec, replace, disabled
			//exec just evals php code in place
			//replace just performs a simple operation			
		$filters = $this->Filter->findAll('Filter.active');
		$this->log($filters);
		//id/name/text/type/code/active
		foreach($filters as $filter){			
			$curr = split($filter['Filter']['text'], $mag['Mag']['content']);
			
			if(count($curr)>1){
				//$this is expected to directly modify the mag array however it has to.
				if($filter['Filter']['type']=="php"){
					ob_start();
					$out = eval($filter['Filter']['code']);
					$out .=	ob_get_contents();
					ob_end_clean();
					if($out != ""){
						$this->log('Filter output is not clean: '.$out);
						
					}
				}else if($filter['Filter']['type'] == "text"){
					//simple replace, for why i dont know.
					$mag['Mag']['content'] = ereg_replace($filter['Filter']['text'],$filter['Filter']['code'],$mag['Mag']['content']);
				}
			}
		}
	}
		
	function ajax($id){
		//currently i am just returning the strait text
		$this->layout= 'ajax';
		$this->Mag->id = $id;
		$magdata = $this->Mag->read();
		$this->filter($magdata);
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
	
	function dojoedit(){
		
		$this->log($this->params);
		if($id==0){
			$this->data['Mag']['editor'] = 'html';
			$this->data['Mag']['type'] = 'html';
			$this->data['Mag']['header'] = 'New Mag';
			$this->data['Mag']['volume_id'] = $this->Admin->siteVar('defaultvolume');
			$this->data['Mag']['id'] = 0;
			$this->data['Mag']['content'] = "Your data here!";
		}else{
			$this->Mag->id = $id;
			$this->data = $this->Mag->read();
		}
		
		$this->set('output', $this->data);		
		$this->render('json','ajax');		
	}
	
	function editor($id=null){
		$this->log("editor");
		$this->log($this->params);
		if((!empty($this->params['form'])) && (!isset($this->params['form']['get']))){
			//we have a winner
			
			$status = array('status'=>false,'message'=>'Failed, unknown');
			$this->datas['Mag']['content'] = $this->params['form']['content'];
			$this->datas['Mag']['header'] = $this->params['form']['name'];
			$this->datas['Mag']['volume_id'] = $this->params['form']['volumeid'];

			if(isset($this->params['form']['id'])){
				$id = $this->params['form']['id'];
				$this->datas['Mag']['id'] = $id;
			}
			$this->log($this->datas);
			if ($this->Mag->save($this->datas))
	        {
				if($id == NULL)$id = $this->Mag->getLastInsertId();
	        	$status['savedata'] = $this->Mag->read();	        	
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
		}else{
			//no data sent or get is set. 
			if($id == 0)$id = null;
			if($id != null){
				$this->Mag->id = $id;
				$this->set("mag",$this->Mag->read());			
			}else if(isset($this->params['form']['id'])){
				$this->Mag->id = $this->params['form']['id'];
				$this->set("mag",$this->Mag->read());							
			}else{
				$this->data['Mag']['editor'] = 'html';
				$this->data['Mag']['type'] = 'html';
				$this->data['Mag']['header'] = 'New Mag';
				$this->data['Mag']['volume_id'] = $this->Admin->siteVar('defaultvolume');
				$this->data['Mag']['id'] = 0;
				$this->data['Mag']['header'] = "name";
				$this->data['Mag']['content'] = "Your data here!";
				$this->set('mag',$this->data);
			}
		}
		$this->set("what","whatever");
		$this->render('editor','ajax');
	}
	
	function edit($id = NULL){
		$this->checkSession();	 
		//if saving, then we return a json string.
		
		if(!empty($this->data)){
			$status = array('status'=>false,'message'=>'Failed, unknown');
			 if ($this->Mag->save($this->data))
	         {
	            if($id == NULL)$id = $this->Mag->getLastInsertId();
	            $magdata = $this->Mag->read();
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

		
		if($id==0){
			$this->data['Mag']['editor'] = 'html';
			$this->data['Mag']['type'] = 'html';
			$this->data['Mag']['header'] = 'New Mag';
			$this->data['Mag']['volume_id'] = $this->Admin->siteVar('defaultvolume');
			$this->set('mag_content', "");
			$this->set('mag_id',$id);
		}else{
			$this->Mag->id = $id;
			$this->set('mag_id', $id);
			$this->data = $this->Mag->read();
			$this->set('mag_content', $this->data['Mag']['content']);
		}	
		
		$this->set('section_list', $this->Volume->findAllThreaded());			
		$this->set('form', 'edit/'.$id);
		$this->render('editmce','ajax');
	}
}

?>