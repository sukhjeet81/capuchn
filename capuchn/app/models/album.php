<?php

class Album extends AppModel
{
    var $name = 'Album';
    
    var $validate = array(
    	'parent_id' => VALID_NUMBER,
  		'name' => VALID_NOT_EMPTY
 	);
    var $hasMany = array('Image' =>
                         array('className'     => 'Image',
                               //'conditions'    => 'Comment.moderated = 1',
                               //'order'         => 'Comment.created DESC',
                               //'limit'         => '5',
                               'foreignKey'    => 'album_id',
                               'dependent'     => true
                               //'exclusive'     => false,
                               //'finderQuery'   => ''
                         )
                  );
       
}

?>