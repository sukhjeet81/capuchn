<?php
class VolumesController extends AppController
{

	var $layout = 'default';
	var $helpers = array('Tree','Html');
	var $components = array('ContentList');
	var $uses = array('Mag','Volume','Admin','Theme','Themefiles');
	
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
			$id = $this->Admin->siteVar('defaultvolume');
			if($id == null){
				$id=1;
			}
    	}
			
   		$this->Volume->id = $id;
   		$volume = $this->Volume->Read();
   		$pages = $this->Mag->findCount("`volume_id`=$id");
		
   		if ($volume['Volume']['style'] == 'blog'){    			
   			$volume['Mag'] = $this->Mag->findAll("`volume_id`=$id",null,"Mag.id DESC", $volume['Volume']['limit'],$page);	
   		}else if ($volume['Volume']['style'] == 'singlet'){
   			//$output = $this->Mag->find("`volume_id`=$id",null,'id DEC');
   			//One would assume that nobody would put more than one page in this section....
			$volume['Mag'] = $this->Mag->findAll("`volume_id`=$id",null,'Mag.id DESC',1);
   		}else if ($volume['Volume']['style'] == 'paginate'){
   			$volume['Mag'] = $this->Mag->findAll("`volume_id`=$id",null,"Mag.id DESC", 1,$page);
   		}//else leave whatever read() pulls up.   		
   		$this->set('volume_out', $volume);
   		$this->set('volid',$id);
		$this->set('nummags',$pages);
		$this->set('page',$page);
		$this->log($this->params);
		if(isset($this->params['url']['url'])){
			$currurl = $this->params['url']['url']; // "volumes/view/1"	
		}else if(isset($this->params['url'])){
			if(sizeof($this->params['url'] < 1)){
				$currurl = "";
			}
		}
		
		$mytheme = $this->Theme->findByName($volume['Volume']['template']);
		//find files that match this url... potentially check for an empty path and make sure it is is this volumes theme
		$tmpList = $this->Themefiles->findAll("'".$currurl."' REGEXP `Themefiles`.`path` AND `Themefiles`.`theme_id`=".$mytheme['Theme']['id']);
		
		$vhighmatch = -1;
		$volumetfile = "";
		
		foreach($tmpList as $file){
			if($file['Themefiles']['type'] == "Volume Layout"){
				$exp = explode("/", $file['Themefiles']['path']);
				$eUrl = explode("/", $currurl);
				//if 
				if(sizeof($exp) > $vhighmatch){
					$cHighmatch = 0; //the current matches based on path
					for($i=0; $i<sizeof($exp); $i++){
						if($exp[$i] == $eUrl[$i]){
							$cHighmatch = $i;
						}
					}
					if($cHighmatch > $vhighmatch){
						$vhighmatch = $cHighmatch;
						$volumetfile = $file;
					}
				}			
			}
		}
		$this->set("headers", $this->requestAction("theme/headers/".$mytheme['Theme']['id']));
		$this->set("volumetheme", $volumetfile);//the layout template for volume
		$this->set('theme', $tmpList);//other theme files. if needed.
		$this->set('themename',$volume['Volume']['template']);//themename to ease mags use maybe?
		$this->log('The theme for the current volume is::'.$volume['Volume']['template']);
    }
        
    function navmenu(){
    	/*
    	 *This is used exclusivly by the navmenu element, we could insert menu options here if needed 
    	 */
    	$menu = $this->Volume->findAllThreaded("Volume.publish=1");
		foreach($menu as $key => $sec){
			if($sec['Volume']['style']=="singlet"){
				unset($menu[$key]['Mag']);
			}
		}
    	if(isset($this->params['requested'])) {
             return $menu;
        }
    }
	
	function rss($id = null){
		if($id == null){
			//set to default
			$id = $this->Admin->siteVar('defaultvolume');
			if($id == null){
				$id = 1;
			}
		}
		
		$this->Volume->id  = $id;
		$vol = $this->Volume->read();
		$this->log($vol);
		$this->set('volume',$vol);
		$this->set('siteroot',$this->Admin->siteVar('siteroot'));
		$this->set('sitedescripton',$this->Admin->siteVar('sitedescription'));
		$this->render('rss','ajax');
	}
    
    function jsnavmenu(){
    	$listing = $this->Volume->findAllThreaded();
    	$this->layout = "ajax";
    	$this->set("listing",$listing);
    }
	
	function storeJson(){
		$volumes = $this->Volume->findAllThreaded();		
		$out = array();
		$this->makeStore($volumes,0,$out);
		$out['label'] = "id";
		$out['identifier'] = "displayname";
		$this->set("output",$out);
		$this->render('json','ajax');		
	}
	
	//Make an array that fits what the store wants, for the FilteringSelect
	function makeStore($arr,$level = 0,&$toReturn){
		$ls = "";
		for($i=0;$i<level;$i++){$ls .= "-";}
		foreach($arr as $vol){
			if(isset($vol['Volume'])){
				$na = array();
				$na['name'] = $vol['Volume']['name'];
				$na['displayname'] = $ls.$vol['Volume']['name'];
				$na['type'] = 'volume';
				$na['id'] = $vol['Volume']['id'];		
				$toReturn[] = $na;
				if(count($vol['children'])>0){
					makeStore($vol['children'],$level+1,$toReturn);
				}
			}//end volume check
		}//end foreach
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
				$voldefault['Volume']['template'] = $this->Admin->siteVar('defaulttheme');
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
			
			$this->set('themelist',$this->Theme->findAll());
    		$this->set('form', BASE.'volumes/edit/'.$id);
    		$this->render('edit','ajax');
    		exit();
    	}
    }//end edit
}

?>