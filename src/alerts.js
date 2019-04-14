module.exports = class Alerts {

  constructor() {
    
  }

  alertMessageReceived(title, message){
    var href = "#";
    var template = '<div class="alert alert-success alert-dismissible"><a id="xNotifications" href="'+href+'" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>New message!</strong><br>'+title+'<br>'+message+'</div>';
    $("#notification-box").append(template);
  }

  alertGroupCreated(name){
    var href = "#";
    var template = '<div class="alert alert-info alert-dismissible"><a id="xNotifications" href="'+href+'" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>Group created!</strong><br>'+name+'</div>';
    $("#notification-box").append(template);
  }

  alertNewFriendAdded(name){
    var href = "#";
    var template = '<div class="alert alert-info alert-dismissible"><a id="xNotifications" href="'+href+'" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+
                    '<strong>New friend added!</strong><br>'+name+'</div>';
    $("#notification-box").append(template);
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