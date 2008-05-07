<?php
class VolumesController extends AppController
{

	var $layout = 'default';
	var $helpers = array('Tree','Html');
	var $components = array('ContentList');
	var $uses = array('Mag','Volume','Admin');
	
	/*
	 * template,style,publish
	 * 
	 * Style: The way that this section should be represented.
	 * 
	 * Singlet - There will only be a single aparticle displayed in viewing this
	 * 		Menu will only display the section/volume with no possibility of children
	 * 		View will display the highest id'd mag/aparticle
	 * 			if no mags, then check for child sections, then.... i dunno.
	 * Blog - display the aparticle list looking for [[more]] to cut off.
	 * 		Vars: num per page, 
	 * 		Menu - display tree
	 * 		view - list #of articles per page, show links to sub sections
	 * Paginate - display a single page for each aparticle/mag in that section.
	 * 		Vars - wizard? (single direction, modified menu)
	 * 		Menu - normal tree
	 * 		view - show a single full mag with forward/back buttons
	 * 		
	 * 
	 * Template: use the specific layout, or layout variant. layout variants will come later,
	 * 
	 * Publish: show the section/volume in the menu etc.
	 * 	
	 * 
	 */
		    
    function view($id=NULL, $page=1){
    	//TODO: fix volumes controller view.
    	if($id == NULL){
    	    $main_vol = $this->Admin->findByName('main_vol');
    		//get the main vol and set the recursive to 1
    		if(isset($main_vol['Admin']['value'])){
    			$id = $main_vol['Admin']['value'];
    		}else{
    			$id = 1;
    		}
    	}
    		
   		$this->Volume->id = $id;
   		$volume = $this->Volume->Read();
   		
   		if ($volume['Volume']['style'] == 'blog'){    			
   			$volume['Mag'] = $this->Mag->findAll("`volume_id`=$id",null,"Mag.id DESC", $volume['Volume']['limit'],$page);
   		}else if ($volume['Volume']['style'] == 'singlet'){
   			//$output = $this->Mag->find("`volume_id`=$id",null,'id DEC');
   			//One would assume that nobody would put more than one page in this section....
			$volume['Mag'] = $this->Mag->findAll("`volume_id`=$id",null,'Mag.id DESC',1);
   		}else if ($volume['Volume']['style'] == 'paginate'){
   			$volume['Mag'] = $this->Mag->findAll("`volume_id`=$id",null,"Mag.id DESC", $volume['Volume']['limit'],$page);
   		}//else leave whatever read() pulls up.   		
   		$this->set('volume_out', $volume);
   		$this->set('volid',$id);
    }
        
    function navmenu(){
    	/*
    	 *This is used exclusivly by the navmenu element, we could insert menu options here if needed 
    	 */
    	$menu = $this->Volume->findAllThreaded("Volume.publish=1");
    	if(isset($this->params['requested'])) {
             return $menu;
        }
    }
    
    function jsnavmenu(){
    	$listing = $this->Volume->findAllThreaded();
    	$this->layout = "ajax";
    	$this->set("listing",$listing);
    }
        
    function contentlist(){
    	/*
    	 *This is to be used by the admincontent element, it differs from navmenu as navmenu will get the
    	 * addition of a filter when searching that will limit to published sections- this will display all 
    	 */
    	$menu = $this->Volume->findAllThreaded();
    	//$menu = "checkit";
    	if(isset($this->params['requested'])) {
             return $menu;
        }
    }
    //TODO: um.... this was a waste of time. for some reason I recreated it.

    /*
     * This is going to be ajax only as admin controller handles the iface
     */
    function edit($id = null){
    	$this->checkSession();
		//TODO add user check to volumes->edit
    	if(!empty($this->data)){
    		$stat = array('status'=>false,'message'=>"unknown error");
			if($this->data['Volume']['parent_id'] == ""){
				$this->data['Volume']['parent_id'] = 0;
			}
			if ($this->Volume->save($this->data)){
				 if(($id == NULL)||($id < 0))$id = $this->Volume->getLastInsertId();
				 $this->set('savetext',"Volume $id saved");
				 $this->Volume->id = $id;
    			 //$vol = $this->Volume->read();
    			 //$this->data = $vol;
				 $stat['status']=true;
				 $stat['message']="New volume saved successfully - " . $id;
				 $this->set('output',$stat);
				 $this->render('json','ajax');
    			 exit();
			}else{
				 
				 $saveErrors = $this->validateErrors($this->Volume);
				 $this->log("Volume did not save correctly: ",$saveErrors);				 
				 $stat['status'] = false;
				 $stat['message'] = "The volume save failed";
				 $stat['errors'] = $saveErrors;
				 $this->set('output',$stat);
				 $this->render('json','ajax');
    			 exit();
			}
    	}else{
    		//Setup defaults, save and then display the form.
    		if(($id == NULL)||($id <= 0)){
				$id = 0;
				$voldefault = array();
				$voldefault['Volume'] = array();
				$voldefault['Volume']['name'] = "New Volume";
				$voldefault['Volume']['parent_id'] = "0";
				$voldefault['Volume']['template'] = "0";
				$voldefault['Volume']['style'] = "singlet";
				$voldefault['Volume']['publish'] = "1";
				$voldefault['Volume']['limit'] = "0";
				$this->data = $voldefault;
				$this->set('vol',null);
    		}else{
    			$this->Volume->id = $id;
    			$vol = $this->Volume->read();
    			$this->set('vol',$vol);
    			$this->data = $this->Volume->read(); //setup for form populate
    		}
    		$this->set('section_list', $this->Volume->findAllThreaded());
    		$this->set('vol_id', $id);
    		$this->set('form', BASE.'volumes/edit/'.$id);
    		$this->render('edit','ajax');
    		exit();
    	}
    }//end edit
}

?>