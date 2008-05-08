//textarea_id.getCode()
var boxSelected;

function submitForm(){
		var form = document.getElementById('magform');
		form.submit();
}

function editor(){
	if(confirm("TinyMCE will erase any non-html(php, etc.) code when loading, Continue?")){
		this.submitForm();
	}else{
		//reset the menu
		box = document.getElementById("MagEditor");
		box.selectedIndex = boxSelected;
	}
}

window.onresize = function (){ 
	//TODO: verify that this is the correct iframe
	var iframes = document.getElementsByTagName("iframe");
	iframes[0].style.width = (iframes[0].parentNode.clientWidth-10) +'px';
	iframes[0].style.height = iframes[0].parentNode.clientHeight +'px';
}

