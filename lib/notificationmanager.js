const Alerts = require("../src/alerts");

class NotificationManager {

  constructor() {
    this.notifications = new Array();
    this.alerts = new Alerts(false);
  }

  addNotification(newNot){
    var exists = false;
    for(var notif of this.notifications){
      if(notif.name === newNot.name){
        exists = true;
        if(notif.msg !== newNot.msg){
          notif.msg = newNot.msg;
          notif.state = true;
          this.alerts.clickById(newNot.name);
          this.showNotification(newNot.name);
          return;
        }
      }
    }
    if(!exists){
      if(newNot.type === "group"){
        this.notifications.push({"name":newNot.name, "sender": newNot.sender, "msg": newNot.msg, "state": true, "type": newNot.type});
      }
      else{
        this.notifications.push({"name":newNot.name, "msg": newNot.msg, "state": true, "type": newNot.type});
      }   
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

  /*
  removeNotification(name){
    var i = 0;
    for(var not of this.notifications){
      if(not.name === name){
        this.notifications.splice(i, 1);
      }
    }
    i++;
  }
  */

  hidePrivateNotification(other){
    this.alerts.clickById("message-"+other.username);
  }

  hideGroupNotification(group){
    this.alerts.clickById("message-"+group.name);
  }

  showToUser(notif){
    if(notif.type === "group"){
      this.alerts.alertMessageReceived(notif.name, notif.sender+": "+notif.msg);
    }
    else{
      this.alerts.alertMessageReceived(notif.name, notif.msg);
    }   
  }

}
module.exports = NotificationManager;
