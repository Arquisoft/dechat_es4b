const fc = require("solid-file-client");
const DataSync = require("./datasync");
const namespaces = require("../lib/namespaces");
const Q = require("q");
const newEngine = require("@comunica/actor-init-sparql-rdfjs").newEngine;
//const rdfjsSourceFromUrl = require("./rdfjssourcefactory").fromUrl;
const Message = require("../src/message.js");


class PrivateCommunication {
  constructor(fetch) {
    this.dataSync = new DataSync(fetch);
    this.fetch = fetch;
  };

  /**
  * Loads messages into the inbox
  */
  async loadMessages(myUsername, a,testing){
	  
	var messages = new Array(); 	//here will be stored all messages loaded
	
    // Routes of users inbox
    var myInbox = "https://"+myUsername+".solid.community/inbox/"; 
    var otherUser = a;
    var otherInbox = "https://"+otherUser+".solid.community/inbox/";

    // Let"s read each message file

    var fileWithMessagesSentByMe = myInbox + otherUser + ".ttl";
    var fileWithMessagesSentByTheOtherUSer = otherInbox + myUsername + ".ttl";
	
    var me = myUsername;
    var myMsgRead = false;
    fc.readFile(fileWithMessagesSentByMe).then(  body => {
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
     }
     myMsgRead = true;
    }, err => {if(!testing){}});

    fc.readFile(fileWithMessagesSentByTheOtherUSer).then(  body => {
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
     }
     
     console.log(messages);
     if(!myMsgRead){
      var that = this;
      setTimeout(function(){
        that.orderAndShow(messages, me,testing);
      }, 1000);
     }else {
       this.orderAndShow(messages, me,testing);
     }
    }, err => {if(!testing){
                  var that = this;
                  setTimeout(function(){that.orderAndShow(messages, me,testing);}, 500);}}  );  
  }
  
  orderAndShow(messages, me,testing){
    //Now order the messages
		messages.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.dateTime) - new Date(a.dateTime);
    });
    if(!testing){
		console.log(messages);
    }
    this.showMessages(messages,me,testing);
  }

  showMessages(messages, me,testing){
    for ( var i=messages.length-1; i>=0; i--){
      var mesg = messages[i].content;
      var mesgToAdd = "";
	    var year = messages[i].dateTime.split("-")[0];
	    var month = messages[i].dateTime.split("-")[1];
	    var day = messages[i].dateTime.split("-")[2].split("T")[0];
	    var hourMinute = messages[i].dateTime.split("T")[1];
	    var hour = hourMinute.split(":")[0];
	    var minute = hourMinute.split(":")[1];
	    var dateToAdd = year + "-" + month + "-" + day + " - " + hour + ":" + minute;;
      var format = mesg.split(".");
	    console.log(dateToAdd);
      if (format[format.length-1] == "jpg" || format[format.length-1] == "gif" || format[format.length-1] == "png"){
        mesgToAdd = "<p><img src='" + mesg + "'></p>";
      }else{
        mesgToAdd = '<p>'+mesg+'</p>';
        var re = /\:(\w+)\:/;   
        var copyMesg = "";
        while (copyMesg != mesgToAdd){
          copyMesg = mesgToAdd;
          mesgToAdd = mesgToAdd.replace(re, '<img src="/src/img/emotes/$1.png" width="30" heigth="30">');
        } 
      }
      if(i == messages.length-1 && !testing){ $("#addMessages").empty();}
      if ( messages[i].sender != me ){			
         var toAppend = '<div class="incoming_msg" id="incoming_msg">'+
                    '<div class="received_msg">' +
                      '<div class="received_withd_msg" id="addOtherMessages">'+
                      mesgToAdd + '<span id="userName" class="badge badge-secondary">'+messages[i].sender+'</span>'+'\n'+
					  '<span id="dateMessage" class="badge badge-secondary">' + dateToAdd +'</span>'+
                      '</div>'+
                    '</div>'+
                  '</div>';
          if(!testing){
			  $("#addMessages").append(toAppend);
		  }
      }else{
        console.log(messages[i].content + " en " + messages[i].sender);
          
        var toAppend = '<div class="outgoing_msg" id="outgoing_msg">'+								
                    '<div class="sent_msg" id="addOurMessages">'+
                    mesgToAdd + '<span id="userName" class="badge badge-secondary">'+messages[i].sender+'</span>'+'\n'+
					'<span id="dateMessage" class="badge badge-secondary">' + dateToAdd +'</span>'+
                    '</div>'+
                  '</div>';
        if(!testing){
			  $("#addMessages").append(toAppend);
		  }
      }
    }
  }
  
  //PHOTOS
  
  async sendPhoto(personal,core,file){
	  console.log("Now in commprivate " + file.name);
	  var a = $("#possible-people option:selected").val();
	  var receiver = core.getFriendOfList(personal.friendList, a);
      var extensionFile = file.name.split(".").pop();

	  var myUrlFile = "https://"+personal.username+".solid.community/inbox/"+receiver.username+"-"+this.randomString(10)+"."+extensionFile;
	 $("#data-name").val(myUrlFile);
	 console.log(myUrlFile);
	 fc.createFile(myUrlFile).then( fileCreated => {console.log(`Created file ${fileCreated}.`);}, err => console.log(err) );
	var content = "";
	var reader = new FileReader();
	reader.onload = function (evento) {
		//El evento "onload" se lleva a cabo cada vez que se completa con éxito una operación de lectura
		//La propiedad "result" es donde se almacena el contenido del archivo
		//Esta propiedad solamente es válida cuando se termina la operación de lectura
		content = reader.result;
	 }   		 
	reader.readAsBinaryString(file);
	console.log(content);
    /*
		fc.updateFile(myUrlFile + ".acl", this.templatePermission(receiver.username, receiver.username + ".ttl")).then( success => {
			console.log("Gave permission to my friend")
		}, err => console.log(err) );
    */
		fc.updateFile(myUrlFile,content).then( success => {console.log("Store photo in private");}, err => console.log(err) );
		//await this.sendMessage(personal,core);
  }
  


  /**
  * This method sends a message to a friend
  * Returns an error message if I can not send the message to the user
  */
  async sendMessage(personal, receiver, core,message) {
    if(await this.communicationEstablished(personal.username, receiver)){
      this.sendMessageToPod(personal.username, receiver,message);
    }
    else{
      try {
        this.sendFirstMessage(personal, receiver,message); 
        
      } catch (e) {
        core.logger.error("Could not send message to the user.");
        core.logger.error(e);
      }   
    }
    await this.loadMessages(personal.username,receiver,false);
  }


    /**
  * This method sends an invitation to an user
  * @param receiver is the user who recives the invitation
  */
  sendFirstMessage(personal, receiver,message){
    var myUrlFile = "https://"+personal.username+".solid.community/inbox/"+receiver.username+".ttl";
    var otherUrlFile = "https://"+receiver.username+".solid.community/inbox/"+personal.username+".ttl";
    var dateTimeZero = "2002-05-30T09:00:00";

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
      this.sendMessageToPod(personal.username, receiver,message); 
    }, err => {
      if(err.includes("404")){ //Not found = Not created
        fc.updateFile(myUrlFile, header + "\n\n\n" + myBody).then( success => {
          console.log("Create conversation file in my POD");
          this.sendMessageToPod(personal.username, receiver,message); 
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
  sendMessageToPod(myUsername, receiver,message){
    var myInbox = "https://"+myUsername+".solid.community/inbox/";
    var body = "";
    
    var messageUrl = "M"+this.randomString(6); //RANDOM ID (alphanumeric)
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
	var time = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
	//var time = new Date().toISOString();
	var messageTx = message;

    fc.readFile(myInbox + receiver.username + ".ttl").then( success => {
      if(success.split("\n").length < 14){
        this.givePermission(myInbox, receiver);
      }
      var newText = '\n\n\n:'+messageUrl+' a \t\tschem:Message;\n'+
        '\tschem:dateSent\t\"'+time+'\";\n'+
        '\tschem:givenName\t\"'+myUsername+'\";\n'+
        '\tschem:text\t"'+messageTx+'"\t.';
      body = success + newText;

      fc.updateFile(myInbox + receiver.username + ".ttl", body).then( success => {
        console.log( "Message sent.")
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
                  this.templatePermission(receiver.username, receiver.username+".ttl")).then( success => {console.log( `Permissions changed in your file.`)}, err => console.log(err));
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
    await fc.readFile("https://"+myUsername+".solid.community/inbox/"+receiver.username+".ttl").then( () => {}, err => exists = false );
    await fc.readFile("https://"+receiver.username+".solid.community/inbox/"+myUsername+".ttl").then( ()=> {}, err => exists = false );
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
