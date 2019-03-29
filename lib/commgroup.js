const fc = require('solid-file-client');
const DataSync = require('./datasync');
const namespaces = require('../lib/namespaces');
const Q = require('q');
const newEngine = require('@comunica/actor-init-sparql-rdfjs').newEngine;
const rdfjsSourceFromUrl = require('./rdfjssourcefactory').fromUrl;


class GroupCommunication {

  constructor(fetch) {
    this.dataSync = new DataSync(fetch);
    this.fetch = fetch;
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

    var fileWithMessagesSentByMe = myInbox + otherUser + ".ttl";
    var fileWithMessagesSentByTheOtherUSer = otherInbox + myUsername + ".ttl";

    fc.readFile(fileWithMessagesSentByMe).then(  body => {
     $("#addOurMessages").empty();
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
       var toAppend = "<p>"+message+"</p>" + "<span id='userName' class='badge badge-secondary'>"+sender+"</span>";			
        $("#addOurMessages").append(toAppend);
     }
    }, err => console.log(err) );

    fc.readFile(fileWithMessagesSentByTheOtherUSer).then(  body => {
     $("#addOtherMessages").empty();
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
       var toAppend = "<p>"+message+"</p>" + "<span id='userName' class='badge badge-secondary'>"+sender+"</span>";			
       $("#addOtherMessages").append(toAppend);
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
  sendFirstMessage(personal, receiver, rand){
    var urlCore = "https://"+personal.username+".solid.community/inbox/groupcore_"+rand+".ttl";
    var urlFile = "https://"+receiver.username+".solid.community/inbox/group_"+rand+".ttl";
    var dateTimeZero = "2002-05-30T09:00:00"

    var header = "@prefix : <#>.\n@prefix stor: <http://example.org/storage/>.\n@prefix schem: <http://schema.org/>.\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .";
    var body = ':CHAT\n\tstor:storeIn <'+urlCore+'>;\n\tschem:dateRead "'+dateTimeZero+'"^^xsd:dateTime .';

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

    fc.updateFile(urlFile + ".acl", this.templatePermission(friendsGroup, "groupcore_" + rand+ ".ttl")).then( success => {
      console.log("Gave permission correctly")
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


  templatePermission(friends, file){
    var header = "@prefix : <#>.\n"+
                  "@prefix n0: <http://www.w3.org/ns/auth/acl#>.\n"+
                  "@prefix n1: <http://xmlns.com/foaf/0.1/>.\n"+
                  "@prefix c: </profile/card#>.\n";
    var i = 0;
    for(friend in friends){
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
}

module.exports = GroupCommunication;
