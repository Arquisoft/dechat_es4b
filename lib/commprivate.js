const fc = require('solid-file-client');
const DataSync = require('./datasync');
const namespaces = require('../lib/namespaces');
const Q = require('q');
const newEngine = require('@comunica/actor-init-sparql-rdfjs').newEngine;
const rdfjsSourceFromUrl = require('./rdfjssourcefactory').fromUrl;
const Message = require('../src/message.js')


class PrivateCommunication {

  constructor(fetch) {
    this.dataSync = new DataSync(fetch);
    this.fetch = fetch;
  };

  /**
  * Loads messages into the inbox
  */
  async loadMessages(myUsername){
	  
	  var messages = new Array(); 	//here will be stored all messages loaded
	  
    // Routes of users inbox
    var myInbox = "https://"+myUsername+".solid.community/inbox/"; 
    var otherUser = document.getElementById("possible-people").value;
    var otherInbox = "https://"+otherUser+".solid.community/inbox/";

    // Let's read each message file

    var fileWithMessagesSentByMe = myInbox + otherUser + ".ttl";
    var fileWithMessagesSentByTheOtherUSer = otherInbox + myUsername + ".ttl";
	
	var me = myUsername;
	$("#addMessages").empty();
	$("#addOurMessages").empty();
    $("#addOtherMessages").empty();
    fc.readFile(fileWithMessagesSentByMe).then(  body => {
     //$("#addOurMessages").empty();
     var res = body.split("\n\n\n");
     //res[1] => CHAT INFO
     var chat = res[1];
     //res[>=2] => MENSAJES (MXXXX)
     for(var i=2; i<res.length; i++){
       var lines = res[i].split("\n");
       //Get ID
       var temp = lines[0].split(" a ")[0];
       temp = temp.replace(":", "");
       //Get Time
       var dateTime = lines[1].split('"')[1];
       //Get Sender
       var sender = lines[2].split('"')[1];
	   me = sender;
       //Get Message
       var aux = lines[3].split('\t"')[1];
       var message = aux.replace('"\t.', "");
       console.log(temp, dateTime, sender, message);
	   messages.push(new Message(sender,dateTime,message));
      // var toAppend = "<p>"+message+"</p>" + "<span id='userName' class='badge badge-secondary'>"+sender+"</span>";			
       // $("#addOurMessages").append(toAppend);
     }
    }, err => $("#addOurMessages").empty() );

    fc.readFile(fileWithMessagesSentByTheOtherUSer).then(  body => {
     //$("#addOtherMessages").empty();
     var res = body.split("\n\n\n");
     //res[1] => CHAT INFO
     var chat = res[1];
     //res[>=2] => MENSAJES (MXXXX)
     for(var i=2; i<res.length; i++){
       var lines = res[i].split("\n");
       //Get ID
       var temp = lines[0].split(" a ")[0];
       temp = temp.replace(":", "");
       //Get Time
       var dateTime = lines[1].split('"')[1];
       //Get Sender
       var sender = lines[2].split('"')[1];
       //Get Message
       var aux = lines[3].split('\t"')[1];
       var message = aux.replace('"\t.', "");
       console.log(temp, dateTime, sender, message);
	   messages.push(new Message(sender,dateTime,message));
       //var toAppend = "<p>"+message+"</p>" + "<span id='userName' class='badge badge-secondary'>"+sender+"</span>";			
      // $("#addOtherMessages").append(toAppend);
     }
	 
	 console.log(messages);
	  //Now order the messages
		messages.sort(function(a,b){
	  // Turn your strings into dates, and then subtract them
	  // to get a value that is either negative, positive, or zero.
		  return new Date(b.dateTime) - new Date(a.dateTime);
		});
		console.log(messages);
		for ( var i=messages.length-1; i>=0; i--){
			if ( messages[i].sender === me ){			
				var toAppend = '<div class="incoming_msg" id="incoming_msg">'+
									'<div class="received_msg">' +
										'<div class="received_withd_msg" id="addOtherMessages">'+
										'<p>'+messages[i].content+'</p>' + '<span id="userName" class="badge badge-secondary">'+messages[i].sender+'</span>';+
										'</div>'+
									'</div>'+
								'</div>';
				$("#addMessages").append(toAppend);
			}else{
				console.log(messages[i].content + " en " + messages[i].sender);
				
				var toAppend = '<div class="outgoing_msg" id="outgoing_msg">'+								
									'<div class="sent_msg" id="addOurMessages">'+
									'<p>'+messages[i].content+'</p>' + '<span id="userName" class="badge badge-secondary">'+messages[i].sender+'</span>'+
									'</div>'+
								'</div>';
				$("#addMessages").append(toAppend);
			}
		}
	 
    }, err => $("#addOtherMessages").empty() );
	
  }
  
  //PHOTOS
  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////
   /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////
  async sendPhoto(personal,core,file){
	  var a = $("#possible-people option:selected").val();
		var receiver = core.getFriendOfList(personal.friendList, a);
		var extensionFile = this.getFileExtension(file.name);
		var myUrlFile = "https://"+personal.username+".solid.community/inbox/"+receiver.username+"-"+this.randomString(10)+extensionFile;
		$("#data-name").val(myUrlFile);
		
		fileClient.createFile(myUrlFile).then( fileCreated => {
			console.log(`Created file ${fileCreated}.`);
		}, err => console.log(err) );
		
		var reader = new FileReader();
		
		await this.sendMessage(personal,core);
  }
  
	// function getFileExtension(filename) {
		// return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
	// }

   /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////
  /**
  * This method sends a message to a friend
  * Returns an error message if I can not send the message to the user
  */
  async sendMessage(personal, core) {
    var a = $("#possible-people option:selected").val();
    var receiver = core.getFriendOfList(personal.friendList, a);
    if(await this.communicationEstablished(personal.username, receiver)){
      this.sendMessageToPod(personal.username, receiver);
    }
    else{
      try {
        this.sendFirstMessage(personal, receiver); 
        
      } catch (e) {
        core.logger.error(`Could not send message to the user.`);
        core.logger.error(e);
      }   
    }
    await this.loadMessages(personal.username);
  }


    /**
  * This method sends an invitation to an user
  * @param receiver is the user who recives the invitation
  */
  sendFirstMessage(personal, receiver){
    var myUrlFile = "https://"+personal.username+".solid.community/inbox/"+receiver.username+".ttl";
    var otherUrlFile = "https://"+receiver.username+".solid.community/inbox/"+personal.username+".ttl";
    var dateTimeZero = "2002-05-30T09:00:00"

    var header = "@prefix : <#>.\n@prefix stor: <http://example.org/storage/>.\n@prefix schem: <http://schema.org/>.\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .";

    var myBody = ':CHAT\n\tstor:storeIn <'+otherUrlFile+'>;\n\tschem:dateRead "'+dateTimeZero+'"^^xsd:dateTime .';
    var otherBody = ':CHAT\n\tstor:storeIn <'+myUrlFile+'>;\n\tschem:dateRead "'+dateTimeZero+'"^^xsd:dateTime .';

    fc.readFile(otherUrlFile).then( success => {
    }, err => {
      if(err.includes("403")){  //No permissions (No answers yet)
      }
      else if(err.includes("404")){ //Not found = Not created
        fc.updateFile(otherUrlFile, header + "\n\n\n" + otherBody).then( success => {
          console.log("Create conversation file in other POD");
        }, err => console.log(err) );
      }
    });

    fc.readFile(myUrlFile).then( success => {
      this.sendMessageToPod(personal.username, receiver); 
    }, err => {
      if(err.includes("404")){ //Not found = Not created
        fc.updateFile(myUrlFile, header + "\n\n\n" + myBody).then( success => {
          console.log("Create conversation file in my POD");
          this.sendMessageToPod(personal.username, receiver); 
        }, err => console.log(err) );
      }
    });

    

    fc.updateFile(myUrlFile + ".acl", this.templatePermission(receiver.username, receiver.username + ".ttl")).then( success => {
      console.log("Gave permission to my friend")
    }, err => console.log(err) );

  }




  /**
  * Sends a message to the Pod of the user
  * @param receiver is the person who recives message
  */
  sendMessageToPod(myUsername, receiver){
    var myInbox = "https://"+myUsername+".solid.community/inbox/";
    var body = "";
    
    var messageUrl = "M"+this.randomString(6); //RANDOM ID (alphanumeric)
    var time = new Date().toISOString();
    var messageTx = $("#data-name").val();
    $("#data-name").val("");

    fc.readFile(myInbox + receiver.username + ".ttl").then( success => {
      if(success.split('\n').length < 14){
        this.givePermission(myInbox, receiver);
      }
      var newText = '\n\n\n:'+messageUrl+' a \t\tschem:Message;\n'+
        '\tschem:dateSent\t\"'+time+'\";\n'+
        '\tschem:givenName\t\"'+myUsername+'\";\n'+
        '\tschem:text\t"'+messageTx+'"\t.';
      body = success + newText;

      fc.updateFile(myInbox + receiver.username + ".ttl", body).then( success => {
        console.log( `Message sent.`)
      }, err => console.log(err) );
    }, err => console.log(err) );

  }




  /**
  * Give permissions to an user over an especific inbox
  * @param myInbox the inbox of the user
  * @param receiver is the person who recives messages
  */
  givePermission(myInbox, receiver){
    fc.updateFile(myInbox + receiver.username + ".ttl.acl", 
                  this.templatePermission(receiver.username, receiver.username+".ttl")).then( success => {
        console.log( `Permissions changed in your file.`)
    }, err => console.log(err) );
  };

  templatePermission(other, file){
    var textPer = "@prefix : <#>.\n"+
                  "@prefix n0: <http://www.w3.org/ns/auth/acl#>.\n"+
                  "@prefix n1: <http://xmlns.com/foaf/0.1/>.\n"+
                  "@prefix c: </profile/card#>.\n"+
                  "@prefix c0: <https://"+other+".solid.community/profile/card#>.\n\n"+
                  ":ControlReadWrite\n"+
                    "\ta n0:Authorization;\n"+
                    "\tn0:accessTo <"+file+">;\n"+
                    "\tn0:agent c:me, c0:me;\n"+
                    "\tn0:mode n0:Control, n0:Read, n0:Write.\n"+
                  ":Read\n"+
                    "\ta n0:Authorization;\n"+
                    "\tn0:accessTo <"+file+">;\n"+
                    "\tn0:agentClass n1:Agent;\n"+
                    "\tn0:mode n0:Read.\n"/*+
                  ":ReadWrite\n"+
                    "\ta n0:Authorization;\n"+
                    "\tn0:accessTo <"+file+">;\n"+
                    "\tn0:agent c0:me;\n"+
                    "\tn0:mode n0:Read, n0:Write.\n"*/;
    return textPer;
  };

  /**
  * Establish the communication with a receiver
  * @param receiver is the person who recives messages
  */
  async communicationEstablished(myUsername, receiver){
    var exists = true;
    await fc.readFile("https://"+myUsername+".solid.community/inbox/"+receiver.username+".ttl").then(  body => {
    }, err => exists = false );
    await fc.readFile("https://"+receiver.username+".solid.community/inbox/"+myUsername+".ttl").then(  body => {
    }, err => exists = false );
    return exists;
  }

  randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
}

module.exports = PrivateCommunication;
