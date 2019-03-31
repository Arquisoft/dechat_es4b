// const PrivateCommunication = require('../lib/commprivate');

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
	for ( var i=0; i<files.length; i++){
		if (!files[i].type.match('image.*')) {
			continue;
		}
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				var urlLocal = e.target.result;
				storePhoto(urlLocal,
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }
  }
		// var photoUbication = storePhoto(files[f]);
		// $("#data-name").val(photoUbication);
		// await com.sendMessage(personal);
	}
}

function storePhoto(urlFile){
	fileClient.createFile(newFile).then( fileCreated => {
	  console.log(`Created file ${fileCreated}.`);
	}, err => console.log(err) );
}

window.addEventListener("load",start,false);