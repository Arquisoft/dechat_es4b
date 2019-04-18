const fc = require("solid-file-client");
const DataSync = require("./datasync");
//const rdfjsSourceFromUrl = require("./rdfjssourcefactory").fromUrl;
const Message = require("../src/message.js");

class PrivateCommunication {
  constructor(fetch) {
    this.dataSync = new DataSync(fetch);
    this.fetch = fetch;
    this.emojisEnabled = true;
    this.messageToAdd = "";
    this.datesRead = new Array();
    this.chatShowed = "";
    this.chatSelected = "";
  };

  /**
  * Loads messages into the inbox
  */
  async loadMessages(personal, other, testing){
    var messages = new Array(); 	//here will be stored all messages loaded
    // Let's read each message file

    var fileWithMessagesSentByMe = personal.inbox + other.username + ".ttl";
    var fileWithMessagesSentByTheOtherUSer =  other.inbox + personal.username + ".ttl";
	
    var me = personal.username;
    var myMsgRead = false;
    var noFileForMe = false;


    fc.readFile(fileWithMessagesSentByMe).then((body) => {
      var res = body.split("\n\n\n");
      //res[1] => CHAT INFO
      var chat = res[1];
      var dateRead = chat.split("\"")[1];
      //res[>=2] => MENSAJES (MXXXX)
      for(var i=2; i<res.length; i++){
        var lines = res[i].split("\n");
        //Get ID
        var temp = lines[0].split(" a ")[0];
        temp = temp.replace(":", "");
        //Get Time
        var dateTime = lines[1].split("\"")[1];
        //Get Sender
        var sender = lines[2].split("\"")[1];
        me = sender;
        //Get Message
        var aux = lines[3].split("\t\"")[1];
        var message = aux.replace("\"\t.", "");
        //console.log(temp, dateTime, sender, message);
        messages.push(new Message(sender,dateTime,message));
      }
      myMsgRead = true;
      // Modify last time read
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      var t = new Date(Date.now() - tzoffset);
      t.setSeconds(t.getSeconds() + 6);
      var time = t.toISOString().slice(0, -1);
      var newBody = body.replace(dateRead, time);
      this.changeDateRead({"other":other.username, "lastDate": time});
      fc.updateFile(fileWithMessagesSentByMe, newBody + this.messageToAdd).then(() => {this.messageToAdd = "";}, () => {});
    }, () => {noFileForMe = true;});

    fc.readFile(fileWithMessagesSentByTheOtherUSer).then((body) => {
     var res = body.split("\n\n\n");
     //res[>=2] => MENSAJES (MXXXX)
     for(var i=2; i<res.length; i++){
      var lines = res[i].split("\n");
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
     
     //console.log(messages);
     if(!myMsgRead){
      var that = this;
      setTimeout(function(){
        that.orderAndShow(messages, other, me, testing);
      }, 1000);
     }else {
       this.orderAndShow(messages, other, me, testing);
     }
    }, (err) => {
      if(!testing){
        if(noFileForMe){
          $("#addMessages").empty();
        }
        var that = this;
        setTimeout(function(){that.orderAndShow(messages, other, me,testing);}, 500);
        if(err.includes("403")){ /* Friend dont answer */} else if(err.includes("404")){console.log("No file to read");} else{console.log(err);}
      }
    }); 
  }
  
  orderAndShow(messages, other, me,testing){
    //Now order the messages
		messages.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.dateTime) - new Date(a.dateTime);
    });
    if(!testing){
		//console.log(messages);
    }
    this.showMessages(messages, other, me,testing);
  }

  showMessages(messages, other, me, testing){
    var newChat = "";
    for(var i=messages.length-1; i>=0; i--){
      var mesg = messages[i].content;
      var mesgToAdd = "";
      var year = messages[i].dateTime.split("-")[0];
      var month = messages[i].dateTime.split("-")[1];
      var day = messages[i].dateTime.split("-")[2].split("T")[0];
      var hourMinute = messages[i].dateTime.split("T")[1];
      var hour = hourMinute.split(":")[0];
      var minute = hourMinute.split(":")[1];
      var dateToAdd = year + "-" + month + "-" + day + " - " + hour + ":" + minute;
      var format = mesg.split(".");
      if (format[format.length-1] === "jpg" || format[format.length-1] === "gif" || format[format.length-1] === "png" || mesg.startsWith("data:image")){
        mesgToAdd = "<p><img src='" + mesg + "'></p>";
      }else if(mesg.startsWith("data:application/octet-stream;base64")){
        mesgToAdd = "<p><audio controls=\"controls\" autobuffer=\"autobuffer\">"+
                    "<source src=\""+mesg+"\"/></audio></p>";
      }else{
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
      if(i === messages.length-1 && !testing){ /*$("#addMessages").empty();*/}    //PA QUE ERA ESTO????
      if ( messages[i].sender !== me ){			
        var toAppend = "<div class=\"incoming_msg\" id=\"incoming_msg\">"+
                        "<div class=\"received_msg\">" +
                        "<div class=\"received_withd_msg\" id=\"addOtherMessages\">"+
                        mesgToAdd + "<span id=\"userName\" class=\"badge badge-secondary\">"+messages[i].sender+"</span>\n"+
                        "<span id=\"dateMessage\" class=\"badge badge-secondary\">" + dateToAdd +"</span>"+
                        "</div></div></div>";
        newChat += toAppend;
      }else{
        //console.log(messages[i].content + " en " + messages[i].sender);    
        var toAppend = "<div class=\"outgoing_msg\" id=\"outgoing_msg\">"+								
                    "<div class=\"sent_msg\" id=\"addOurMessages\">"+
                    mesgToAdd + "<span id=\"userName\" class=\"badge badge-secondary\">"+messages[i].sender+"</span>\n"+
					          "<span id=\"dateMessage\" class=\"badge badge-secondary\">" + dateToAdd +"</span>"+
                    "</div></div>";
          newChat += toAppend;
      }
    }
    if(this.chatSelected === other.username){
      if(newChat.length > this.chatShowed.length){
        $("#addMessages").append(newChat.replace(this.chatShowed, ""));
        this.chatShowed = newChat;
      }
    }
    else{
      this.chatSelected = other.username;
      this.chatShowed = newChat;
      $("#addMessages").empty();
      $("#addMessages").append(newChat);
    }

  }

  getTrueEmojis(text){
    var ret = new Array();
    var first = ["blush", "eyebrow", "facehearts", "hearteyes", "hugging", "kissing", "laughing",
                  "neutral", "nomouth", "openmouth", "persevere", "rofl", "rolling", "sleeping", 
                  "smile", "smiley", "smirk", "stareyes", "sunglasses", "sweatsmile", "thinking",
                  "wink", "yum", "zipper"];
    for(var f of first){
      if(text.includes(":"+f+":")){
        ret.push(f);
      }
    }
    return ret;
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
  async sendMessage(personal, receiver, core, message) {
    if(await this.communicationEstablished(personal, receiver)){
      this.sendMessageToPod(personal, receiver,message);
    }
    else{
      try {
        this.sendFirstMessage(personal, receiver,message);    
      } catch (e) {
        core.logger.error("Could not send message to the user.");
        core.logger.error(e);
      }   
    }
  }


    /**
  * This method sends an invitation to an user
  * @param receiver is the user who recives the invitation
  */
  sendFirstMessage(personal, receiver,message){
    var myUrlFile = personal.inbox + receiver.username + ".ttl";
    var otherUrlFile = receiver.inbox + personal.username + ".ttl";
    var dateTimeZero = "2002-05-30T09:00:00";

    var header = "@prefix : <#>.\n@prefix stor: <http://example.org/storage/>.\n@prefix schem: <http://schema.org/>.\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .";

    var myBody = ":CHAT\n\tstor:storeIn <"+otherUrlFile+">;\n\tschem:dateRead \""+dateTimeZero+"\"^^xsd:dateTime .";
    var otherBody = ":CHAT\n\tstor:storeIn <"+myUrlFile+">;\n\tschem:dateRead \""+dateTimeZero+"\"^^xsd:dateTime .";

    fc.readFile(otherUrlFile).then(() => {
    }, (err) => {
      if(err.includes("403")){  //No permissions (No answers yet)
      }
      else if(err.includes("404")){ //Not found = Not created
        fc.updateFile(otherUrlFile, header + "\n\n\n" + otherBody).then(() => {
          //console.log("Create conversation file in other POD");
        }, err => console.log(err) );
      }
    });

    fc.readFile(myUrlFile).then(() => {
      this.sendMessageToPod(personal, receiver,message); 
    }, (err) => {
      if(err.includes("404")){ //Not found = Not created
        fc.updateFile(myUrlFile, header + "\n\n\n" + myBody).then( success => {
          //console.log("Create conversation file in my POD");
          this.sendMessageToPod(personal, receiver, message); 
        }, err => console.log(err) );
      }
    });

    fc.updateFile(myUrlFile + ".acl", this.templatePermission(receiver, receiver.username + ".ttl")).then( success => {
      //console.log("Gave permission to my friend")
    }, err => console.log(err) );

}




  /**
  * Sends a message to the Pod of the user
  * @param receiver is the person who recives message
  */
  async sendMessageToPod(personal, receiver, message){
    var messageUrl = "M"+this.randomString(6); //RANDOM ID (alphanumeric)
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
	  var time = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
	  var messageTx = message;

    this.messageToAdd += "\n\n\n:"+messageUrl+" a \t\tschem:Message;\n"+
                          "\tschem:dateSent\t\""+time+"\";\n"+
                          "\tschem:givenName\t\""+personal.username+"\";\n"+
                          "\tschem:text\t\""+messageTx+"\"\t.";

    await this.loadMessages(personal,receiver,false);
  }


  /**
  * Loads messages into the inbox
  */
  async checkForNotifications(personal, other, nm){	  
    var dateRead = "";
    var fileWithMessagesSentByMe = personal.inbox + other.username + ".ttl";
    var fileWithMessagesSentByTheOtherUser =  other.inbox + personal.username + ".ttl";

    var lastDateRead = this.getDateRead(other.username);
    if(lastDateRead !== null){
      this.checkHisLastMessage(fileWithMessagesSentByTheOtherUser, other, lastDateRead, nm, personal);
    }
    else{
      fc.readFile(fileWithMessagesSentByMe).then((body) => {
        var res = body.split("\n\n\n");
        //res[1] => CHAT INFO
        var chat = res[1];
        dateRead = chat.split("\"")[1];
        this.addNewDateRead({"other": other.username, "lastDate": dateRead});
        console.log(this.datesRead)
        this.checkHisLastMessage(fileWithMessagesSentByTheOtherUser, other, dateRead, nm, personal);
      }, () => {this.checkHisLastMessage(fileWithMessagesSentByTheOtherUser, other, "NEVER", nm, personal);});   
    }
  }

  addNewDateRead(newDate){
    for(var date of this.datesRead){
      if(date.other === newDate.other){
        date.lastDate = newDate.lastDate;
        return;
      }
    }
    this.datesRead.push(newDate);
  }

  getDateRead(other){
    for(var date of this.datesRead){
      if(date.other  === other){
        return date.lastDate;
      }
    }
    return null;
  }

  changeDateRead(newDate){
    for(var date of this.datesRead){
      if(date.other === newDate.other){
        date.lastDate = newDate.lastDate;
      }
    }
  }

  checkHisLastMessage(fileWithMessagesSentByTheOtherUser, other, dateRead, nm, personal){
    var lastMessage = "";
    fc.readFile(fileWithMessagesSentByTheOtherUser).then( body => {
      var res = body.split("\n\n\n");
      //res[>=2] => MENSAJES (MXXXX)
      for(var i=2; i<res.length; i++){
        var lines = res[i].split("\n");
        //Get Time
        var dateLastMsg = lines[1].split('"')[1];
        //Get Message
        var aux = lines[3].split('\t"')[1];
        lastMessage = aux.replace('"\t.', "");
      }
      if(dateRead !== "" && lastMessage !== ""){
        if((dateRead === "NEVER" && !personal.fileExists(other.username)) || 
                                                            dateLastMsg > dateRead){
          nm.addNotification({"name": other.username, "msg": lastMessage, "type": "private"});
        }
      }   
    }, err => {}); 
  }



  /**
  * Give permissions to an user over an especific inbox
  * @param myInbox the inbox of the user
  * @param receiver is the person who recives messages
  */
  givePermission(myInbox, receiver){
    fc.updateFile(myInbox + receiver.username + ".ttl.acl", 
                  this.templatePermission(receiver, receiver.username+".ttl")).then( success => {/*console.log( `Permissions changed in your file.`)*/}, err => console.log(err));
  };

  templatePermission(other, file){
    var textPer = "@prefix : <#>.\n"+
                  "@prefix n0: <http://www.w3.org/ns/auth/acl#>.\n"+
                  "@prefix n1: <http://xmlns.com/foaf/0.1/>.\n"+
                  "@prefix c: </profile/card#>.\n"+
                  "@prefix c0: <"+this.cardButNotMe(other)+">.\n\n"+
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

  cardButNotMe(other){
    return other.webId.split("#")[0] + "#";
  }

  /**
  * Establish the communication with a receiver
  * @param receiver is the person who recives messages
  */
  async communicationEstablished(personal, receiver){
    var exists = true;
    await fc.readFile(personal.inbox+receiver.username+".ttl").then( () => {}, () => {exists = false;} );
    await fc.readFile(receiver.inbox+personal.username+".ttl").then( ()=> {}, () => {exists = false;} );
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
