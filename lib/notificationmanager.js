class NotificationManager {

  constructor() {
    this.notifications = new Array();
  };

  addNotification(newNot){
    var exists = false;
    for(var notif of this.notifications){
      if(newNot.name === notif.name){
        exists = true;
        if(notif.msg !== newNot.msg){
          notif.msg = newNot.msg;
          notif.state = true;
          this.showNotification(newNot.name);
          return;
        }
      }
    }
    if(!exists){
      this.notifications.push({"name":newNot.name, "msg": newNot.msg, "state": true, "type": newNot.type});
      this.showNotification(newNot.name);
    }
  }

  showNotification(name){
    for(var notif of this.notifications){
      if(notif.name === name){
        this.showToUser(notif);
        notif.state = false;
      }
    }
  }

  removeNotification(name){
    for(var i=0; i<this.notifications.length; i++){
      if(this.notifications[i].name === name){
        this.notifications.splice(i, 1);
      }
    }
  }

  showToUser(notif){
    console.log("NEW NOTIFICATION FROM: " + notif.name);
    console.log("         MESSAGE: " + notif.msg);
  }

}
module.exports = NotificationManager;
