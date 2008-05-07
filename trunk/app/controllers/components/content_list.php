<?php 
class ContentListComponent extends Object
{
    var $controller = true;
 
    function startup(&$controller)
    {
    	$controller->set('content_list', $controller->Volume->findAllThreaded());
    }
 
}
?>