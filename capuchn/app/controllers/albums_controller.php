<?php 
class AlbumsController extends AppController
{
	var $name = 'Albums';
	//var $helpers = array('Html','Javascript','Tree', 'Ajax');
	var $helpers = array('Html','Tree');
	//var $components = array('ContentList','SwfUpload');
	var $uses = array('Admin','Album');
	var $layout = 'ajax';//To start, later the default may change to something else.
	//todo fix this for directory seperator
	//var $cacheDir = 'cache/'; // relative to 'img'.DS .'cachdir'
	//var $pictures = '/dev/sinvert/img/pictures/';
	//TODO: get this from the config, or however that will work out
	//var $fullURL =  "http://192.168.1.33/dev/sinvert/img/pictures/";
	
	/*
	 * index
	 * 
	 * Pulled up in a tab via the admin interface?
	 */
	function index($id = null){
		$this->checkSession();
		if($id == null){
			$datas = $this->Album->findAll();
			$this->set('viewtype', "multiview");
		}else{
			# string $conditions
			# array $fields
			# string $order
			# int $limit
			# int $page
			# int $recursive

			$this->Album->id = $id;
			$datas = $this->Album->read();
			$this->set('viewtype',"singleview");
		}
		vendor('JSON');
		$allist = $this->Album->findAll();
		$js = new Services_JSON();
		$this->set('alist',$js->encode($allist));
		$this->set('datas', $datas);
		$this->render('editview','ajax');		
	}
	
	/*
	 * delete
	 * One argument: id 
	 * This does not do any verification and returns our spicy json array with
	 * the status of the delete attempt.
	 */
	
	function delete($id = null){
		$this->checkSessionAjax();
		$status = false;
		if($id != null){
			if($this->Album->del($id)){
				$status = true;				
				$message = "Album $id deleted successfully - images not deleted - maybe";
			}else{
				$message = "Album $id failed to deleted";
			}
		}else{
			$message = "No album id";
		}
		$out = array("status"=>$status,"message"=>$message);
		$this->set('output', $out);
		$this->render("json","ajax");
	}
	/*
	 * Edit Box is used by the inline editor to change the values of the album:
	 * name or parent(currently)
	 */
	 
	function editbox($id=null){
		$this->checkSessionAjax();
		vendor('JSON');
		$js = new Services_JSON();
		$output = file_get_contents('php://input');
		$input = $js->decode($output);
		$status = array();
		$status['status']=false;
		if(isset($input->id)){
			if($input->field == 'name'){
				//$this->Album->id = $input->id;
				//$this->Album->name = $input->value;
				$alb['Album']['id']=$input->id;
				$alb['Album']['name']=$input->value;
				
				if($this->Album->save($alb)){
					$status['status'] = true;
					$status['message']='Album '.$input->value.' Saved!';
				}else{
					$status['message']= 'Album '.$input->value.' DID NOT Save properly ';
				}
			}else if($input->field == "parent"){
				$this->Album->id = $input->id;
				$this->Album->name = $input->value;
				if($this->Album->save()){
					$status['status'] = true;
					$status['message']='Album parent id: '.$input->value.' Saved!';
				}
			}else{
				$status['status']=false;
				$status['message']="No field, or incorrect field set";
			}
		}else{
			$status['message']="id not correctly set";
		}
		
		$this->set('output',$status);
		$this->render('json','ajax');
	}
	
	//jslist takes no arguments and returns a json list formated for dojofilereaditem
	function jslist(){
		//list all albums and put into a proper array
		$this->checkSessionAjax();
		$albums = $this->Album->findAll();
		$out = array();
		
		foreach($albums as $al){
			$al['Album']['extendname'] = $al['Album']['name']."(".sizeof($al['Image']).")";
			$out[] = $al['Album'];
		}
		
		$ident = Array();
		$ident['identifier'] = "name";
		$ident['items'] = $out;
		
		$this->set('output',$ident);
		$this->render('json','ajax');
	}
	
	function aslist(){
		$this->checkSessionAjax();
		$albums = $this->Album->findAll();
		if($this->params['requested']){
			return $albums;
		}
		$out = array();
		$out['list'] = array();
		$out['list']['items'] = array();
		
		foreach($albums as $al){
			$al['Album']['extendname'] = $al['Album']['name']."(".sizeof($al['Image']).")";
			$out['list']['items'][] = $al['Album'];
		}
		$out['list']['identifier'] = "id";
		$out['list']['label'] = "name";
		$out['status'] = true;
		$out['message'] = "Albums found...";
		$this->set('output',$out);
		$this->render('json','ajax');
	}
	
	function albumStore(){
		//$this->checkSessionAjax();
		$albums = $this->Album->findAll();
		$out = array();		
		$out['items'] = array();
		foreach($albums as $al){
			$al['Album']['extendname'] = $al['Album']['name']."(".sizeof($al['Image']).")";
			$out['items'][] = $al['Album'];
		}

		$out['identifier'] = "id";
		$out['label'] = "name";
		//$out['status'] = true;
		//$out['message'] = "Albums found...";
		$this->set('output',$out);
		$this->render('json','ajax');
	}
	
	//Add new album and return the status message pair, takes on argument.
	function add($newname){
			$this->checkSessionAjax();
			$status = array();
			if($newname){
				$out = $this->Album->save(array("Album"=>array("name"=>$newname)));
				if($out)
				{
					$status['status'] = true;
					$status['message'] = "Album created ". $this->data['Album']['name'];
				}else{
					$status['status'] = false;
					$status['message'] = "Album creation failed ";
				}
			}			
			$this->set('output',$status);
			$this->render('json','ajax');
	}
	
	function gallery($id = null){
		//create a gallery for simple display, first usage is at the bottom of an email
		$this->Album->id = $id;
		$album = $this->Album->read();
		$this->set('album',$album);
		$this->set('path',$this->Admin->siteVar('imagepath'));
		$this->set('baseurl',$this->Admin->siteVar('absoluteimgurl'));
		
		$this->render('gallery','ajax');
	}

}	
	
?>