// Defines where to load the SDK from
requirejs.config({
	baseUrl: 'lib'
});

// Your API key
var dev = {api_key:"l7xx4b2071526ae34e7fb2d33ff02bb82503", api_key_secret:"d6ad0ed4ad0246d19a2a6c424cfcb65d"};
requirejs(["jquery","config.js","Can"],function($,CONFIG,Can){

	

	// Create CAN SDK instance.
	var can = new Can(CONFIG, dev.api_key, dev.api_key_secret);

	// Performs an oAuth login via Facebook upon success redirect to our index page.

	// Runs well if the url below if a localhost address , but not when some other domain name. 

	can.getLoginUrl("http://127.0.0.1/airship/app.html",function(status,url) {
		if(status == 200){

			 console.log("getLoginUrl : " + url);

			// This works when the Facebook login is in the cookies , but you need to uncomment this if the cookies are cleared. 
			window.location.replace(decodeURIComponent(url));
		}else{
			$("body").append("Failed to get login url : " + status);
		}
	});
});
