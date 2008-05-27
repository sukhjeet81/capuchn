<?php
/*
 * ThemeController
 * 
 * Handles editing and outputing themes. 
 * 
 * Todo list:
 * -Verification on save of themes. make sure that we can eval the layout.
 */
class ThemeController extends AppController
{
	var $layout = "ajax";
	var $uses = array('Admin', 'Theme'); 
	
	function save($id = 0){
		$this->checkSessionAjax();
		$status = array('status'=>false, 'message'=>'save failed');
		if(!empty($this->data)){
			 
			 if(isset($this->data['Theme']['id'])){
			 	$id = $this->data['Theme']['id'];
			 }
			 if ($this->Theme->save($this->data))
	         {
	            if($id == NULL)$id = $this->Theme->getLastInsertId();
	            
	        	$this->set('savetext',"Theme Saved! - ".$id);
				$status['status'] = true;
				$status['message'] = "Theme saved! - " . $id;
				$this->set('output',$status);
				$this->render('json','ajax');		         	
	         }
	         else
	         {
	            $saveErrors = $this->validateErrors($this->Theme);
				$status['message'] = "Failed: ".var_export($saveErrors,true);
				$this->set('output',$status);
				$this->render('json','ajax');		         					
	         }
			 exit(0);
		}
		$this->set('output',$status);
		$this->render('json','ajax');	
	}
	
	
	/*
	 * Get the data to fill the form for the edittab
	 */
	function edittab($id=null,$part=null){
		$this->checkSessionAjax();
		if($part == null){
			$part = 'layout';
		}
		if($id != null){
			$this->Theme->id = $id;
			$tmp = $this->Theme->read();
		}else{
			$def = $this->Theme->findByName('default');
			$tmp['Theme']['id'] = '0';
			$tmp['Theme']['name'] = "noname";
			$tmp['Theme']['style'] = $def['Theme']['style'];
			$tmp['Theme']['mce'] = $def['Theme']['mce'];
			$tmp['Theme']['layout'] = $def['Theme']['layout'];
			$tmp['Theme']['config'] = $def['Theme']['config'];			
		}
		$this->set('part',$part);
		$this->set('theme',$tmp);
		$this->render('edittab','ajax');		
	}
	
	function themelist(){
		$this->checkSessionAjax();
		$datas = $this->Theme->findAll();
		$this->set('datas',$datas);
		$this->render('list','ajax');
	}
	
	function clonetheme($id = null){
		$this->checkSessionAjax();
		if($id != null){
			$this->Theme->id = $id;
			$currtheme = $this->Theme->read();
			$newtheme = array("Theme"=>$currtheme['Theme']);
			unset($newtheme['Theme']['id']);
			$newtheme['Theme']['name'] = $newtheme['Theme']['name']." Clone";
			$this->Theme->id = null;			
			if ($this->Theme->save($newtheme))
	         {
	            $id = $this->Theme->getLastInsertId();	            
	        	$this->set('savetext',"Theme Saved! - ".$id);
				$status['status'] = true;
				$status['message'] = "Theme saved! - " . $id;
				$this->set('output',$status);
				$this->render('json','ajax');		         	
	         }
	         else
	         {
	            $saveErrors = $this->validateErrors($this->Theme);
				$status['message'] = "Failed: ".var_export($saveErrors,true);
				$this->set('output',$status);
				$this->render('json','ajax');		         					
	         }
			 exit(0);
		}
	}
	
	function delete($id = null){
		$this->checkSessionAjax();
		
		$status = false;
		if($id != null){
			if($this->Theme->del($id)){
				$status = true;				
				$message = "Theme $id deleted successfully";
			}else{
				$message = "Theme $id failed to deleted";
			}
		}else{
			$message = "No theme id";
		}
		$out = array("status"=>$status,"message"=>$message);
		$this->set('output', $out);
		$this->render("json","ajax");
	}
	
	/*
	 * Style will output the 'style.css' of the theme
	 */
	function style($name){		
		$style = $this->Theme->findByName($name);
		if(isset($style['Theme']['style'])){
			$this->set('output',$style['Theme']['style']);
		}else{
			$style = $this->Theme->findByName('default');
			$this->set('output',$style['Theme']['style']);
		}
		$this->render('css','ajax');
	}
	
	/*
	 * mce will output the mce.css of the theme, to be used by tiny mce
	 */
	function mce($name){
		$style = $this->Theme->findByName($name);
		if(isset($style['Theme']['mce'])){
			$this->set('output',$style['Theme']['mce']);
		}else{
			$style = $this->Theme->findByName('default');
			$this->set('output',$style['Theme']['mce']);
		}
		$this->render('css','ajax');
	}
	/*
	 * this is the layout, the code here will be evaled.
	 */
	function layout($name){
		if($this->params['requested']){
			$all = $this->Theme->findByName($name);
			$this->log("outputing theme: ".$name);
			return $all['Theme']['layout'];
		}
		exit(0);
	}
}
?>
