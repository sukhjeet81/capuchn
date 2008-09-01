<?php
class WidgetController extends AppController
{
	var $name = 'Widget';
    var $layout = 'ajax';
	var $uses = array("Widget","User");
	
	
	//This is a potentially dangerous function, since this would technically allow
	//code here to execute as a admin space var. 
	function callback($id,$format = "callback"){
		//check for params? or let the callback code handle it.
		if($id>0){
			$this->Widget->id = $id;
			$widg = $this->Widget->read();
			$buffer = "";
			$output = "";
			if($widg['Widget']['callback']!=""){
				ob_start();
				$output .= eval($widg['Widget']['callback']);
				$buffer .= ob_get_contents();
				ob_end_clean();
			}
			$this->set('output',$buffer.$output);
			$this->render($format,'ajax');
		}else{
			$this->set('output',"id is incorrect");
			$this->render($format,'ajax');
		}
	}
	
	/*
	 * getAdmin returns the admin widget code.
	 */
	function getAdmin($id, $vars=null){
		$this->Widget->id = $id;
		$widg = $this->Widget->read();
		$output = array("name"=>$widg['Widget']['name'], "widgetcode"=>$widg['Widget']['admin_xhtml'], "id"=>$widg['Widget']['id'],"type"=>$widg['Widget']['type'] );
		
		if((isset($this->params['requested'])) || ($vars != null)){
			//Throw the display code
			//This->params['passed variables from calling function'] 
			//$this->params['test'] is the var name coming from requested
			if(isset($this->params['instanceid'])){
				$output['instanceid'] = $this->params['instanceid']; 
			}else if ($vars != null){
				$output['instanceid'] = $vars;
			}
			$this->set("output",$output);
			$this->render("admin","ajax");
		}else{
			$this->set("output",$output);
			$this->render("json","ajax");
		}
	}
	
	function showWidget($id){
		//intednend to do basically the same as above but work on a stand alone sort of way		
		$this->Widget->id = $id;
		$widg = $this->Widget->read();
		$output = array("name"=>$widg['Widget']['name'], "widgetcode"=>$widg['Widget']['admin_xhtml'], "id"=>$widg['Widget']['id'], "type"=>$widg['Widget']['type'] );
		$this->set('output',$output);
		$this->render('admin','ajax');
	}
	
	
	function iframe($id){
		//get the iframe with the widget in the address
		//$this->set("id",$id);
		$this->Widget->id = $id;
		$widg = $this->Widget->read();
		//$output = array("name"=>$widg['Widget']['name'], "widgetcode"=>$widg['Widget']['admin_xhtml'], "id"=>$widg['Widget']['id'], "type"=>$widg['Widget']['type'] );
		$this->set('output',$widg['Widget']['admin_xhtml']);
		$this->render('iframe','ajax');
	}
	
	function getajaxwidget($iid){
		$this->checkSession();

		if($this->Session->check('id')){	
			$uid = $this->Session->read('id');
			$this->User->id = $uid;
			$user = $this->User->read();		
			$profile = $user['User']['profile'];
		}else{
			//TODO set default profile?
			$profile = '{"default":"not logged in"}';			
		}				
		//convert profile to php
		vendor('JSON');
		$js = new Services_JSON();
		$prof = $js->decode($profile);
		$widget_config_obj = null;
		foreach($prof->layout as $colkey => $col){
			//im looking for the instance id here..
			foreach($col as $rowkey => $row){
				if($row->instanceid == $iid){
					$widget_config_obj = $row;
				}	
			}
		}
		if($widget_config_obj == null){
			$config = $js->decode($this->params['form']['widget']);
			if(!isset($config->id)){
				$this->log("Could not find the id requested");				
				$bad = true;
			}
		}

		if(!$bad){				
			$this->Widget->id = $widget_config_obj->id;
			$widg = $this->Widget->read();
			$output = array("name"=>$widg['Widget']['name'], "widgetcode"=>$widg['Widget']['admin_xhtml'], "id"=>$widg['Widget']['id']);
			$output['instanceid'] = $widget_config_obj->instanceid; 
		}else{
			$output = array("name"=>"Unknown","widgetcode"=>"Failed to find widget id, no widget fetched","id"=>"-1","instanceid"=>"-1");
		}		
		$this->set('user_profile',$profile);//for use by the ajax interface
		$this->set('php_profile',$prof);//for use in display
		$this->set("output",$output);				
		$this->render("admin","ajax");		
	}
	
	
	
	function getDisplay($name){
		//get the display code if possible.
		$out = "<h1>".$name."</h1>";
		$json = '{"name":"'.$name.'","widget_code":"'.addslashes($out).'"}';
		$this->set('output',$json);
		$this->render('wrapper','ajax');
	}
	
	function jslist(){
	
		$widgets = $this->Widget->findAll();
		$out = array();
		$out['label']="name";
		$out['identifier']="id";
		$items = array();
		foreach($widgets as $widg){
			$subarr = array();
			$subarr['id'] = $widg['Widget']['id'];
			$subarr['name'] = $widg['Widget']['name'];
			$items[] = $subarr;
		}
		$out['items'] = $items;
		$this->set('output',$out);
		$this->render('json','ajax');
	}
	
	function ifset($id,$set){
		$status = array('status'=>false, 'message'=>'save failed');
		if($id != null){
			$this->Widget->id = $id;
			$wgt = $this->Widget->read();
			
			if($set==="true"){
				$wgt['Widget']['type'] = "iframe";
			}else{
				$wgt['Widget']['type'] = "inline";
			}
			if($this->Widget->save($wgt)){
				$status['status'] = 'true';
				$status['message'] = 'saved iframe status '.$id;
			}
			
		}
		$this->set('output',$status);
		$this->render('json','ajax');	
	}
	
	function edit($id = NULL){
		$this->checkSession();	 
		//$this->redirect('/admin');
		$saveErrors = 0;
		if(!empty($this->params['form'])){
			 $status = array('status'=>false, 'message'=>'save failed');
			 $wgt['Widget'] = array();
			 if(isset($this->params['form']['id'])){
			 	$id = $this->params['form']['id'];
				$wgt['Widget']['id'] = $id;
			 }else{
			 	$id = "0";
			 }
			 
			 $wgt['Widget']['admin_xhtml'] = $this->params['form']['content'];
			 $wgt['Widget']['name'] = $this->params['form']['name'];
			 
			 if ($this->Widget->save($wgt))
	         {
	            if($id == NULL)$id = $this->Widget->getLastInsertId();
	            //$widgdata = $this->Widget->read();
	        	$this->set('savetext',"Widget Saved! - ".$id);
				$status['status'] = true;
				$status['message'] = "Widget saved! - " . $id;
				$status['id'] = $id;
				$this->set('output',$status);
				$this->render('json','ajax');		         	
	         }
	         else
	         {
	            $saveErrors = $this->validateErrors($this->Widget);
				$status['message'] = "Failed: ".var_export($saveErrors,true);
				$this->set('output',$status);
				$this->render('json','ajax');		         					
	         }
			 exit(0);
		}else{
			$response = array();
			$response['id'] = $id;
			$response['part'] = "";
			$response['content'] = "";
			$response['name']="";
				
			if(!($id==null || $id==0)){
				$this->Widget->id = $id;
				$thisWidget = $this->Widget->read();
				$response['content'] = $thisWidget['Widget']['admin_xhtml'];
				$response['name'] = $thisWidget['Widget']['name'];
			}
			$this->set('output',$response);
			$this->render('json','ajax');
		}
	}
	
	function widgetlist(){
		$this->set('defaultIcon', "img/driver_ghost.png");
		$this->set("widgets",$this->Widget->findAll());
	}
	
	function tablist(){
		$this->set("widgets",$this->Widget->findAll());
	}
}
?>
