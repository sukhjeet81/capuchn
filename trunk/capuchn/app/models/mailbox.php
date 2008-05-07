<?php 
class Mailbox extends AppModel {
/*
	id - int
    name - 	varchar 64	Mailbox name - required
	type -	enum/varchar 32	- type (pop3, local, autopost, comment, bulliten)
	username - varchar 64
	password - varchar 64
	autopostpass - varchar 16  - textstring (string that stays in the thing)
	user_id - int
	server - text 
*/
	
	
  	var $name = 'Mailbox';

  	/*
  	var $validate = array(
    	'album_id' => VALID_NUMBER,
  		'path' => VALID_NOT_EMPTY
  	);
  	*/

  	var $belongsTo = array('User' =>
  						array(	'className'  => 'User',
                                'conditions' => '',
                                'order'      => '',
                                'foreignKey' => 'user_id'                           
  						)
                    );
                    
	var $hasMany = array('Message' =>
                         array('className'     => 'Message',
                               'conditions'    => '',
                               'order'         => '',
                               'limit'         => '',
                               'foreignKey'    => 'mailbox_id',
                               'dependent'     => true,
                               'exclusive'     => false,
                               'finderQuery'   => '',
                               'fields'        => '',
                               'offset'        => '',
                               'counterQuery'  => ''
                         )
                  );
	function getMessages(){
		//get messages for this mailbox.
	}
}//end class   
?>