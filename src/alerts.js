module.exports = class Alerts {

  constructor() {
    
  }

  clickById(id){
    $("#"+id).click();
  }

  alertMessageReceived(title, message){
    var href = "#";
    var template = '<div class="alert alert-success alert-dismissible"><a id="message-'+title+'" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>New message!</strong><br>'+title+'<br>'+message+'</div>';
    $("#notification-box").append(template);
  }

  /**
  *   REMOVE FROM INBOX
  */

  alertCountRemovedFromInbox(i){
    var href = "#";
    var template = '<div id="div-clear-inbox" class="alert alert-info alert-dismissible"><a id="clear-inbox" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>'+i+' files removed from inbox!</strong></div>';
    $("#notification-box").append(template);
    setTimeout(function() {
      $("#div-clear-inbox").fadeOut().empty();
    }, 3000);
  }

  /**
  *   CREATE GROUP
  */

  alertGroupCreated(name){
    var href = "#";
    var template = '<div id="div-created-group-'+name+'" class="alert alert-info alert-dismissible"><a id="created-'+name+'" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>Group created!</strong><br>'+name+'</div>';
    $("#notification-box").append(template);
    setTimeout(function() {
      $("#div-created-group-"+name).fadeOut().empty();
    }, 3000);
  }

  errorGroupCreated(title, subtitle){
    var href = "#";
    var template = '<div id="div-create-group-'+title+'" class="alert alert-danger alert-dismissible"><a id="created-'+name+'" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>'+title+'</strong><br>'+subtitle+'</div>';
    $("#notification-box").append(template);
    setTimeout(function() {
      $("#div-create-group-"+title).fadeOut().empty();
    }, 3000);
  }

  /**
  *   ADDING FRIEND
  */

  alertNewFriendAdded(name){
    var href = "#";
    var template = '<div id="div-new-friend-'+name+'" class="alert alert-info alert-dismissible"><a id="created-'+name+'" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>New friend added!</strong><br>'+name+'</div>';
    $("#notification-box").append(template);
    setTimeout(function() {
      $("#div-new-friend-"+name).fadeOut().empty();
    }, 3000);
  }

  alertFriendExisted(name){
    var href = "#";
    var template = '<div id="div-new-friend-'+name+'" class="alert alert-info alert-dismissible"><a id="created-'+name+'" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>This user was in your friends list</strong><br>'+name+'</div>';
    $("#notification-box").append(template);
    setTimeout(function() {
      $("#div-new-friend-"+name).fadeOut().empty();
    }, 3000);
  }

  errorNewFriendDontExist(name){
    var href = "#";
    var template = '<div id="div-new-friend-'+name+'" class="alert alert-danger alert-dismissible"><a id="created-'+name+'" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>Can'+"'t find this profile"+'</strong><br>'+name+'</div>';
    $("#notification-box").append(template);
    setTimeout(function() {
      $("#div-new-friend-"+name).fadeOut().empty();
    }, 3000);
  }

  errorNewFriendFormat(){
    var href = "#";
    var template = '<div id="div-new-friend-format" class="alert alert-danger alert-dismissible"><a id="created-'+name+'" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>Incorrect format</strong><br>'+name+'</div>';
    $("#notification-box").append(template);
    setTimeout(function() {
      $("#div-new-friend-format").fadeOut().empty();
    }, 3000);
  }

  /**
   *    OTHERS
   */

  alertGroupCoreRemoved(name){
    var href = "#";
    var template = '<div class="alert alert-danger alert-dismissible"><a id="xNotifications" href="'+href+'" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>Group has been removed!</strong><br>'+name+'</div>';
    $("#notification-box").append(template);
  }

  alertExpelledFromGroup(name){
    var href = "#";
    var template = '<div class="alert alert-danger alert-dismissible"><a id="xNotifications" href="'+href+'" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>Te han echado, maquina</strong><br>Del grupo: '+name+'</div>';
    $("#notification-box").append(template);
  }

}