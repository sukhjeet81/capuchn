<?php

class Volume extends AppModel
{
    var $name = 'Volume';
    var $recursive = true;
    var $validate = array(
    	'parent_id' => VALID_NUMBER,
  		'name' => VALID_NOT_EMPTY
 	);
    var $hasMany = array('Mag' =>
                         array('className'     => 'Mag',
                               //'conditions'    => 'Comment.moderated = 1',
                               //'order'         => 'Comment.created DESC',
                               //'limit'         => '5',
                               'foreignKey'    => 'volume_id',
                               'dependent'     => true
                               //'exclusive'     => false,
                               //'finderQuery'   => ''
                         )
                  );
       
}

?>