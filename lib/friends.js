const fc = require("solid-file-client");

class ManageFriends {

  constructor() {};

  async addFriend(personal, friendToAdd){
    if(friendToAdd.length === 0 || !friendToAdd.includes("card#me")){
      return;
    }
    var friendToAdd = friendToAdd.split("#")[0] + "#";
    var myCardUrl = personal.userWebId.split("#")[0];
    fc.readFile(myCardUrl).then(success => {
      console.log(success);
      //Comprobar si esta agregado
      if(!success.includes(friendToAdd)){
        //Comprobar si es primer amigo (c)
        var ret = "";
        var found = false;
        if(!success.includes("@prefix c:")){
          ret = "c";
          found = true;
        }
        //Comprobar posicion libre
        var i = 0;
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
        var last = "c"+(i-1)+":me";
        var newLast = ret+":me";
        newBody = newBody.replace(last, last+", "+newLast);
        fc.updateFile(myCardUrl, newBody).then(() => {
          console.log("New user added to your friends");
        });
      }
      else{
        console.log("This user was in your friends list");
      }    
    });
  }

}

module.exports = ManageFriends;
