const fc = require("solid-file-client");

class ManageFriends {

  constructor() {};

  async addFriend(personal, friendToAdd){
    if(friendToAdd.length === 0 || !friendToAdd.includes("card#me")){
      return;
    }
    /*
    var friendToAdd = friendToAdd.split("#")[0] + "#";
    var myCardUrl = personal.userWebId.split("#")[0];
    fc.readFile(myCardUrl).then(success => {
      console.log(success);
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
        if(i === -1){

        } else if (i === 0){
          var last = "c:me";
          newBody = newBody.replace(last, last+", "+newLast);
        } else {
          var last = "c"+(i-1)+":me";
          newBody = newBody.replace(last, last+", "+newLast);
        }   
        fc.updateFile(myCardUrl, newBody).then(() => {
          console.log("New user added to your friends");
        });
      }
      else{
        console.log("This user was in your friends list");
      }    
    });
    */
      var uris = friendToAdd;
      var ins = [];
      uris.map(function (u) {
        var target = $rdf.sym(u); // Attachment needs text label to disinguish I think not icon.
        console.log('Dropped on attachemnt ' + u); // icon was: UI.icons.iconBase + 'noun_25830.svg'
        ins.push($rdf.st(subject, predicate, target, doc));
    });
  }
}

module.exports = ManageFriends;
