const fc = require('solid-file-client');
const DataSync = require('./datasync');

class Personal {
  constructor(core) {
    this.core = core;
    this.friendList = new Array();
    this.userWebId = null;
    this.dataSync = new DataSync(fetch);
  };

  async loadNames(userWebId){
    // Para sacar el username
    this.userWebId = userWebId;
    this.username = await this.core.getUsername(userWebId);    
    // Para sacar el nombre
    //this.name = await this.core.getFormattedName(userWebId);
    return this.username;
  }

  async loadFriendList(userWebId){
    if(this.friendList.length == 0){
      fc.fetchAndParse( userWebId ).then( store => {
        this.searchFriendsOnList(store.statements);
      }, err => console.log("could not fetch : "+err) ) ;
    } 
  }

  async loadInbox(){
    this.myInbox = new Array();
    fc.readFolder("https://"+this.username+".solid.community/inbox/").then(folder => {
      for(let file of folder.files)
        this.myInbox.push(file.name);
      this.loadGroupNames();
    }, err => console.log(err) );
  }

  async loadGroupNames(){
    this.groupsLoaded = new Array();
    var chatID = new Array();
    for(let file of this.myInbox){
      if(file.includes("group_")){
        chatID.push(file);
      }
    }
    var aux = null;
    for await(let id of chatID){
      fc.readFile("https://"+this.username+".solid.community/inbox/"+id).then(body => {
        aux = body.split("\n");
        for(var i=0; i<aux.length; i++){
          if(aux[i].includes("schem:name")){
            var name = aux[i].replace('\tschem:name "', "");
            name = name.replace('";', "");
          }
        }
        this.groupsLoaded.push({"id": id, "name": name})
      })
    }
  }

  getGroupNameByID(id){
    for(var group of this.groupsLoaded){
      if(group.id.includes(id)){
        return group.name;
      }
    }
    return id;
  }

  getGroupByID(id){
    for(var group of this.groupsLoaded){
      if(group.id.includes(id)){
        return group;
      }
    }
    return null;
  }

  clearInfo(){
    this.friendList = new Array();
    this.username = null;
  }

  async clearInbox(dataSync){
    fc.readFolder("https://"+this.username+".solid.community/inbox/").then(folder => {
      for(let file of folder.files)
        dataSync.deleteFileForUser(file.url);
      console.log("Your inbox has been cleared");
    }, err => console.log("Your inbox cant be cleared") );
  }

  /**
  * This method search friends of the user's list
  * @param possibleList is the list of friends of the user
  */
  async searchFriendsOnList(possibleList) {
    for(var i=0; i<possibleList.length; i++){
      if(this.core.isFriend(possibleList[i].object.value, this.username))
        this.friendList.push({username: this.core.getUsername(possibleList[i].object.value), 
                        //name: await this.core.getFormattedName(possibleList[i].object.value),
                        inbox: "https://"+this.core.getUsername(possibleList[i].object.value)+".solid.community/inbox/",
                        webId: "https://"+this.core.getUsername(possibleList[i].object.value)+".solid.community/profile/card#me"});
    }
  };

  
}


module.exports = Personal;
