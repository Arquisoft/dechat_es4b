const fc = require('solid-file-client');
const DataSync = require('./datasync');
const namespaces = require('../lib/namespaces');
const Q = require('q');
const newEngine = require('@comunica/actor-init-sparql-rdfjs').newEngine;
const rdfjsSourceFromUrl = require('./rdfjssourcefactory').fromUrl;
const Message = require('../src/message.js')

class GroupCommunication {

  constructor(fetch) {
    this.dataSync = new DataSync(fetch);
    this.fetch = fetch;
  };

  /**
  * Loads messages into the inbox
  */
  async loadMessages(personal, myUrlFile){
	  var messages = new Array();
    var group = personal.getGroupByMyUrl(myUrlFile);
    fc.readFile(group.urlCore).then(  body => {
      var res = body.split("\n\n\n");
      //res[1] => GROUP INFO
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
    
      $("#addMessages").empty();
      $("#addOurMessages").empty();
      $("#addOtherMessages").empty();
	  for ( var i=0; i<messages.length; i++){
			var mesg = messages[i].content;
      var mesgToAdd = "";
      var format = mesg.split(".");
			if (format[format.length-1] == "jpg" || format[format.length-1] == "gif" || format[format.length-1] == "png"){
				mesgToAdd = "<p><img src='" + mesg + "'></p>";
			}else{
				mesgToAdd = '<p>'+mesg+'</p>';
			}
			if ( messages[i].sender != personal.username ){			
				var toAppend = '<div class="incoming_msg" id="incoming_msg">'+
									'<div class="received_msg">' +
										'<div class="received_withd_msg" id="addOtherMessages">'+
										mesgToAdd + '<span id="userName" class="badge badge-secondary">'+messages[i].sender+'</span>';+
										'</div>'+
									'</div>'+
								'</div>';
				$("#addMessages").append(toAppend);
			}else{
				console.log(messages[i].content + " en " + messages[i].sender);
				
				var toAppend = '<div class="outgoing_msg" id="outgoing_msg">'+								
									'<div class="sent_msg" id="addOurMessages">'+
									mesgToAdd + '<span id="userName" class="badge badge-secondary">'+messages[i].sender+'</span>'+
									'</div>'+
								'</div>';
				$("#addMessages").append(toAppend);
			}
		}
     }, err => console.log(err) );
  }


  /**
  * This method sends a message to a friend
  * Returns an error message if I can not send the message to the user
  */
  async sendMessage(personal, receiver, core, message) {
    var myUrlFile = receiver;
    try {
      this.sendMessageToGroup(personal, myUrlFile, message); 
    } catch (e) {
      core.logger.error(`Could not send message to the group.`);
      core.logger.error(e);
    }   
    await this.loadMessages(personal, myUrlFile);
  }

    /**
    * Sends a message to the Pod of the user
    * @param receiver is the person who recives message
    */
  sendMessageToGroup(personal, myUrlFile, message){
    var group = personal.getGroupByMyUrl(myUrlFile);
    var urlCore = group.urlCore;

    var messageUrl = "M"+this.randomString(6); //RANDOM ID (alphanumeric)
    var time = new Date().toISOString();
    var messageTx = message;

    fc.readFile(urlCore).then( success => {
      var newText = '\n\n\n:'+messageUrl+' a \t\tschem:Message;\n'+
        '\tschem:dateSent\t\"'+time+'\";\n'+
        '\tschem:givenName\t\"'+personal.username+'\";\n'+
        '\tschem:text\t"'+messageTx+'"\t.';
      var body = success + newText;

      fc.updateFile(urlCore, body).then( success => {
        console.log( `Message sent to group.`)
      }, err => console.log(err) );
    }, err => console.log(err) );
  }


    /**
  * This method sends an invitation to an user
  * @param receiver is the user who recives the invitation
  */
  sendFirstMessage(personal, receiver, rand, groupName){
    var urlCore = "https://"+personal.username+".solid.community/inbox/groupcore_"+rand+".ttl";
    var urlFile = "https://"+receiver.username+".solid.community/inbox/group_"+rand+".ttl";
    var dateTimeZero = "2002-05-30T09:00:00"

    var header = "@prefix : <#>.\n@prefix stor: <http://example.org/storage/>.\n@prefix schem: <http://schema.org/>.\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .";
    var body = ':CHAT\n\tstor:storeIn <'+urlCore+'>;\n\tschem:name "'+groupName+'";\n\tschem:dateRead "'+dateTimeZero+'"^^xsd:dateTime .';

    fc.updateFile(urlFile, header + "\n\n\n" + body).then( success => {
      console.log("Create group file in other POD");
    }, err => console.log(err) );
  }

  createCoreFile(personal, rand, groupName, friendsGroup){
    var urlCore = "https://"+personal.username+".solid.community/inbox/groupcore_"+rand+".ttl";

    var header = "@prefix : <#>.\n@prefix stor: <http://example.org/storage/>.\n@prefix schem: <http://schema.org/>.\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .";
    var body = ':GROUP\n\tschem:name "'+groupName+'" .';

    fc.updateFile(urlCore, header + "\n\n\n" + body).then( success => {
      console.log("Create group file in other POD");
    }, err => console.log(err) );

    fc.updateFile(urlCore + ".acl", this.templatePermission(friendsGroup, "groupcore_" + rand+ ".ttl")).then( success => {
      console.log("Gave permission correctly")
    }, err => console.log(err) );
  }

  templatePermission(friends, file){
    var header = "@prefix : <#>.\n"+
                  "@prefix n0: <http://www.w3.org/ns/auth/acl#>.\n"+
                  "@prefix n1: <http://xmlns.com/foaf/0.1/>.\n"+
                  "@prefix c: </profile/card#>.\n";
    var i = 0;
    for(let friend of friends){
      header += "@prefix c"+i+": <https://"+friend.username+".solid.community/profile/card#>.\n";
      i++;
    }
    header += "\n:ControlReadWrite\n"+
              "\ta n0:Authorization;\n"+
              "\tn0:accessTo <"+file+">;\n"+
              "\tn0:agent c:me;\n"+
              "\tn0:mode n0:Control, n0:Read, n0:Write.\n"+
              ":ReadWrite\n"+
              "\ta n0:Authorization;\n"+
              "\tn0:accessTo <"+file+">;\n"+
              "\tn0:agent ";
    for(var j=0; j<i; j++){
      header += "c" + j + ":me";
      if(j+1 == i)
        header += ";\n"
      else
        header += ", "
    }
    header += "\tn0:mode n0:Read, n0:Write.\n";
    return header;
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



  async clearInbox(core, personal){
    const resources = await core.getAllResourcesInInbox(await core.getInboxUrl(personal.userWebId));

    resources.forEach(async r => {
        this.dataSync.deleteFileForUser(r);
    });
  }

  randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }

  readChatGroups(personal){
    var chatGroups = new Array();
    fc.readFolder("https://"+personal.username+".solid.community/inbox/").then(folder => {
      for(let file of folder.files){
        if(file.name.includes("group_")){
          chatGroups.push(file);
        }
      }
    }, err => console.log(err) );
    return chatGroups;
  }
}

module.exports = GroupCommunication;
