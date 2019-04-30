const winston = require("winston");
//const rdfjsSourceFromUrl = require("./rdfjssourcefactory").fromUrl;

const PrivateCommunication = require("../lib/commprivate");
const GroupCommunication = require("../lib/commgroup");
const ManageFriends = require("../lib/friends");

class ChatCore {

  constructor(fetch) {
    this.inboxUrls = {};
    this.fetch = fetch;
    this.alreadyCheckedResources = [];
    this.logger = winston.createLogger({
      level: 'error',
      transports: [
        new winston.transports.Console(),
      ],
      format: winston.format.cli()
    });
    this.commGroup = new GroupCommunication(fetch);
    this.commPrivate = new PrivateCommunication(fetch);
    this.mf = new ManageFriends();
  };

  /**
   * CREATE GROUP
   */

  async createGroup(personal, friendsGroup) {
    var groupName = $('#group-name').val();
    var rand =  this.commGroup.randomString(6);
    for(let friend of friendsGroup){
      this.commGroup.sendFirstMessage(personal, friend, rand, groupName);
    }
    this.commGroup.sendFirstMessage(personal, personal, rand, groupName);
    this.commGroup.createCoreFile(personal, rand, groupName, friendsGroup);
  }

  /**
   * COMMUNICATION METHODS
   */

  async storePhoto(personal,receiver) {	
		var message = $("#data-name").val();
		$("#data-name").val("");
		this.sendMessage(personal,receiver,message);
  }

  async sendMessage(personal, a, message) {
    if(message.length === 0)
      return;
    var receiver = this.getFriendOfList(personal.friendList, a);
    // Group chat
    if(receiver == null){
      this.commGroup.sendMessage(personal, a, this, message);
    } else{ // Private chat
      this.commPrivate.sendMessage(personal, receiver, this, message);
    }
  }

  async loadMessages(personal, a, nm, testing){
    if(a == null)
      return;
    var receiver = this.getFriendOfList(personal.friendList, a);
    // Group chat
    if(receiver == null){
      this.commGroup.loadMessages(personal, a,false);
      nm.hideGroupNotification(personal.getGroupByMyUrl(a));
    } else{ // Private chat
      var other = personal.getAllInfoFromUsername(a);
      this.commPrivate.loadMessages(personal, other, false);
      nm.hidePrivateNotification(other);
    }
  }

  async getChatGroups(personal){
    var chatNames = new Array();
    var aux = "";
    var group;
    for(let file of personal.myInbox){
      if(file.name.includes("group_")){
        aux = file.name.replace("group_", "");
        aux = aux.replace(".ttl", "");
        group = personal.getGroupByID(aux);
        if(group !== null){
          chatNames.push(group);
        }
      }
    }
    return chatNames;
  }

  async getChatName(chatRand){
    return chatRand;
  }

  async addFriend(personal, friendToAdd){
    this.mf.addFriend(personal, friendToAdd, this);
  }

  changeStateOfEmojis(newState){
    this.commGroup.emojisEnabled = newState;
    this.commPrivate.emojisEnabled = newState;
  }

  async checkForNotifications(personal, nm){
    for(var friend of personal.friendList){
      await this.commPrivate.checkForNotifications(personal, friend, nm);
    }
    for(var group of personal.groupsLoaded) {
      await this.commGroup.checkForNotifications(group, nm);  
    }
  }


  /**
   * 
   * 
   * UTILITY METHODS
   * 
   * 
   */
  getUsername(text) {
    var array = text.split(".");
    var another = array[0].split("/")
    var username = another[another.length-1]
    return username;
  }

  checkNotMe(text, myUser) {
    if(text.includes("card") && !text.includes(myUser))
      return true;
    return false;
  }

  isFriend(text, myUser){
    try{
      if(this.checkNotMe(text, myUser)) return true;
      return false;
    } catch (TypeError){
      return false;
    }
  }

  getFriendOfList(friendList, expected){
    for(var i=0; i<friendList.length; i++){
      if(friendList[i].username === expected) {
        return friendList[i];
	  }
    }
    return null;
  }

  getInbox(userWebId){
    var company = "";
    if(userWebId.includes("solid.community")){
      company = "solid.community";
    }
    else if(userWebId.includes("inrupt.net")){
      company = "inrupt.net";
    }
    return "https://"+this.getUsername(userWebId)+"."+company+"/inbox/";
  }


  // Getters and setters
  getInboxUrls(){
	  return this.inboxUrls;
  }
  getFetch(){
	  return this.fetch;
  }
  getAlreadyCheckedResources(){
	  return this.alreadyCheckedResources;
  } 
  getGroupCommunication(){ 
	  return this.commGroup;
  }
  getPrivateCommunication(){
	  return this.commPrivate;
  }
  
}

module.exports = ChatCore;
