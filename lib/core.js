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
    var rand = this.randomString(6);
    for(let friend of friendsGroup){
      this.commGroup.sendFirstMessage(personal, friend, rand, groupName);
    }
    this.commGroup.sendFirstMessage(personal, personal, rand, groupName);
    this.commGroup.createCoreFile(personal, rand, groupName, friendsGroup);

    personal.loadInbox();
  }

  /**
   * COMMUNICATION METHODS
   */

  async storePhoto(personal,file){
		console.log("Now here " + file.name);
		var a = $("#possible-people option:selected").val();
		var receiver = this.getFriendOfList(personal.friendList, a);
		// Group chat
		if(receiver == null){
			//this.commGroup.sendMessage(personal, this);
			// TODO
		} else{ // Private chat
			this.commPrivate.sendPhoto(personal, this, file);
		}
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

  async loadMessages(personal, a,testing){
    if(a == null)
      return;
    var receiver = this.getFriendOfList(personal.friendList, a);
    // Group chat
    if(receiver == null){
      this.commGroup.loadMessages(personal, a,false);
    } else{ // Private chat
      var other = personal.getAllInfoFromUsername(a);
      this.commPrivate.loadMessages(personal, other, false);
    }
  }

  async getChatGroups(personal){
    var chatNames = new Array();
    var aux = "";
    for(let file of personal.myInbox){
      if(file.name.includes("group_")){
        aux = file.name.replace("group_", "");
        aux = aux.replace(".ttl", "");
        chatNames.push(personal.getGroupByID(aux));
      }
    }
    return chatNames;
  }

  async getChatName(chatRand){
    return chatRand;
  }

  async addFriend(personal, friendToAdd){
    this.mf.addFriend(personal, friendToAdd);
  }

  changeStateOfEmojis(newState){
    this.commGroup.emojisEnabled = newState;
    this.commPrivate.emojisEnabled = newState;
  }

  /**
   * This method returns the inbox of a WebId.
   * @param {string} webId: the WebId for which to find the inbox
   * @returns {Promise}: a promise that resolves with the inbox found via the WebId.
   */
  /*
  async getInboxUrl(webId) {
    if (!this.inboxUrls[webId]) {
      this.inboxUrls[webId] = (await this.getObjectFromPredicateForResource(webId, namespaces.ldp + 'inbox')).value;
    }
    return this.inboxUrls[webId];
  }
  */

  /**
   * This method returns a formatted name for a WebId.
   * @param webid: the WebId for which a formatted name needs to be created.
   * @returns {Promise<string|null>}: a promise that resolvew with the formatted name (string) or
   * null if no name details were found.
   */
  // async getFormattedName(webid) {
    // let formattedName = await this.getObjectFromPredicateForResource(webid, namespaces.foaf + 'name');

    // if (!formattedName) {
      // formattedName = null;
      // const firstname = await this.getObjectFromPredicateForResource(webid, namespaces.foaf + 'givenName');
      // const lastname = await this.getObjectFromPredicateForResource(webid, namespaces.foaf + 'lastName');

      // if (firstname) {
        // formattedName = firstname;
      // }

      // if (lastname) {
        // if (formattedName) {
          // formattedName += ' ';
        // } else {
          // formattedName = '';
        // }

        // formattedName += lastname;
      // }

      // if (!formattedName) {
        // formattedName = webid;
      // }
    // } else {
      // formattedName = formattedName.value;
    // }

    // return formattedName;
  // }

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
      this.getUsername(text);
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

  /**
   * This method returns the object of resource via a predicate.
   * @param url: the url of the resource.
   * @param predicate: the predicate for which to look.
   * @returns {Promise}: a promise that resolves with the object or null if none is found.
   */
  /*
  async getObjectFromPredicateForResource(url, predicate) {
    const deferred = Q.defer();
    const rdfjsSource = await rdfjsSourceFromUrl(url, this.fetch);
    if (rdfjsSource) {
      const engine = newEngine();
      engine.query(`SELECT ?o {<${url}> <${predicate}> ?o.}`,
        {sources: [{type: 'rdfjsSource', value: rdfjsSource}]})
        .then(function (result) {
          result.bindingsStream.on('data', function (data) {data = data.toObject();
			deferred.resolve(data['?o']);
          });
          result.bindingsStream.on('end', function () {deferred.resolve(null);});
        });
      } else {
        deferred.resolve(null);
      }
      return deferred.promise;
  };
  */
 
  randomString(length) {
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
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
