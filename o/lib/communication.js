const fc = require('solid-file-client');
const json = require('jsonld');

class Communication {

  constructor() {
	this.loadedMessages = []	// array of messages
  };

  /**
  * Loads messages into the inbox
  */
  async loadMessages(myUsername){
    // Routes of users inbox
    var myInbox = "https://"+myUsername+".solid.community/inbox/"; 
    var otherUser = document.getElementById("possible-people").value;
    var otherInbox = "https://"+otherUser+".solid.community/inbox/";

    // Let's read each message file

    var fileWithMessagesSentByMe = myInbox + otherUser + ".jsonld";
    var fileWithMessagesSentByTheOtherUSer = otherInbox + myUsername + ".jsonld";

    fc.readFile(fileWithMessagesSentByMe).then(  body => {
		// var jsonParsed = JSON.parse(body);
		// for ( var i=0; i<jsonParsed.messages.length; i++){
				// this.loadedMessages.push(new Message(jsonParsed[i].text,jsonParsed[i].date));
				// console.log("Mensaje leido: " + jsonParsed[i].text);
		// }
      var lines = body.split("\n");
      var i = 0;
      $("#addOurMessages").empty();
      for ( var linea of lines ) {
        if ( i===0 || i===1 ||linea === "" )
          console.log(linea);
        else {
          var toAppend = "<p>"+linea+"</p>" + "<span id='userName' class='badge badge-secondary'>"+myUsername+"</span>";			
          $("#addOurMessages").append(toAppend);
          console.log("Añadida linea: " + linea);
        }
      i++;
     }
    }, err => console.log(err) );

    fc.readFile(fileWithMessagesSentByTheOtherUSer).then(  body => {
		// var jsonParsed = JSON.parse(body);
		// for ( var i=0; i<jsonParsed.messages.length; i++){
				// this.loadedMessages.push(new Message(jsonParsed[i].text,jsonParsed[i].date));
				// console.log("Mensaje leido: " + jsonParsed[i].text);
		// }
      var lines = body.split("\n");
      var i = 0;
      $("#addOtherMessages").empty();
      for ( var linea of lines ) {
        if ( i===0 || i===1 || linea === "")
          console.log(linea);
        else {
          var toAppend = "<p>"+linea+"</p>" + "<span id='userName' class='badge badge-secondary'>"+otherUser+"</span>";			
          $("#addOtherMessages").append(toAppend);
          console.log("Añadida linea: " + linea);
        }
        i++;
      }
    }, err => console.log(err) );
  }


  /**
  * This method sends a message to a friend
  * Returns an error message if I can not send the message to the user
  */
  async sendMessage(personal, core) {
    var message = $('#data-name').val();
    var a = $("#possible-people option:selected").val();
    var receiver = core.getFriendOfList(personal.friendList, a);
    if(await this.communicationEstablished(personal.username, receiver)){
      this.sendMessageToPod(personal.username, receiver);
    }
    else{
      try {
        this.sendFirstMessage(personal.username, receiver);  
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
  sendFirstMessage(myUsername, receiver){
	  
	var myInbox = "https://"+myUsername+".solid.community/inbox/";
	var message = JSON.parse('{ "@context" : { "sch" : "https://schema.org/Message"},'
	+ '"sch:messages" : [ {"sch:text" : "' + $('#data-name').val() + '", "sch:dateSent" : "' + new Date() + '", "sch:sender" : "' + myUsername + '"}]}');
	document.getElementById("data-name").value = ""; 
	  
	// var m = new Message($('#data-name').val(),new Date(),myUsername);	// como añadirlo sin hacerlo 'a mano' ¿?¿?
	// var myInbox = "https://"+myUsername+".solid.community/inbox/";
    // var jsonFile = 
    $("#data-name").val("");   
    
    // fc.updateFile(receiver.inbox + myUsername + ".txt", myInbox + receiver.username + ".txt" + "\n@@@\n").then( success => {
      // console.log( `Send message to their PODs.`)
    // }, err => console.log(err) );
    fc.updateFile(myInbox + receiver.username + ".jsonld", message).then( success => {
      console.log( `Send message to your POD.`)
    }, err => console.log(err) );
    fc.updateFile(myInbox + receiver.username + ".txt.acl", this.templatePermission(receiver.username, receiver.username + ".txt")).then( success => {
      console.log( `Send message to your POD.`)
    }, err => console.log(err) );
  }




  /**
  * Sends a message to the Pod of the user
  * @param receiver is the person who recives message
  */
  sendMessageToPod(myUsername, receiver){
    var myInbox = "https://"+myUsername+".solid.community/inbox/";
    var body = "";
    fc.readFile(myInbox + receiver.username + ".txt").then( success => {
      if(success.split('\n').length < 7){
        console.log(success.split('\n').length);
        this.givePermission(myInbox, receiver);
      }
        
      body = success/* + "\n" + $('#data-name').val()*/;
      fc.updateFile(myInbox + receiver.username + ".jsonld", body).then( success => {
        console.log( `Send message to your POD.`);
        $("#data-name").val("");
      }, err => console.log(err) );
    }, err => console.log(err) );
  }



  /**
  * Give permissions to an user over an especific inbox
  * @param myInbox the inbox of the user
  * @param receiver is the person who recives messages
  */
  givePermission(myInbox, receiver){
    fc.updateFile(myInbox + receiver.username + ".txt.acl", 
                  this.templatePermission(receiver.username, receiver.username+".txt")).then( success => {
        console.log( `Permissions changed your POD.`)
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
    var exists = false;
    await fc.readFile("https://"+myUsername+".solid.community/inbox/"+receiver.username+".txt").then(  body => {
      exists = true;
    }, err => console.log('The file does not exist') );
    return exists;
  }



  async clearInbox(core, personal){
    const resources = await core.getAllResourcesInInbox(await core.getInboxUrl(personal.userWebId));

    resources.forEach(async r => {
        dataSync.deleteFileForUser(r);
    });
  }





}

module.exports = Communication;
