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
	var $uses = array('Admin', 'Theme', 'Volume', 'Themefiles'); 
	
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
	
	//called by edit to edit themefile, since this is way different
	function editthemefile($type, $id, $themefileid){
		$this->checkSessionAjax();
		//if the  form is submitted, check for an id and override themefileid to prevent double save..
		if(!empty($this->params['form'])){
			//id will be theme_id
			$frm = $this->params['form'];
			
			if($themefileid > 0){
				$fid = $thm['Themefiles']['id'] = $themefileid;
			}else if($frm['id'] != '0'){
				$fid = $thm['Themefiles']['id'] = $frm['id'];
			}else{
				$fid = $thm['Themefiles']['id'] = 0;
			}
			$thm['Themefiles']['name'] = $frm['name'];
			$thm['Themefiles']['content'] = $frm['content'];
			$thm['Themefiles']['type'] = $frm['type'];
			$thm['Themefiles']['theme_id'] = $id;
			$thm['Themefiles']['path'] = $frm['path'];
			
			
			
			if($this->Themefiles->save($thm)){
				//$status['status'] = true;
				//$status['message'] = "Themefile saved - ".$thm['Themefiles']['name'];
				//$this->set('output',$status);
				//$this->render('json','ajax');	
				if($fid>0){
					$id = $fid;
				}else{
					$id = $this->Themefiles->getLastInsertID();
				}
				$outarr= array(
					"id"=>$id, 
					"name"=>$frm['name'], 
					"content"=>$frm['content'], 
					"part"=>"themefile", 
					"type"=>$frm['type'], 
					"path"=>$frm['path'],
					"status"=>"true",
					"message"=>"Themefile saved - ".$thm['Themefiles']['name']						
					);
				$this->set('output',$outarr);
				$this->render('json','ajax');
								
			}else{
				$saveErrors = $this->validateErrors($this->Themefiles);
				$status['message'] = "Failed: ".var_export($saveErrors,true);
				$status['status'] = false;
				$this->set('output',$status);
				$this->render('json','ajax');	
			}
			exit(0);
		}else{
			//get data to set if the themefile has an id.
			if($themefileid > 0){
				//edit existing
				$this->Themefiles->id = $themefileid;
				$filedata = $this->Themefiles->read();
				$this->set('output',
					array(
						"id"=>$filedata['Themefiles']['id'], 
						"name"=>$filedata['Themefiles']['name'], 
						"content"=>$filedata['Themefiles']['content'], 
						"part"=>"themefile",
						"type"=>$filedata['Themefiles']['type'],
						"path"=>$filedata['Themefiles']['path'],
						"theme_id"=>$filedata['Themefiles']['theme_id']
						)
					);
			}else{
				//content, name, id and part are expected
				$this->set('output',array("id"=>0, "name"=>"", "content"=>"new file", "part"=>"themefile","type"=>"css","path"=>"*"));
			}
			$this->render('json','ajax');
		}
	}
	
	function edit($type,$id=null,$themefileid=0){
		$this->checkSessionAjax();
	
		$this->log("theme edit:", $this->params);
		
		if($type == "themefile"){
			//if themefile, then we need to see if the id for the file is set
			$this->editthemefile($type,$id,$themefileid);
			exit(0);
		}
		
		//if form is not named, like via dojo xhr post with json form
		if(!empty($this->params['form'])){
			//saving, just return status info
			if($this->params['form']['id'] != 0){
				//we are editing a existing theme
				$thm['Theme']['id'] = $this->params['form']['id'];
				$thm['Theme']['name'] = $this->params['form']['name'];
				$thm['Theme'][$this->params['form']['part']] = $this->params['form']['content'];
				if($this->Theme->save($thm)){
					$status['status'] = true;
					$status['message'] = "Theme saved - ".$thm['Theme']['id'];
					$this->set('output',$status);
					$this->render('json','ajax');	
				}else{	
		            $saveErrors = $this->validateErrors($this->Theme);
					$status['message'] = "Failed: ".var_export($saveErrors,true);
					$status['status'] = false;
					$this->set('output',$status);
					$this->render('json','ajax');	
				}
			}else{
				$status['message'] = "Failed: id is not correct";
				$status['status'] = false;
				$this->set('output',$status);
				$this->render('json','ajax');	
			}
			
			exit(0);
			
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
		$out = Array();
		$out['id'] = $tmp['Theme']['id'];
		if(isset($tmp['Theme'][$type])){
			$out['part'] = $type;
			$out['content'] = $tmp['Theme'][$type];
		}else{
			$out['part'] = $type;
			$out['content'] = "Not yet set";
		}
		//this should be something else since... well whatever.
		$out['name'] = $tmp['Theme']['name'];
		
		$this->set('output',$out);
		$this->render('json','ajax');
	}
	
	function themelist(){
		$this->checkSessionAjax();
		$datas = $this->Theme->findAll(null,null,null,null,1,2);
		//$this->log($datas);
		$this->set('datas',$datas);
		$this->render('list','ajax');
	}
	
	function gettheme($id){
		$this->Theme->id = $id;
		$this->set('output',$this->Theme->read());
		$this->render('json','ajax');
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
	
	function css($name){
		$style = $this->Themefiles->findByName($name);
		if(isset($style['Themefiles']['content'])){
			$this->set('output',$style['Themefiles']['content']);
		}else{
			$style = $this->Theme->findByName('default');
			$this->set('output',$style['Theme']['style']);
		}
		$this->render('css','ajax');
	}
	
	function headers($id){
		//get the css files and js files from the themefiles and create the markup
		//	to go into the header.		
		$this->Theme->id = $id;
		$themefiles = $this->Theme->read();
		$this->set('theme', $themefiles);
		// $this->requestAction("theme/headers/".$id), used by volumes controller
	}
	
	/*
	 * used by CapuchnEditor this should combine css files if needed or
	 * modify to produce a style that works with the editor.
	 */
	function getEditorStyle($volume_id = null){
		if($volume_id == null){
			$volume_id = $this->Admin->siteVar('defaultvolume');
		}
		
		$this->Volume->id = $volume_id;
		$vol = $this->Volume->read();
		
		$this->log($vol);
		$thme = $this->Theme->findByName($vol['Volume']['template']);
		$this->set('output', $thme['Theme']['style']);
		$this->render('css','ajax');		
	}
	
	function help(){
		//nothing just render the default page
	}
}
?>
