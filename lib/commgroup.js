const fc = require("solid-file-client");
const DataSync = require("./datasync");
const Message = require("../src/message.js");
const Alerts = require("../src/alerts");
const Encryptor = require("./encrypt");
const BaseCommunication = require("./communication.js");

class GroupCommunication extends BaseCommunication{

  constructor(fetch) {
    super();  
    this.dataSync = new DataSync(fetch);
    this.encryptor = new Encryptor();
    this.fetch = fetch;
    this.emojisEnabled = true;
    this.alerts = new Alerts(false);
    this.currentUrlFile = "";
    this.chatShowed = "";
  }

  /**
  * Loads messages into the inbox
  */
  async loadMessages(personal, myUrlFile, testing){
    var messages = new Array();
    var group;
    var newChat = "";
    if(testing){
      group = {"file": {"url":"https://enriquead.solid.community/public/mariodiaz98.ttl"}, "name": "testChat", "type": "group", "urlCore": "urlRemote"};
      group.urlCore = "https://enriquead.solid.community/public/mariodiaz98.ttl";
    }
    else{
      group = personal.getGroupByMyUrl(myUrlFile);
    }	
    fc.readFile(group.file.url).then( (body) => {
      var res = body.split("\n\n\n");
      //res[1] => GROUP INFO
      var dateRead = res[1].split("schem:dateRead")[1].split('"')[1];
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      var t = new Date(Date.now() - tzoffset);
      t.setSeconds(t.getSeconds() + 10);
      var time = t.toISOString().slice(0, -1);
      var newBody = body.replace(dateRead, time);
      fc.updateFile(group.file.url, newBody).then(() => {}, (err) => {console.log(err);});
    }, () => {});
    fc.readFile(group.urlCore).then( (body) => {
      var res = body.split("\n\n\n");     
      //res[>=2] => MENSAJES (MXXXX)
      for(var i=2; i<res.length; i++){
        var lines = res[i].split("\n");
        if(lines.length === 4){
          //Get ID
          var temp = lines[0].split(" a ")[0];
          temp = temp.replace(":", "");
          //Get Time
          var dateTime = lines[1].split("\"")[1];
          //Get Sender
          var sender = lines[2].split("\"")[1];
          //Get Message
          var aux = lines[3].split("\t\"")[1];
          var message = aux.replace("\"\t.", "");
          //console.log(temp, dateTime, sender, message);
          messages.push(new Message(sender,dateTime,message));
        }   
      }
      var j;
      for (j=0; j<messages.length; j++) {
        var mesg = messages[j].content;
        mesg = this.encryptor.decrypt(mesg);
        var mesgToAdd = "";
        var year = messages[j].dateTime.split("-")[0];
        var month = messages[j].dateTime.split("-")[1];
        var day = messages[j].dateTime.split("-")[2].split("T")[0];
        var hourMinute = messages[j].dateTime.split("T")[1];
        var hour = hourMinute.split(":")[0];
        var minute = hourMinute.split(":")[1];
        var dateToAdd = year + "-" + month + "-" + day + " - " + hour + ":" + minute;
        //console.log(dateToAdd);
        var format = mesg.split(".");
        if (format[format.length-1] === "jpg" || format[format.length-1] === "gif" || format[format.length-1] === "png" || mesg.startsWith("data:image")){
          mesgToAdd = "<p><img src=\""+mesg+"\"></p>";
        }else if(mesg.startsWith("data:application/octet-stream;base64")){
          mesgToAdd = "<p><audio controls=\"controls\" autobuffer=\"autobuffer\">"+
                      "<source src=\""+mesg+"\"/></audio></p>";
        }else{
			if ( mesg.startsWith("https://") )
				mesgToAdd = "<p><a href="+mesg+" target='_blank'>"+mesg+"</a></p>";
			else if ( mesg.startsWith("data/ubication") ){
				mesgToAdd = "<p>"+mesg.split(":")[1]+"</p>";
			}
			else if ( mesg.startsWith("data/audio") ){
				mesgToAdd = "<audio src=\""+mesg.split("$")[1]+"\" preload='auto' controls></audio>";
			}
			else if ( mesg.startsWith("data/video") ){
				mesgToAdd = "<video src=\""+mesg.split("$")[1]+"\" controls></video>";
			}
			else
				mesgToAdd = "<p>"+mesg+"</p>";
          if(this.emojisEnabled){
            var emojisToChange = this.getTrueEmojis(mesg);
            if(emojisToChange.length !== 0){
              for (var e of emojisToChange){
                var re = new RegExp(":"+e+":", "g");
                mesgToAdd = mesgToAdd.replace(re, "<img src=\"src/img/emotes/"+e+".png\" width=\"30\" heigth=\"30\">");
              } 
            }   
          } 
        }
        var toAppend = "";
        if ( messages[j].sender !== personal.username ){			
          toAppend = "<div class=\"incoming_msg\" id=\"incoming_msg\">"+
                    "<div class=\"received_msg\">" +
                    "<div class=\"received_withd_msg\" id=\"addOtherMessages\">"+
                    mesgToAdd + "<span id=\"userName\" class=\"badge badge-secondary\">"+messages[j].sender+"</span>\n"+
                    "<span id=\"dateMessage\" class=\"badge badge-secondary\">" + dateToAdd +"</span>"+
                    "</div></div></div>";
          newChat += toAppend;
        }else{  
          toAppend = "<div class=\"outgoing_msg\" id=\"outgoing_msg\">"+
                    "<div class=\"sent_msg\" id=\"addOurMessages\">" +
                    mesgToAdd + "<span id=\"userName\" class=\"badge badge-secondary\">"+messages[j].sender+"</span>\n"+
                    "<span id=\"dateMessage\" class=\"badge badge-secondary\">" + dateToAdd +"</span>"+
                    "</div></div>";
          newChat += toAppend;   
        }
      }
      if(this.currentUrlFile === myUrlFile){
        if(newChat.length > this.chatShowed.length){
          if(!testing){
              $("#addMessages").append(newChat.replace(this.chatShowed, ""));
          }
          this.chatShowed = newChat;
        }
      }
      else{
        this.currentUrlFile = myUrlFile;
        this.chatShowed = newChat;
        if(!testing){
            $("#addMessages").empty();
            $("#addMessages").append(newChat);    
        } 
        
      }
    }, err => {
      if(!testing){    
        $("#addMessages").empty();
      }
      if(err.includes("403")){ console.log("You have been removed from this group")}else if(err.includes("404")){ console.log("This group has been deleted");this.clearMessages();} else{console.log(err);}});
  }

  clearMessages(){
    this.currentUrlFile = "";
    this.chatShowed = "";
    this.chatSelected = "";
  }

   /**
  * Loads messages into the inbox
  */
  async checkForNotifications(group, nm){
    var lastDate = "";
    var dateRead = "";
    var lastMessage = "";
    fc.readFile(group.file.url).then((body) => {
      var res = body.split("\n\n\n");
      //res[1] => GROUP INFO
      dateRead = res[1].split("schem:dateRead")[1].split('"')[1];
      fc.readFile(group.urlCore).then((body) => {
        var res = body.split("\n\n\n");
        //res[>=2] => MENSAJES (MXXXX)
        var i;
        for(i=2; i<res.length; i++){
          var lines = res[i].split("\n");
          if(lines.length === 4){
            //Get Time
            lastDate = lines[1].split("\"")[1];
            var sender = lines[2].split("\"")[1];
            var aux = lines[3].split("\t\"")[1];
            lastMessage = aux.replace("\"\t.", "");
            
          }   
        }
        lastMessage = this.encryptor.decrypt(lastMessage);
        if(dateRead !== ""){
          if(lastDate > dateRead){
            nm.addNotification({"name": group.name, "sender": sender, "msg": lastMessage, "type": "group"});
          }
        }    
      }, () => {});
    }, () => {});
  }

  /**
  * This method sends a message to a friend
  * Returns an error message if I can not send the message to the user
  */
  async sendMessage(personal, receiver, core, message) {
    message = this.encryptor.encrypt(message);  
    var myUrlFile = receiver;
    try {
      this.sendMessageToGroup(personal, myUrlFile, message); 
    } catch (e) {
      core.logger.error("Could not send message to the group.");
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

    var messageUrl = "M"+this.randomString(6);  //RANDOM ID (alphanumeric)
	  var tzoffset = (new Date()).getTimezoneOffset() * 60000;  //offset in milliseconds
    var time = (new Date(Date.now()-tzoffset)).toISOString().slice(0, -1);
    var messageTx = message;
      
    fc.readFile(urlCore).then((success) => {
      var newText = '\n\n\n:'+messageUrl+' a \t\tschem:Message;\n'+'\tschem:dateSent\t\"'+time+'\";\n'+
        '\tschem:givenName\t\"'+personal.username+'\";\n'+ '\tschem:text\t"'+messageTx+'"\t.';
      var body = success + newText;
      fc.updateFile(urlCore, body).then((success) => { /*console.log( "Message sent to group.")*/ }, (err) => {console.log(err);});}, err => console.log(err) );
  }

  /**
  * This method sends an invitation to an user
  * @param receiver is the user who recives the invitation
  */
  sendFirstMessage(personal, receiver, rand, groupName){
    var urlCore = personal.inbox + "groupcore_"+rand+".ttl";
    var urlFile = receiver.inbox + "group_"+rand+".ttl";
    var dateTimeZero = "2002-05-30T09:00:00";

    var header = "@prefix : <#>.\n@prefix stor: <http://example.org/storage/>.\n@prefix schem: <http://schema.org/>.\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .";
    var body = ":CHAT\n\tstor:storeIn <"+urlCore+">;\n\tschem:name \""+groupName+"\";\n\tschem:dateRead \""+dateTimeZero+"\"^^xsd:dateTime .";

    fc.updateFile(urlFile, header + "\n\n\n" + body).then(() => {/*console.log("Create group file in other POD");*/}, err => console.log(err) );
  }

  createCoreFile(personal, rand, groupName, friendsGroup){
    var urlCore = personal.inbox + "groupcore_"+rand+".ttl";
    var header = "@prefix : <#>.\n@prefix stor: <http://example.org/storage/>.\n@prefix schem: <http://schema.org/>.\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .";
    var body = ":GROUP\n\tschem:name \""+groupName+"\" .";

    fc.updateFile(urlCore, header + "\n\n\n" + body).then(() => {/*console.log("Create group file in other POD");*/ }, (err) => {console.log(err);});

    fc.updateFile(urlCore + ".acl", this.templatePermission(friendsGroup, "groupcore_" + rand+ ".ttl")).then( () => {this.alerts.alertGroupCreated(groupName); this.addNewGroupCreated(personal,rand,groupName);}, err => console.log(err));
  }

  addNewGroupCreated(personal,rand,groupName){
    personal.groupsLoaded.push({"file": {"url":personal.inbox + "group_"+rand+".ttl"} , "name": groupName, "type": "group", "urlCore": personal.inbox + "groupcore_"+rand+".ttl"});
    personal.myInbox.push({"name": "group_"+rand+".ttl", "url": personal.inbox + "group_"+rand+".ttl"});
    personal.myInbox.push({"name": "groupcore_"+rand+".ttl", "url": personal.inbox + "groupcore_"+rand+".ttl"});
    $("#new-btn").click();
  }


  templatePermission(friends, file){
    var header = "@prefix : <#>.\n"+"@prefix n0: <http://www.w3.org/ns/auth/acl#>.\n"+
                  "@prefix n1: <http://xmlns.com/foaf/0.1/>.\n"+ "@prefix c: </profile/card#>.\n";
    var i = 0;
    for(let friend of friends){
      header += "@prefix c"+i+": <"+this.cardButNotMe(friend)+">.\n";
      i++;
    }
    header += "\n:ControlReadWrite\n"+  "\ta n0:Authorization;\n"+
              "\tn0:accessTo <"+file+">;\n"+"\tn0:agent c:me;\n"+
              "\tn0:mode n0:Control, n0:Read, n0:Write.\n"+":ReadWrite\n"+
              "\ta n0:Authorization;\n"+"\tn0:accessTo <"+file+">;\n"+
              "\tn0:agent ";
    for(var j=0; j<i; j++){
      header += "c" + j + ":me";
      if(j+1 === i){
        header += ";\n";
      } 
      else{
        header += ", ";
      }
    }
    header += "\tn0:mode n0:Read, n0:Write.\n";
    return header;
  }

  readChatGroups(personal){
    var chatGroups = new Array();
    fc.readFolder(personal.inbox).then(folder => {
      for(let file of folder.files){  
        if(file.name.includes("group_")){
          chatGroups.push(file);
        }
      }
    }, err => console.log(err) );
    return chatGroups;
  }
    
    
  getDataSync(){
      return this.dataSync;
  }
  
  getEncryptor(){
      return this.encryptor;
  }
  
  getFetch(){
      return this.fetch;
  }
  
  getEmojisEnabled(){
      return this.emojisEnabled;
  }
  getAlerts(){
      return this.alerts;
  }
  
  getCurrentUrlFile(){
      return this.currentUrlFile;
  }    
  
  getChatShowed(){
      return this.chatShowed;
  }

}
module.exports = GroupCommunication;
