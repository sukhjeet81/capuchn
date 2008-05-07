<?php
class JsonComponent extends Object {
	
	/* component configuration */
	var $name = 'JsonComponents';
	var $params = array();
	var $errorCode = null;
	var $errorMessage = null;
	
	function array2json($arr){
		
	    $parts = array();
	    $is_list = false;
	
	    //Find out if the given array is a numerical array
	    $keys = array_keys($arr);
	    $max_length = count($arr)-1;
	    if(($keys[0] == 0) and ($keys[$max_length] == $max_length)) {//See if the first key is 0 and last key is length - 1
	        $is_list = true;
	        for($i=0; $i<count($keys); $i++) { //See if each key correspondes to its position
	            if($i != $keys[$i]) { //A key fails at position check.
	                $is_list = false; //It is an associative array.
	                break;
	            }
	        }
	    }
	
	    foreach($arr as $key=>$value) {
	        if(is_array($value)) { //Custom handling for arrays
	            if($is_list) $parts[] = $this->array2json($value); /* :RECURSION: */
	            else $parts[] = '"' . $key . '":' . $this->array2json($value); /* :RECURSION: */
	        } else {
	            $str = '';
	            //if(!$is_list) $str = '"' . $key . '":';
	            if(!$is_list) $str =  $key . ':';//removed quotes
	
	            //Custom handling for multiple data types
	            if(is_numeric($value)) $str .= $value; //Numbers
	            elseif($value === false) $str .= 'false'; //The booleans
	            elseif($value === true) $str .= 'true';
	            else $str .= '"' . addslashes($value) . '"'; //All other things
	            // :TODO: Is there any more datatype we should be in the lookout for? (Object?)
	
	            $parts[] = $str;
	        }
	    }
	    $json = implode(',',$parts);
	    
	    if($is_list) return '[' . $json . ']';//Return numerical JSON
	    return '{' . $json . '}';//Return associative JSON
	}
	
	function generateJSData($arr,$ts = ""){
		$t = "\t";
		$toReturn = "";
		$outerFirst = true;
		foreach($arr as $vol){
			if(isset($vol['Volume'])){
				if(!$outerFirst){
					$toReturn .= ",\n ";
				}else{
					$outerFirst = false;
				}
				//this is vol
				$toReturn .= $ts." { name:'".$vol['Volume']['name']."', type:'volume', id:'v-".$vol['Volume']['id']."'";
				//need to add either a , or }
				if((count($vol['Mag'])>0) || (count($vol['children'])>0)){
					$toReturn .= $ts.$t.", children: [\n";
					$first = true;
					foreach($vol['Mag'] as $mag){
						if(!$first){
							$toReturn .= ",\n";
						}else{
							$first = false;
						}
						$toReturn .= $ts.$t.$t."{ name:'".$mag['header']."', type:'mag', id:'m-".$mag['id']."' }";
					}
					if(count($vol['children'])>0){
						if(!$first){
							$toReturn .= ",\n";
						}else{
							$first = false;
						}
						$toReturn .= $this->generateJSData($vol['children'],$ts.$t);
					}
					$toReturn .= $ts.$t."]";//terminate the children array
				}//end child check
				//Terminate this skittlepoper
				$toReturn .= $ts."}";
			}//end volume check
		}//end foreach
		return $toReturn;
	}
}
?>