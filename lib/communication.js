class BaseCommunication{
    
    constructor(){
 
    }
    
    getTrueEmojis(text){
      var ret = new Array();
      var first = ["blush", "eyebrow", "facehearts", "hearteyes", "hugging", "kissing", "laughing",
                    "neutral", "nomouth", "openmouth", "persevere", "rofl", "rolling", "sleeping", 
                    "smile", "smiley", "smirk", "stareyes", "sunglasses", "sweatsmile", "thinking",
                    "wink", "yum", "zipper", "poo", "thumbup", "thumbdown", "explodehead", "rage"];
      for(var f of first){
        if(text.includes(":"+f+":")){
          ret.push(f);
        }
      }
      return ret;
    }
        
        
    randomString(length) {
      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
      return result;
    }
    
    cardButNotMe(other){
      return other.webId.split("#")[0] + "#";
    }
    
}
module.exports = BaseCommunication;