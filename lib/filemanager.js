// const PrivateCommunication = require('../lib/commprivate');
// let personal = new Personal(core);

function start(){
	var drop = document.getElementById("drop_zone");
	
	drop.addEventListener("dragenter",function(e){
		e.preventDefault();
	}, false);
	
	drop.addEventListener("dragover", function(e){
		e.preventDefault();
	}, false);
	
	drop.addEventListener("drop", dropped, false);
}

function dropped(e){
	e.preventDefault();
	var files = e.dataTransfer.files;
	for ( var f=0; f<files.length; f++){
		// var photoUbication = storePhoto(files[f]);
		// $("#data-name").val(photoUbication);
		// await com.sendMessage(personal);
	}
}

// function storePhoto(file){
	// fc.uploadFile(file,url).then(success => {
		// console.log(`Uploaded ${localPath} to ${url}.`);
// }, err => console.log(err) );
// }

window.addEventListener("load",start,false);