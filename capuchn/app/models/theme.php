<?php
class Theme extends AppModel
{
    var $name = 'Theme';
	var $recursive = true;
	
	/*
	 * Theme is structured like
	 * id - id
	 * name - reference name
	 * style - the main stylesheet
	 * mce - the stylesheet to be used in tinymce editor.
	 * layout - the actual html layout
	 * config - a serialized php array
	 */
    var $hasMany = array('Themefiles' =>
                     array('className'     => 'Themefiles',
                           //'conditions'    => 'Comment.moderated = 1',
                           //'order'         => 'Comment.created DESC',
                           //'limit'         => '5',
                           'foreignKey'    => 'theme_id',
                           'dependent'     => true
                           //'exclusive'     => false,
                           //'finderQuery'   => ''
                     )
              );
	
}
?>