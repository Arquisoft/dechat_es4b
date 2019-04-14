const fc = require("solid-file-client");

class Personal {
  constructor(core) {
    this.core = core;
    this.friendList = new Array();
    this.userWebId = null;
    this.groupsLoaded = new Array();
  };

  async loadNames(userWebId){
    // Para sacar el username
    this.userWebId = userWebId;
    this.username = this.core.getUsername(userWebId);  
    this.inbox = this.core.getInbox(userWebId);  
    // Para sacar el nombre
    //this.name = await this.core.getFormattedName(userWebId);
    return this.username;
  }

  async reloadFriendList(){
    this.friendList = new Array();
    this.loadFriendList();
  }

  async loadFriendList(){
    if(this.friendList.length === 0){
      fc.fetchAndParse(this.userWebId ).then( store => {
        this.searchFriendsOnList(store.statements);
      }, err => console.log("could not fetch : "+err) ) ;
    } 
    console.log("CARGADOS");
  }

  async loadInbox(){
    this.myInbox = new Array();
    fc.readFolder(this.inbox).then(folder => {
      for(let file of folder.files)
        this.myInbox.push(file);
      this.loadGroupNames();
    }, err => console.log(err) );
  }

  async loadGroupNames(){
    this.groupsLoaded = new Array();
    var chatFile = new Array();
    for(let file of this.myInbox){
      if(file.name.includes("group_")){
        chatFile.push(file);
      }
    }
    var aux = null;
    for await(let chat of chatFile){
      fc.readFile(chat.url).then(body => {
        aux = body.split("\n");
        for(var i=0; i<aux.length; i++){
          if(aux[i].includes("schem:name")){
            var name = aux[i].replace('\tschem:name "', "");
            name = name.replace('";', "");
          }
          if(aux[i].includes("stor:storeIn")){
            var urlRemote = aux[i].split("<")[1];
            urlRemote = urlRemote.split(">")[0];
          }
        }
        this.groupsLoaded.push({"file": chat, "name": name, "type": "group", "urlCore": urlRemote});
      })
    }
  }
  getGroupByID(id){
    for(var group of this.groupsLoaded){
      if(group.file.url.includes(id)){return group;}
    }
    return null;
  }

  getGroupByMyUrl(url){
    for(var group of this.groupsLoaded){
      if(group.file.url === url){ return group;}
    }
    return null;
  }

  clearInfo(){
    this.friendList = new Array();
    this.username = null;
  }

  async clearInbox(dataSync, labels){
    var i = 0;
    for(var label of labels) {
      dataSync.deleteFileForUser(this.inbox + label);
      i++;
    }
    return i;
  }

  /* WARNING
  async clearInbox(dataSync){
    fc.readFolder(this.inbox).then(folder => {
      for(let file of folder.files) {
        dataSync.deleteFileForUser(file.url);
	  }
      console.log("Your inbox has been cleared");
    }, err => console.log("Your inbox cant be cleared") );
  }
  */

  /**
  * This method search friends of the user's list
  * @param possibleList is the list of friends of the user
  */
  async searchFriendsOnList(possibleList) {
    for(var i=0; i<possibleList.length; i++){
      if(this.core.isFriend(possibleList[i].object.value, this.username))
        this.friendList.push({username: this.core.getUsername(possibleList[i].object.value), 
                        //name: await this.core.getFormattedName(possibleList[i].object.value),
                        inbox: this.core.getInbox(possibleList[i].object.value),
                        webId: possibleList[i].object.value});
    }
  }
  

  fileExists(otherName){
    for(var file of this.myInbox){
      if(file.label.includes(otherName + ".ttl")){
        return true
      } 
    }
    return false;
  }

  //Getters and setters
  
  getWebIdUrl(){
	  return this.userWebId;
  }
  getCore(){
	  return this.core;
  }
  getFriendList(){
	  return this.friendList;
  }

  getAllGroups(){
    return this.groupsLoaded;
  }

  getAllInfoFromUsername(username){
    for(var f of this.friendList){
      if(f.username === username)
        return f;
    }
    return null;
  }
  
}



module.exports = Personal;
