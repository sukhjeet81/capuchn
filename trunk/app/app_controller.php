<?php
class AppController extends Controller
{
    function checkSession()
    {
        // If the session info hasn't been set...
        if (!$this->Session->check('User'))
        {
        	// Force the user to login
            $this->redirect('/user/login');
            exit();
        }
    }
	
	function checkSessionAjax(){
		// If the session info hasn't been set...
        if (!$this->Session->check('User'))
        {
        	// Force the user to login
            $this->redirect('/user/ajaxnologin');
            exit();
        }
	}
    
    function checkSessionAll(){
    	/*
    	 * DEPRECIATED use checkLogin instead
    	 */
    	if($this->Session->check('User')){
    		//the user is logged in, allow the wiki edit featur
    		//the layout will know more than we do now 
    		$cuser = $this->Session->read('User');
    		if($cuser['account_type'] == 'admin'){
    			$this->set('admin_enable', true);
    		}else{
    			$this->set('admin_enable', false);
    		}
    		
    	}else{
    		$this->set('admin_enabled', false);
    	}
    }
    
}
?>