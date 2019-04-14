module.exports = class Alerts {

  constructor() {
    
  }

  clickById(id){
    $("#"+id).click();
  }

  alertMessageReceived(title, message){
    var href = "#";
    var template = '<div class="alert alert-success alert-dismissible"><a id="'+title+'" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>New message!</strong><br>'+title+'<br>'+message+'</div>';
    $("#notification-box").append(template);
  }

  alertGroupCreated(name){
    var href = "#";
    var template = '<div class="alert alert-info alert-dismissible"><a id="created-'+name+'" href="'+href+'" class="xNotifications close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>Group created!</strong><br>'+name+'</div>';
    $("#notification-box").append(template);
    setTimeout(function() {
      $("#created-"+name).fadeOut().empty();
    }, 3000);
  }

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