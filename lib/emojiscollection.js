/**
 * A class with helper methods for read and write of Solid PODs.
 */
var fs = require("fs");

class EmojisCollection {

  constructor() {
    this.active = true;
    this.collection = this.getCollection();
  }

  getCollection(){
    var first = fs.readdirSync("/src/img/emojis/");
    var last = new Array();
    for(f of first){
      last.push(f.split(".")[0]);
    }
    return last;
  }

  getTrueEmojis(emojis){
    return emojis;
  }
}

module.exports = EmojisCollection;
