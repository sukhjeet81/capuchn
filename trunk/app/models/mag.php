<?php

class Mag extends AppModel {
/*
 * The page model is a model of a page in a magazine, or more likely - an article on a page, 
 * 
 * Basically the picture here is like the the leaf of a tree, green and somtimes falls off. Ok,
 * more like it contains a single bit of information. weather it is a quick blog like post, a twitt or
 * a full on article. 
 */
	
  var $name = 'Mag';

  var $validate = array(
    'volume_id' => VALID_NUMBER,
  	'header' => VALID_NOT_EMPTY,
    'content' => VALID_NOT_EMPTY
  );

  var $belongsTo = array('Volume' =>
  						array(	'className'  => 'Volume',
                                'conditions' => '',
                                'order'      => '',
                                'foreignKey' => 'volume_id'                           
  						),
  						'User' =>
  						array(	'className'  => 'User',
                                'conditions' => '',
                                'order'      => '',
                                'foreignKey' => 'user_id'                           
  						)
                    );
                    
}

?>