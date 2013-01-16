// Defines where to load the SDK from
requirejs.config({
	baseUrl: 'lib'
});
var ctx;
var test;
// Your API key
var dev = {api_key:"l7xx4b2071526ae34e7fb2d33ff02bb82503", api_key_secret:"d6ad0ed4ad0246d19a2a6c424cfcb65d"};
requirejs(["jquery","config.js","Can"],function($,CONFIG,Can){

	/* This function is no longer needed
	function randomString(len) {
        	len = len ? len : 20;
        	var s = "";
       		var chars =
           	 "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        	for(var i=0; i < len; i++)
            		s += chars.charAt(Math.floor(Math.random() * chars.length));
        	return s;
	}*/

	// Helper function to load files
	function loaded(evt) {
		var file = document.getElementById('fileform').files[0];
		var fileName = file.name;
		var header = {};
		header["content-type"] = file.type;
		console.log('name ' +fileName);
		console.log(header);
		console.log(evt.target.result);
		uploadFile(fileName, evt.target.result, header);
	}

	function getFsioUserAccountInfo(ctx) {
        	ctx.fsio.content.getUserAccountInfo(ctx.ticket, function(jqXHR) {
            		// $("body").append("<br><br>" + jqXHR.responseText);
			var data = JSON.parse(jqXHR.responseText);
			console.log(data);
			$("body").append("<table><thead><th>Type</th><th>Volume</th></thead><tbody></tbody></table>");
			$("table > tbody:last").append("<tr><td>Documents</td><td>" + data['Documents'] + "</td></tr>");	
			$("table > tbody:last").append("<tr><td>Files</td><td>" + data['Files'] + "</td></tr>");	
			$("table > tbody:last").append("<tr><td>Images</td><td>" + data['Images'] + "</td></tr>");	
			$("table > tbody:last").append("<tr><td>Music</td><td>" + data['Music'] + "</td></tr>");	
			$("table > tbody:last").append("<tr><td>Videos</td><td>" + data['Videos'] + "</td></tr>");	
			$("table > tbody:last").append("<tr><td>Trash</td><td>" + data['Trash'] + "</td></tr>");
			$("table tr:nth-child(even) td, table th").css({'background-color' : 'grey'});
			$("body").append("<br> You have used " + data['Usage'] + " bytes out of your Quota of " + data['Quota'] + " bytes.");
        	});
    	}

	function downloadFile(ctx, object) {
        	ctx.fsio.data.download(ctx.ticket, object, function(jqXHR) {
            	$("body").append("<br><br>Downloaded '" + object + "': " + jqXHR.status);
		        // $("body").append("<br><br>" + jqXHR.responseText);
		        console.log(jqXHR);
           		// deleteFile(ctx, object);
        	});
    	}

	

	function waitUntilScanned(ctx, object) {
        	ctx.fsio.waitForWorkers(ctx.ticket, object,
                                ["AV","FileTypeWorkerStatus","MetadataWorkerStatus"],
                                10, function(status) {
                                    if(status == "success")
                                        downloadFile(ctx, object);
                                });
    	}
		
	function uploadFile(fileName, fileContents, headers) {

	        ctx.fsio.data.partialUploadInit(ctx.token, fileName, function(jqXHR,textStatus) {
			// console.log(jqXHR.getAllResponseHeaders());
			// console.log(textStatus);
			// test = jqXHR;
			ctx.uploadId = jqXHR.getResponseHeader("upload-id");
			ctx.fsio.data.uploadPartially(ctx.token, ctx.uploadId, fileContents, fileContents.length, function(jqXHR) {
				alert("Uploaded " + fileName + " with status " + jqXHR.status + " and response text " + jqXHR.responseText);
			});
		});
   	
	    /*	ctx.fsio.data.upload(ctx.token, fileName , fileContents, function(jqXHR) {
    		$("body").append("<br><br>Uploaded '" + fileName + "': "+
        	             jqXHR.status);
    		if(jqXHR.status == 204)
        	waitUntilScanned(ctx, fileName);
		}, "", headers); */
	}
	
	function createUploadToken(ctx) {
        	ctx.fsio.ticket.createUploadToken(ctx.ticket, function(
            	jqXHR) {
			test = jqXHR;
			console.log("kdsgk " + jqXHR.getAllResponseHeaders());
            		if(jqXHR.status == 200) {
                		ctx.token = JSON.parse(jqXHR.responseText).Token;
        		} else {
                		$("body").append("<br>Failed to create upload token: " + status);
            		}
        	});
    	}

	function getUserFiles(ctx) {
		ctx.fsio.content.getUserTimeline(ctx.ticket, function(jqXHR) {
			var files = JSON.parse(jqXHR.responseText);
			console.log(files);
			$("body").append("<br><br> Files in your CAN ");
			$("body").append("<ul></ul>");	

			// Does someone know a cleaner alternative for this using $.each() ?
			for (i=0; i < files['Count']; i++){
				if(files['Timeline'][i]['Object'] != undefined)
					$("ul").append("<li><a href=" + files['Timeline'][i]['Object']['URL'] + ">" + files['Timeline'][i]['Object']['Name'] + "</a></li>")
				else
					$("ul").append("<li><a href=" + files['Timeline'][i]['Media']['URL'] + ">" + files['Timeline'][i]['Media']['Name'] + "</a></li>")
			}
			
			$("li").dbclick(function () {
				var fileName = $(this).text();
				ctx.fsio.content.deleteFile(ctx.ticket, fileName, function(jqXHR) {
					alert("File " + fileName + " deleted.");		 
				});
			});
		});
		//downloadFile(ctx,"space_wallpaper_teaser1_1920x1080.jpg");
	}

	$(function() {
	// Create CAN SDK instance.
	var can = new Can(CONFIG, dev.api_key, dev.api_key_secret);

	// The part that was here was moved to index.js - 20121208 - Vidhuran
		
	console.log("Trying to login " );
	can.login(function(status,uuidResponse) {

	        var name = JSON.parse(uuidResponse)["name"];
	
		// $("body").append("Login Return code :"+ status);
		$("body").append("<h2>Hello " + name["givenName"] +" "+ name["familyName"] +"</h2>")
		$("body").append("Your UUID: " + can.getUserUuid());
		
		var fsio = can.createFsioClient();
		can.createFsioUserTicket(fsio, function(
			status, ticket, responsetext){
			var tokens = JSON.parse(responsetext);
			console.log(tokens);	
			if(status == 200){
				ctx = {
					fsio: fsio,
					ticket: ticket
				};
			getFsioUserAccountInfo(ctx);
			getUserFiles(ctx);
			createUploadToken(ctx);
			} else {
				$("body").append("<br> Failed to create a ticket:" + status);
			}
		});
		$("body").append("<br><br>Choose a file to upload : ");
		$("body").append("<input type='file' id='fileform'></input><br>");	
		$("#fileform").on('change',function(){
			var file = this.files[0];
                        var reader = new FileReader();
                        reader.readAsText(file);
                        reader.onload = loaded;
		});
	});
	
	});

});
