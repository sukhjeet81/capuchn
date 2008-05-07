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
		if(isset($oldvar['value'])){
			$oldvar['value'] = $newvar;
			if($this->save($oldvar)){
				return true;
			}else{
				return false;
			}
		}else{
			$oldvar['name']=$var;
			$oldvar['value']=$newvar;
			$oldvar['description']=$desc;
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