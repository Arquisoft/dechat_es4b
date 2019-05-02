var chai = require("chai");
const auth = require("solid-auth-client");

const Private = require("../lib/commprivate");

var assert = chai.assert;
const Core = require("../lib/core");
let chat = new Core(auth.fetch);
const Personal = require("../lib/personal");
let personal = new Personal(chat);

let privateComm = new Private(auth.fetch);

describe("Private communication testing", function () {
    
  it("Constructor and getters are working properly",function(){
      assert.isDefined(privateComm.getDataSync());
      assert.isDefined(privateComm.getEncryptor());
      assert.isDefined(privateComm.getFetch());
      assert.isDefined(privateComm.getMessageToAdd());
      assert.isDefined(privateComm.getDatesRead());
      assert.isDefined(privateComm.getChatShowed());
      assert.isDefined(privateComm.getChatSelected());
      assert.isDefined(privateComm.getEmojisEnabled());
      
   
  });       
  
  it("Random string generates string",function(){
	var rdom = privateComm.randomString(5);
	assert.equal(rdom.length,5); 
  });
    
  it("Establish private communication",async function(){
      personal.username = "dechat-es4b";
      personal.inbox = "https://dechat-es4b.solid.community/inbox/";
      var receiver = {username:"enriquetest2",
                        inbox: "https://enriquetest2.solid.community/inbox/",
                        webId: "https://enriquetest2.solid.community/profile/card#me"};
      privateComm.sendFirstMessage(personal,receiver,"Test");   
      var comunicacion = await privateComm.communicationEstablished(personal,receiver);
      assert.equal(comunicacion,true);
  });  
    
  it("Loads messages properly",async function(){
      personal.username = "enriquead";
      var receiver = {username:"mariodiaz98",
                        inbox: "https://mariodiaz98.solid.community/inbox/",
                        webId: "https://mariodiaz98.solid.community/profile/card#me"};
      personal.inbox = "https://mariodiaz98.solid.community/inbox/";
      var result = await privateComm.loadMessages(personal,receiver,true);      
      assert.isNotNull(result);
  });
    
  it("Get true emojis",async function(){
      var emoji1 = ":blush:";
      var emoji2 = ":sleeping:";
      var thisIsNotAnEmoji = "noEmoji";
      var looksLikeAnEmojiButItsNot = ":thisIsNotAnEmoji:";
      var numberEmojis = privateComm.getTrueEmojis(" "+emoji1+" "+emoji2+" "+thisIsNotAnEmoji + " "+looksLikeAnEmojiButItsNot);
      assert.equal(numberEmojis.length,2);
  });
    
  it("Test last date",function(){
      privateComm.addNewDateRead({"other": "user", "lastDate": 33});
      
    privateComm.changeDateRead({"other": "user", "lastDate": 34});

     
    var result = privateComm.getDateRead("user");
    assert.equal(result,34);
         
  });
    
    it("Check last message",async function(){ //See console log
        personal.myInbox = new Array();
        var other = {username:"mariodiaz98",
                        inbox: "https://mariodiaz98.solid.community/inbox/",
                        webId: "https://mariodiaz98.solid.community/profile/card#me"};
        await privateComm.checkHisLastMessage("https://mariodiaz98.solid.community/public/enriquead.ttl",other,"NEVER",null,personal);
         
  });
 
 
});