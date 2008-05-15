<?php
class WidgetController extends AppController
{
	var $name = 'Widget';
    var $layout = 'ajax';
	
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
	function getAdmin($id){
		$this->Widget->id = $id;
		$widg = $this->Widget->read();
		$out = "<h1>".$widg['Widget']['name']."</h1>";
		
		$output = array("name"=>$widg['Widget']['name'], "widgetcode"=>$widg['Widget']['admin_xhtml'], "id"=>$widg['Widget']['id']);
		$this->set("output",$output);
		$this->render("json","ajax");
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
	
	function edit($id = NULL){
		$this->checkSession();	 
		//$this->redirect('/admin');
		$saveErrors = 0;
		if(!empty($this->data)){
			 $status = array('status'=>false, 'message'=>'save failed');
			 if(isset($this->data['Widget']['id'])){
			 	$id = $this->data['Widget']['id'];
			 }else{
			 	$id = "0";
			 }
			 if ($this->Widget->save($this->data))
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
		//Default widget - should start things off here too maybe.
			$data['Widget']['name'] = "";
			$data['Widget']['admin_xhtml'] = "";
			$data['Widget']['display_xhtml'] = "";
			$data['Widget']['callback'] = "";
			$data['Widget']['version'] = "0.0";
			$data['Widget']['id'] = "0";
			
			if($id==null || $id==0){
				$this->set('widget_content',"");
				$this->set('data',$data);
				
			}else{
				$this->Widget->id = $id;
				$thisWidget = $this->Widget->read();
				$this->set('data',$thisWidget);
			}
		}
	}
	
	function widgetlist(){
		$this->set('defaultIcon', "img/driver_ghost.png");
		$this->set("widgets",$this->Widget->findAll());
	}
}
?>
