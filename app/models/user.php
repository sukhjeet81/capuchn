<?php
/*
CREATE TABLE `users` (
`id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`username` VARCHAR( 64 ) NOT NULL ,
`password` VARCHAR( 32 ) NOT NULL ,
`account_type` VARCHAR( 8 ) NOT NULL ,
`first_name` VARCHAR( 32 ) NOT NULL ,
`last_name` VARCHAR( 32 ) NOT NULL ,
`email` VARCHAR( 64 ) NOT NULL ,
INDEX ( `username` )
) ENGINE = MYISAM ;

 * 
 */

class User extends AppModel
{
    var $name = 'User';
    var $validate = array(
    	'username' => VALID_NOT_EMPTY,
    	'password' => VALID_NOT_EMPTY,
    	'account_type' => VALID_NOT_EMPTY,
    	'first_name' => VALID_NOT_EMPTY,
    	'last_name' => VALID_NOT_EMPTY,
    	'email' => VALID_NOT_EMPTY,
 	);
 	
    var $hasMany = array('Mag' =>
                         array('className'     => 'Mag',
                               //'conditions'    => 'Comment.moderated = 1',
                               //'order'         => 'Comment.created DESC',
                               //'limit'         => '5',
                               'foreignKey'    => 'user_id',
                               'dependent'     => true
                               //'exclusive'     => false,
                               //'finderQuery'   => ''
                         ),
                         'Mailbox' =>
                         array('className'     => 'Mailbox',
                               'conditions'    => '',
                               'order'         => '',
                               'limit'         => '',
                               'foreignKey'    => 'user_id',
                               'dependent'     => true,
                               'exclusive'     => false,
                               'finderQuery'   => '',
                               'fields'        => '',
                               'offset'        => '',
                               'counterQuery'  => ''
                         )
                  );
}


?>