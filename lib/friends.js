const fc = require("solid-file-client");
const Alerts = require("../src/alerts");

class ManageFriends {

  constructor() {
    this.alerts = new Alerts(false);
  }

  async addFriend(personal, newFriend, core){
    var friendCard = newFriend;
    if(newFriend.length === 0 || !newFriend.includes("card#me")){
      this.alerts.errorNewFriendFormat();
      return null;
    }
    var friendToAdd = newFriend.split("#")[0] + "#";
    var myCardUrl = personal.userWebId.split("#")[0];
    fc.readFile(friendCard).then(() => {
      fc.readFile(myCardUrl).then((success) => {
        //Comprobar si esta agregado
        if(!success.includes(friendToAdd)){
          //Comprobar si es primer amigo (c)
          var ret = "";
          var found = false;
          var i = 0;
          if(!success.includes("@prefix c:")){
            ret = "c";
            found = true;
            i = -1;
          }
          //Comprobar posicion libre
          while(!found){
            if(!success.includes("@prefix c" + i)){
              found = true;
              ret = "c"+i;
            }
            else{
              i++;
            }
          }
          var newBody = success.replace("\n\n", "\n@prefix "+ret+": <"+friendToAdd+">.\n\n");
          var newLast = ret+":me";
          var last;
          if(i === -1){
            //You had no friends (Doesnt work)
            this.alerts.errorNeedAFriend();
            //You had no friends (Gives an error)
          } else if (i === 0){
            last = "c:me";
            newBody = newBody.replace(last, last+", "+newLast);
          } else {
            last = "c"+(i-1)+":me";
            newBody = newBody.replace(last, last+", "+newLast);
          }   
          fc.updateFile(myCardUrl, newBody).then(() => {
            this.alerts.alertNewFriendAdded(core.getUsername(friendCard));
            personal.reloadFriendList();
          });
        }
        else{
          this.alerts.errorFriendExisted(core.getUsername(friendCard));
        }    
      }, (err) => {
        console.log(err);
      }
    );
    }, () => {
      this.alerts.errorNewFriendDontExist(core.getUsername(friendCard));
    });
  }
}

module.exports = ManageFriends;
