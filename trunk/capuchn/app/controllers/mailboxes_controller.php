<?php
class MailboxesController extends AppController
{
	var $name = 'Mailboxes';
	//var $helpers = array('Html','Tree');
	var $components = array('Pop3','Mime','Rfc822',"Json");
	//var $uses = array('Volume','Mag','Admin');
	var $uses = array('User','Mailbox','Message','Image','Admin','Mag'); 
    //var $layout = 'admin';
    
	function showBox(){
			
	}
	
	function addBox(){
		
	}
	/*
	 * messages
	 * This controller grabs all the messages for each mailbox from the current user
	 * this will handle stuff.
	 */
	function messages($action = null){
		$this->checkSession();
		//json is retarded and I cant get it to work, I would rather have more control over the display
		//anyway so...
		if($this->Session->check("User")){
			$user = $this->Session->read("User");
		}else{
			return;
		}
		$mbox = $this->Mailbox->findAllByUser_id($user['id']);
		$boxlist = "";
		if($mbox){
			foreach($mbox as $mb){
				if($boxlist == ""){
					$boxlist .= $mb['Mailbox']['id'];
				}else{
					$boxlist .= ", ".$mb['Mailbox']['id'];
				}
			}
		}
		if($boxlist != ""){
			$messages = $this->Message->findAll('`mailbox_id` IN ('.$boxlist.')',array('id','subject','from','date'),array('date' => 'DESC'));
		}else{
			$messages = array();
		}
		
		if($action == "reload"){
			//set the reload variable so that just the list is returned
			$this->set("reload",true);
		}
		
		$this->set('output',$messages);
		$this->render('messages','ajax');
	}
	
	/*
	 * edit
	 * Edit is for saving the mailbox parameters. This should work like albums and volumes
	 */
	
	function edit(){
		$this->checkSession();
		//if data is submitted, respond with something other than the form, unless it is bad,
		//maybe a json something to add the thing to the list
		if(!empty($this->data)){
			if($this->Session->check("User")){
				$user = $this->Session->read("User");
			}else{
				return;
			}
			$this->data['Mailbox']['user_id'] = $user['id'];
			if($this->Mailbox->save($this->data)){
				$output = "mailbox saved";
				$this->Session->flash('mailbox saved');
			}else{
				$this->Mailbox->validateErrors();
			}
		}

		if($this->Session->check("User")){
			$user = $this->Session->read("User");
		}else{
			return;
		}
		$mbox = $this->Mailbox->findAllByUser_id($user['id']);
		$this->set('datas',$mbox);
		$this->render('edit','ajax');		
	}
	
	
	/*
	 * delete
	 * delete sends a form to delete messages. 
	 */
	
	function delete(){
		$this->checkSession();
		if(!empty($this->params)){
			
			$datas = $this->params['form'];
			
			foreach($datas as $key => $element){
				$msg = explode("_",$key);
				if($msg[0]=="msg"){
					$out = $this->Message->del($msg[1]);					
				}
			}
			
			$this->redirect("mailboxes/messages/reload");
		
			//$this->set('output',var_export($this->params,true));
			//$this->render('output','ajax');				
		}else{
			$this->set('output',"");
			$this->render('output','ajax');
		}
	}
	
	function deletebox($id=null){
		$this->checkSession();
		$status['status'] = false;
		if($id != null){
			if($this->Mailbox->del($id)){
				$status['status'] = true;
				$status['message'] = "Mailbox $id deleted successfully";
			}else{
				$status['message'] = "Delete mailbox $id failed";
			}
		}else{
			$status['message'] = "no id passed to mailbox delete";
		}
		$this->set("output",$status);
		$this->render("json","ajax");
	}
	
	function archive(){
		$this->checkSession();
		if(!empty($this->params)){
			
			$datas = $this->params['form'];
			$out = "";
			foreach($datas as $key => $element){
				$msg = explode("_",$key);
				if($msg[0]=="msg"){
					//$out = $this->Message->del($msg[1]);
					$out .= $msg[0];										
				}
			}
			$this->redirect("mailboxes/messages/reload");
		}else{
			$this->set('output',"");
			$this->render('output','ajax');
		}
	}
	
	function refresh(){
		$this->checkSession();
		$usersess = $this->Session->read('User');
		$user_id = $usersess['id'];
		$user = $this->User->read(null,$user_id);
		if($user == null){
			exit();
		}
		$output = "";
		foreach($user['Mailbox'] as $mbox){
			$output .= $this->checkbox(array('Mailbox'=>$mbox));
		}		
		$this->set('debug', $output);//not used here but... um.
		$this->redirect("mailboxes/messages/reload");
		
	}
	
	function view($id = null){
		$this->checkSession();
		if($id!=null){
			$this->Message->id = $id;
			$msg = $this->Message->read();
			//$this->set('output',"<pre>".var_export($msg,true)."</pre>");
			$this->set('msg',$msg);
			$this->render('view','ajax');
		}
	}
	
	function checkmail($user_id = null){
		//no need to check for a current session, since this should be able to be called anon
		//get mailboxes
		//then do check mail on each box?
		$this->layout = 'ajax';
		$anon = false;
		if(!$user_id){
			if($this->Session->check('User')){
				$usersess = $this->Session->read('User');
				$user_id = $usersess['id'];
			}
		}
		if($user_id !== null){
			$user = $this->User->read(null,$user_id);			
			if($user == null){
				exit();
			}
		}else{
			$anon = true;
			$user = $this->User->findAll();
		}

		//$this->set('userdata',$user);
		$this->set('userdata',"");
		$output = "";
		if($anon){
			foreach($user as $use){
				foreach($use['Mailbox'] as $mbox){
					$output .= $this->checkbox(array('Mailbox'=>$mbox));
				}
			}
		}else{
			foreach($user['Mailbox'] as $mbox){
				$output .= $this->checkbox(array('Mailbox'=>$mbox));
			}
		}
		//$this->set('debug', $output);
		$this->set('debug', "");
		
	}

	/*
	 * checkBox is an internal function and should be moved to a model
	 */
	function checkBox($mb = null){
		//Should buffer output to ensure nothing gets leaked
		/*
		 * checkBox uses the Pop3 component to check a pop3 account and load the messages into a database,
		 * This does not currently support parsing the message.
		 * 
		 */
		if($mb == null){
			//no mailbox to return
			return "mailbox is null...";
		}
				
		$debug = "";
		$mbid = $mb['Mailbox']['id'];
		$user_id = $mb['Mailbox']['user_id'];
		if(!$this->Pop3->connect($mb['Mailbox']['server']))
	    {
	        $debug = "Ooops in box : $mbid ".$this->Pop3->ERROR."\n";
	        $this->Pop3->log($debug);
	    }else{
		    $Count = $this->Pop3->login($mb['Mailbox']['username'],$mb['Mailbox']['password']);
		    if( (!$Count) or ($Count == -1) )
		    {
		        $debug = $mb['Mailbox']['name']. " : OK[$Count]"; //if count = 0, the !Count is true
		        $this->Pop3->log($debug." error:".$this->Pop3->ERROR);
		        
		    }else{
			    if ($Count < 1)
			    {
			        $debug .= "OK[0]-count";//probably will never get here
			    } else {
			        $debug .= $mb['Mailbox']['name']." : OK[$Count]";
			    	$newmessages = array();
			        for($i = 1; $i <= $Count; $i++){
					    $message = array();
			        	$MsgOne = $this->Pop3->get($i);
					    if( (!$MsgOne) or (gettype($MsgOne) != "array") )
					    {
					        $debug = "ERROR:box id = $mbid".$this->Pop3->ERROR;
					        $this->Pop3->log($debug);
					    }else{					    	
						    //Checks passed, get the body now
					    	$body = "";
					    	//this just does a implode
					    	while ( list ( $lineNum,$line ) = each ($MsgOne) )
						    {
						       	$body .= "$line";
						    }
							
						    $parsetext = $this->parseMail($body);
						    $bodyArr = $this->getBody($parsetext[0]);
						    $imgArr = $this->getImages($parsetext[0]);
						    if(is_array($imgArr)){
						    	//TODO: setup the album as a child of a parent email album
						    	$album = array();
						    	$album['Album'] =array();
						    	$album['Album']['name'] = "email_".date("D M j G:i:s T Y");
						    	
						    	$albm = new Album();
						    	$albm->save($album);
						    	$album_id = $albm->getLastInsertID();
						    	
						    	foreach($imgArr as $img){
							    	//$fname = $img['FileName'];
							    	//$body = $img['Body'];
							    	if(!isset($img['FileName'])){
							    		if(!$this->setFileName($img)){
							    			$this->log("Failed to generate filename (Header):".$img['Headers']['content-type:']);
							    			//dont attempt to save
							    			continue;
							    		}
							    	}
									if(!isset($img['Headers']['content-id:'])){
										$cid = "nocid";
									}else{
										$cid = $img['Headers']['content-id:'];										
									}
									
							    	$imag = new Image();
							    	//$returns = $this->Image->savePic($img['Body'],$img['FileName']);
							    	$returns = $imag->savePic($img['Body'],$img['FileName'],array('album_id'=>$album_id,
							    																  'user_id' =>$mb['Mailbox']['user_id'],
							    																  'cid'=>$cid	
																									));
							    	if(!$returns){
							    		$debug .= "IMAGE SAVE FAILED";
							    	}else{
							    		$debug .= "Img id ".$returns;
							    	}
							    }
						    }
						    
						    //$debug .= "found Body:<br/>".$bodyArr['Body'];
						    $message['body'] = $bodyArr['Body'];

						    $message['subject'] = $parsetext[0]['Headers']['subject:'];
						    //get from string.
						    $from = "";
						    foreach($parsetext[0]['ExtractedAddresses']['from:'] as $frm){
						    	$from .= $frm['address'].";";
						    }
						    $to = "";
						    foreach($parsetext[0]['ExtractedAddresses']['to:'] as $mto){
						    	$to .= $mto['address'].";";
						    }
						    
						    $message['from'] = $from;
						    $message['to'] = $to;
						    $message['mailbox_id'] = $mb['Mailbox']['id'];
						    $message['user_id'] = $mb['Mailbox']['user_id'];
						    if(isset($album_id)){
						    	$message['album_id'] = $album_id;
						    }
						    $message['date'] = date('Y-m-d');//in the mysql format maybe.
						    //attatch to array
							//Determine if this is postable?
							if($this->Admin->siteVar("emailtopostpass") !== null){
								
								$pass = $this->Admin->siteVar("emailtopostpass");
								$this->log('The site has a email post pass'.$pass);
								$pos = strpos($message['body'],$pass);
								if($pos){
									$this->log("email to post");
									$message['body'] = str_replace($pass,"",$message['body']);
									$newpost = array();
									/*
									data[Mag][content]	<p>This is the superfrined prist</p>
									data[Mag][editor]	html
									data[Mag][header]	superfriends
									data[Mag][id]	0
									data[Mag][state]	save
									data[Mag][type]	html
									data[Mag][type]	html
									data[Mag][volume_id]	1
									*/
									if(($defvol = $this->Admin->siteVar('defaultvolume')) === null){
										$defvol = 1;
									}
									$imgstring = "";
									if(isset($album_id)){
										$this->Album->id = $album_id;
										$myalbum = new Album();
										$albumstuff = $myalbum->read(null,$album_id);
										$this->log("albumarray :",$albumstuff);
										$path = $this->Admin->siteVar('imagepath');
										
										foreach($albumstuff['Image'] as $img){
											$imgstring .= "<img class=\"mailimage\" id=\"img_".$img['id']."\" src=\"".$path.$img['thumb']."\" />";
										}
									}
									$newpost['content'] = $imgstring.$message['body'];
									$newpost['editor'] = "html";
									$newpost['header'] = $message['subject'];
									$newpost['type'] = "html";
									$newpost['volume_id'] = $defvol;
									$this->log($newpost);
									if($this->Mag->save($newpost)){
										$this->log("new post saved via email",$newpost);
									}else{
										
										$this->log("new post NOT saved via email",$newpost);
										$this->log($this->Mag->validationErrors);
									}
								}
							}
						    if(!$this->Message->save(array('Message'=>$message))){
						    	$debug .= "Save message failed ".$this->Message->validationErrors."\n";
						    }else{
						    	//if save worked then delete from server
								
						    	if(!$this->Pop3->delete($i))
							    {
							        $debug = "Message not deleted from server: box id = $mbid [".$this->Pop3->ERROR."]\n";
							        $this->Pop3->log($debug);
							        $this->Pop3->reset();
							    } 
							    
						    }
						}
					    
			        }//end for loop
			        //must quit or delete will not work
			        $this->Pop3->quit();
			    }//end count check
		    }
	    }
	    return $debug;
	}//end checkmail
	
	/*
	 * setFileName is an internal function and should be moved to a model
	 */
	function setFileName(&$msg){
		//If there is no filename included in the file - The set the filename to a random number for saving..
		//Currently using a random 8 digit integer. should use something better. but. 
		//get the image type,
		$ctype = $msg['Headers']['content-type:'];
		if(strpos($ctype,";")){
			$ctype = explode(';',$ctype);
		}else{
			$ctype = array($ctype,"none");
		}
		$mtype = $ctype[0];
		if(strpos($mtype, "/")){
			$mtype = explode("/",$mtype);
		}else{
			if($mtype == "image"){
				$mtype = array($mtype,"jpg");
				$this->log("This is not a proper header, setting file type to jpg:".$mtype[0]);
			}else{
				$this->log("This is not a proper image header:".$mtype);
			}			
		}
		//TODO: get list of possible image mime types, currently only supports jpg, png, gif
		$base = rand(10000000,
					 99999999);//8 digits. for coolness - should be able to do this better but.. whatever, like the post id.

		switch($mtype[1]){
			case "gif":
				$base = $base.".gif";
				break;
			case "jpeg":
			case "jpg":
				$base = $base.".jpg";
				break;
			case "png":
				$base = $base.".png";
				break;
			default:
				$base = $base.".".$mtype[1];			
		}
		//Set the filename in the array
		$msg['FileName'] = $base;
		return true;
		
	}
	
	/*
	 * getImages is an internal function and should be in a model
	 */
	function getImages($message){
		$contentType = $this->getContentType($message);
		if(!$contentType){
			echo "content type failure<br>";
			return false;
		}else{
			if($contentType[0]=='multipart'){
				//multiple parts
				$imgArr = false;
				foreach($message['Parts'] as $part){
					if(($img = $this->getImages($part)) !== false){
						
						if($imgArr === false){
							
							$imgArr = array();
							$imgArr[]= $img;//image part, including header, and image
							//$this->log($img);
						}else{
							
							$imgArr[]= $img;//dont create new
						}
					}				
				}
				return $imgArr;
			}else if($contentType[0]=='image'){
				
				return $message;
			}else{
				//TODO check for other file attatchment types other than images
				return false;
			}
		}
		//should not get here, just in case return false.
		return false;
	}
	
	/*
	 * getBody is the same
	 */
	function getBody($message){
		//this is the messge in the format returned by parsmail, or the mime class
		$contentType = $this->getContentType($message);
		if(!$contentType){
			return false;
		}else{
			if($contentType[0]=="multipart"){
				$candidate = "";
				foreach($message['Parts'] as $part){
					$sub = $this->getBody($part);
					//This will not help with more than 1 text section, it will only snag the first.
					//if more than 1 html, one will not be compared. not sure how likely that is,
					//Im guessing that forwards are all about that.					
					if($sub !== false){
						$type = $this->getContentType($sub);
						if(($type[1]== "plain")&&($candidate=="")){
							$candidate = $sub;
						}
						if($type[1] == "html"){
							$candidate = $sub;
						}
					}
				}
				if($candidate=="")return false;
				return $candidate;
			}else if($contentType[0]=="text"){
				//got the goodies
				return $message;
				//let the parent compare what is best
				//either there is only one part or this will be called by getBody because it will be 
				//encapsulated in a multipart
			}else{
				return false;
			}
		}
	}
	
	/*
	 * getcontentType is the same as well
	 */

	function getContentType($message){
		//The more I look that this the more useless it is...
		if(isset($message['Headers']['content-type:'])){
			$ctype = explode(";",$message['Headers']['content-type:']);
			if(sizeOf($ctype)<=1){
				$this->log("content type is missing semi colon; expected");
				$ctype[1] = "empty";
			}
			$mtype = $ctype[0];
			$mp = explode("/",$mtype);
			if(sizeOf($mp)>1){
				return $mp;
			}else{
				$this->log('mail content type does not contain slash : ');
				//return 'unknown/unknown';
				return array('unknown','unknown');
			}
		}else{
			$this->log('invalid message array in getContentType, no root content type found');
		}
		return false;
	}//end getContentType

	function parseMail($mailtext){
	    //$message_file=((IsSet($_SERVER['argv']) && count($_SERVER['argv'])>1) ? $_SERVER['argv'][1] : 'test/sample/message.eml');
	    //$mime=new mime_parser_class;
	    // NOW -> $this->Mime is the classe.....
	    
	    /*
	     * Set to 0 for parsing a single message file
	     * Set to 1 for parsing multiple messages in a single file in the mbox format
	     */
	    $error = "";
	    $output = "";
		$this->Mime->mbox = 1;
	    
	    /*
	     * Set to 0 for not decoding the message bodies
	     */
	    $this->Mime->decode_bodies = 1;
	
	    /*
	     * Set to 0 to make syntax errors make the decoding fail
	     */
	    $this->Mime->ignore_syntax_errors = 1;
	
	    $parameters=array(
	        'Data'=>$mailtext
	        
	        /* Read a message from a string instead of a file */
	        /* 'Data'=>'My message data string',              */
	
	        /* Save the message body parts to a directory     */
	        /* 'SaveBody'=>'/tmp',                            */
		        
	        //'SkipBody'=>0,
	    );

	
	    if(!$this->Mime->Decode($parameters, $decoded)){
	        $error .=  'MIME message decoding error: '.$this->Mime->error.' at position '.$this->Mime->error_position."\n";
	        $this->Mime->log($error);
	    }else{
	    	//$decoded now stores the arrays of messages. the following is for output only. cheers
	    	/*
	        for($message = 0; $message < count($decoded); $message++)
	        {
	            if($this->Mime->Analyze($decoded[$message], $results))
	                $error .= var_export($results,true);
	            else
	                $error .= 'MIME message analyse error: '.$this->Mime->error."\n";
	        }
			*/
	        for($warning = 0, Reset($this->Mime->warnings); $warning < count($this->Mime->warnings); Next($this->Mime->warnings), $warning++)
	        {
	            $w = Key($mime->warnings);
	            $error = 'Warning: '. $this->Mime->warnings[$w] . ' at position '. $w . "\n";
	            $this->Mime-log($error);
	        }
			
	    }
	    
	    return $decoded;
	}
}
?>