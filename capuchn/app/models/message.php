<?php 
class Message extends AppModel {
	
	//This is a message in the mailbox, each mailbox i has a user, but the messages do not
	//this may be a more secure method, but. whatever.
	
	var $name = 'Message';

	var $belongsTo = array('Mailbox'=>
						array(
							'className' 	=> 'Mailbox',
							'conditions' 	=> '',
							'order'			=> '',
							'foreignKey'	=> 'mailbox_id'
						)
					);
	
	function deleteMessage(){
		//example. 
	}
}//end class   
?>