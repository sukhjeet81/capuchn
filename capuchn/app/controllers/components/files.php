<?php
class FilesComponent extends Object
{
    var $controller = true;
 
    function startup(&$controller)
    {
    	
    }
	
    function php4_scandir($dir,$listDirectories=false, $skipDots=true) {
	    $dirArray = array();
	    if ($handle = opendir($dir)) {
	        while (false !== ($file = readdir($handle))) {
	            if (($file != "." && $file != "..") || $skipDots == true) {
	                if($listDirectories == false) { 
	                	if(is_dir($file)) { 
	                		continue; 
	                	} 
	                }
	                /* This code is if i want to do recursive 
	                else{
	                	if(is_dir($file)){
	                		$dirarr = php4_scandir($dir.DS.$file);
	                	}
	                }
					*/
	                array_push($dirArray,basename($file));
	            }
	        }
	        closedir($handle);
	    }
	    return $dirArray;
	}
}



?>