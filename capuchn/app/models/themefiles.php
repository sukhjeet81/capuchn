<?php
/*
 * CREATE TABLE `themefiles` (
`id` INT NOT NULL AUTO_INCREMENT ,
`name` VARCHAR( 64 ) NOT NULL ,
`theme_id` INT NOT NULL ,
`type` VARCHAR( 64 ) NOT NULL ,
`path` VARCHAR( 256 ) NOT NULL ,
`content` TEXT NOT NULL ,
INDEX ( `id` )
) ENGINE = MYISAM ;
 */
class Themefiles extends AppModel {
	var $name = 'Themefiles';
	
	var $belongsTo = array('Theme' =>
  						array(	'className'  => 'Theme',
                                'conditions' => '',
                                'order'      => '',
                                'foreignKey' => 'theme_id'                           
  						)
                    );
}
?>
