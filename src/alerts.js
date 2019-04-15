class Alerts {

  constructor() {
    
  }

  clickById(id){
    $("#"+id).click();
  }

  alertMessageReceived(title, message){
    this.generalTemplate("success", "div-message-"+title, "message-"+title, "New message!", title, message, 0);
  }

  /**
  *   REMOVE FROM INBOX
  */

  alertCountRemovedFromInbox(i){
    this.generalTemplate("info", "div-clear-inbox", "clear-inbox", i+" files removed from inbox!", "", "", 3000);
  }

  /**
  *   CREATE GROUP
  */

  alertGroupCreated(name){
    this.generalTemplate("info", "div-created-group-"+name, "created-group-"+name, "Group created!", name, "", 3000);
  }

  errorGroupCreated(title, subtitle){
    var rand = this.randomId(3);
    this.generalTemplate("danger", "error-group-"+rand, "error-group-"+rand, title, subtitle, "", 3000);
  }

  /**
  *   ADDING FRIEND
  */

  alertNewFriendAdded(name){
    this.generalTemplate("info", "div-new-friend-"+name, "new-friend-"+name, "New friend added!", name, "", 3000);
  }

  errorFriendExisted(name){
    this.generalTemplate("danger", "div-error1-friend-"+name, "error1-friend-"+name, "This user was in your friends list", name, "", 3000);
  }

  errorNewFriendDontExist(name){
    this.generalTemplate("danger", "div-error2-friend-"+name, "error2-friend-"+name, "Can't find this profile", name, "", 3000);
  }

  errorNewFriendFormat(){
    this.generalTemplate("danger", "div-error3-friend-"+name, "error3-friend-"+name, "Incorrect format", "url has to be:", "(...profile/card#me)", 3000);
  }

  errorNeedAFriend(){
    this.generalTemplate("danger", "div-error-no-friends", "error-no-friends", "Error adding friend", "You need at least a friend added", "Add it through your solid POD", 3000);
  }

  /**
   *    OTHERS
   */

  alertGroupCoreRemoved(name){
    this.generalTemplate("danger", "div-danger-core-removed-"+name, "danger-core-removed-"+name, "Group has been removed!", name, "", 0);
  }

  alertExpelledFromGroup(name){
    this.generalTemplate("danger", "div-danger-expelled-group-"+name, "danger-expelled-group-"+name, "You have been drop out!", "Group: "+name, "", 0);
  }


  generalTemplate(typeDiv, idDiv, idA, title, subtitle, subtitle2, time){
    var template = "<div id=\""+idDiv+"\" class=\"alert alert-"+typeDiv+" alert-dismissible\">"
                      + "<a id=\""+idA+"\" href=\"#\" class=\"xNotifications close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>"
                      + "<strong>"+title+"</strong>";
    if(subtitle !== ""){
      template += "<br>"+subtitle;
    }
    if(subtitle2 !== ""){
      template += "<br>"+subtitle2;
    }
    template +="</div>";
    $("#notification-box").append(template);
    if(time > 0){
      setTimeout(function() {
        $("#"+idDiv).fadeOut().empty();
      }, time);
    }
  }

  randomId(length) {
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = length; i > 0; --i){ 
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}

module.exports = Alerts;