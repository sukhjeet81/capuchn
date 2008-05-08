<?php

class Admin extends AppModel
{
    var $name = 'Admin';
	
	function siteVar($var){
		$sv = $this->findByName($var);
		
		if(isset($sv['Admin']['value'])){
			return $sv['Admin']['value'];
		}else{
			$this->saveSiteVar($var,'','auto-generated site variable');
			return null;
		}
	}
	
	function saveSiteVar($var, $newvar, $desc=null){
		$oldvar = $this->findByName($var);
		if(isset($oldvar['Admin']['value'])){
			$oldvar['Admin']['value'] = $newvar;
			if($this->save($oldvar)){
				$this->log("Saved admin variable: ".$var.":".$newvar);
				return true;
			}else{
				return false;
			}
		}else{
			$oldvar['Admin']['name']=$var;
			$oldvar['Admin']['value']=$newvar;
			$oldvar['Admin']['description']=$desc;
			if($this->save($oldvar)){
				$this->log("Saved new admin variable: ".$var.":".$newvar);
				return true;
			}else{
				$this->log("Save admin var FAILED: ".$var.":".$newvar);
				return false;
			}
		}
	}
	
}




?>