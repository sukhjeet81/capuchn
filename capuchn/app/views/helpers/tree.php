<?php 
/*
 * TODO: cleanup this class and remove unused functions
 */

class TreeHelper extends Helper
{
  var $tab = "  ";
  var $helpers = array('Html');
  
  /*
   * This Helper was ripped from :
   * http://bakery.cakephp.org/articles/view/threaded-lists
   * 
   * Modified to handle a subtree search on the NAME variable, the for the field name
   * I have also heavily modified to handle my specific case.
   */
  
  /*
   * Show was created to display a tree list/map of the site.
   */
  
  function show($name, $data, $search = NULL)
  {
    list($modelName, $fieldName) = explode('/', $name);
    if($search == NULL){
    	$found = true;
    }else{
    	$found = false;
    }
    $output = $this->list_element($data, $modelName, $fieldName, $search, $found, 0);
    
    return $this->output($output);
  }
  //used by show - should not be called directly
  function list_element($data, $modelName, $fieldName, $search, $found, $level)
  {
  	//changed to find the correct search before adding to output
  	$output = ""; //make sure that we return something...
  	$tabs = "\n" . str_repeat($this->tab, $level * 2);
    $li_tabs = $tabs . $this->tab;
    if($found)$output = $tabs. "<ul>";
    foreach ($data as $key=>$val)
    {
      if($search == $val[$modelName][$fieldName]){
      	$found = true;
      	//if we just found it on this iteration, then we need to output the $UL
      	$output = $tabs. "<ul>";
      }
      if($found)$output .= $li_tabs . "<li>".$val[$modelName][$fieldName];
      if(isset($val['children'][0]))
      {
      	//if the search is not found then no output will be returned, if so then only good ouput will be
      	$output .= $this->list_element($val['children'], $modelName, $fieldName,$search,$found, $level+1);
      	//added special for my case, this displays mags
        if($found)$output .=  $this->list_mags($val,$level+1);
      	//dont add a closing li, if the we killed it
      	if($found)$output .= $li_tabs . "</li>";
      }
      else
      {
      	//if //there are no childs
      	if($found)$output .=  $this->list_mags($val,$level+1);
        if($found)$output .= "</li>";
      }
      if($search != NULL && $found == true){
      	break;
      }
    }
    if($found)$output .= $tabs . "</ul>";
    
    return $output;
  }
   
  /*
   * navlist will always ouput the entire list, and add the nav id to the top ul
   * This is intended for a main navigation menu, that will be heavily formatted with css
   * navList_ is a recursive function that is not intended to be called directly
   */
  function navList($data, $modelName, $fieldName, $level=0){
  	$output = "<ul id=\"nav\">";
  	$output .= $this->navList_($data,$modelName,$fieldName,$level);
  	$output .= "</ul>";
  	return $output;
  }  
  //used by navList, this is the recursive function
  function navList_($data, $modelName, $fieldName, $level = 0)
  {
  	//changed to find the correct search before adding to output
  	$output = ""; //make sure that we return something...
  	$tabs = "\n" . str_repeat($this->tab, $level * 2);
    $li_tabs = $tabs . $this->tab;
    foreach ($data as $key=>$val)
    {
      $output .= $li_tabs . "<li><a href=\"".BASE."volumes/view/".$val[$modelName]['id']."\">".$val[$modelName][$fieldName]."</a>";
      if(isset($val['children'][0]))
      {
      	$output .= $li_tabs . "<ul>";
      	$output .= $this->navList_($val['children'], $modelName, $fieldName, $level+1);
      	$output .= $this->list_mags_nav($val,$level+1);
      	$output .= $li_tabs . "</ul>";
      	$output .= $li_tabs . "</li>";
      	
      }
      else
      {
      	//if //there are no childs
      	$output .= "<ul>";
      	$output .=  $this->list_mags_nav($val,$level+1);
      	$output .= "</ul>";
        $output .= "</li>";
      }
    }
    return $output;
  }
  
  //used by navlist_ and list_element - this displays mags and cannot have children
  function list_mags($data, $level){
  	$tabs = "\n" . str_repeat($this->tab, $level * 2);
    $li_tabs = $tabs . $this->tab;
    $output = "";
    if(isset($data['Mag'][0])){
	    //$output = $tabs. "<ul>"; //this is a sublist of the caller, without possibly having childs
	    foreach ($data['Mag'] as $key=>$val){
	    	$output .= $li_tabs . "<li class=\"navmag\"><a href=\"#\">".$val['header']."</a></li>";
	    }
	    //$output .= $tabs."</ul>";
    }
    return $output;
  	
  }
  
  function list_mags_nav($data, $level){
  	$tabs = "\n" . str_repeat($this->tab, $level * 2);
    $li_tabs = $tabs . $this->tab;
    $output = "";
    if(isset($data['Mag'][0])){
	    foreach ($data['Mag'] as $key=>$val){
	    	$output .= $li_tabs . "<li class=\"navmag\"><a href=\"".BASE."mags/view/".$val['id']."\">".$val['header']."</a></li>";	    	
	    }
    }
    return $output;
  	
  }
  
  
/*
   * $data is the unformated array with all the data
   * $ol is an array that will be modified to contain all the options data
   * 	this will contain a list of each section formatted in the array 
   * 	[id] = Name
   * 	and each name may be preceeded by '-' depending on if it is a subvolume and how deep that goes
   */
  function sectionToList($data,&$ol,$level = 0){
  	//$data[0]['Volume']['name'];
  	//$data[0]['children'][0]['Volume']['name']
  	$leader = str_repeat("-",$level);
  	foreach($data as $vol){
  		$ol[$vol['Volume']['id']] = $leader.$vol['Volume']['name'];
  		if(isset($vol['children'][0])){
  			$this->sectionToList($vol['children'],$ol,$level+1);
  			//$ol now contains the sections
  		}
  	} 	
  }
    
  function displayTree($toplev){
  		$output = "";
		$output .= "<ul>";//open list
		foreach($toplev as $branch){
			//each branch will have a Volume,Mag, and children
			$output .=  "<li class=\"treeVol\"><a href=\"".BASE."admin/volumes/edit/".$branch['Volume']['id']."\">".$branch['Volume']['name']."</a>";
			if(count($branch['Mag'])>0){
				$output .= "<ul>";
				foreach($branch['Mag'] as $mag){
					$output .= "<li class=\"treeMag\"><a href=\"".BASE."mags/edit/".$mag['id']."\">".$mag['header']."</a></li>";
				}
				$output .= "</ul>";
			}
			if(count($branch['children'])>0){
				$output.= $this->displayTree($branch['children']);
			}
			$output .= "</li>";
		}
		$output .= "</ul>";//open list
		return $output;
	}//end displayTree 
}

?>