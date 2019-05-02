var chai = require("chai");
const auth = require("solid-auth-client");
const Core = require("../lib/core");
const Personal = require("../lib/personal");
const Group = require("../lib/commgroup");
const Private = require("../lib/commprivate");


var assert = chai.assert;
const chat = new Core(auth.fetch);
let personal = new Personal(chat);
const publicComm = new Group(auth.fetch);
const privateComm = new Private(auth.fetch);

describe("Group communication testing", function () {
    
  it("Constructor and getters are working properly",function(){
      assert.isDefined(publicComm.getDataSync());
      assert.isDefined(publicComm.getEncryptor());
      assert.isDefined(publicComm.getFetch());
      assert.isDefined(publicComm.getAlerts());
      assert.isDefined(publicComm.getCurrentUrlFile());
      assert.isDefined(publicComm.getChatShowed());
    
  });
  
  it("Random string generates string", function(){
	var rdom = publicComm.randomString(5);
	assert.equal(rdom.length,5);

  });

  it("Create core file and send message", async function(){
      personal.username = "dechat-es4b";
      personal.inbox = "https://dechat-es4b.solid.community/inbox/";
      var rand = publicComm.randomString(6);
      var groupName = "Testing group"+publicComm.randomString(3);
      var friendList = new Array();
      
      
      friendList.push({username:"enriquetest2",
                        inbox: "https://enriquetest2.solid.community/inbox/",
                        webId: "https://enriquetest2.solid.community/profile/card#me"});
       friendList.push({username:"enriquead",
                        inbox: "https://enriquead.solid.community/inbox/",
                        webId: "https://enriquead.solid.community/profile/card#me"});
      
     publicComm.createCoreFile(personal,rand,groupName,friendList);
     publicComm.sendFirstMessage(personal,friendList[0],rand,groupName);  
     var comunicacion = await privateComm.communicationEstablished(personal,friendList[0]);
     assert.equal(comunicacion,true);
     
  }); 
       
  it("Loads messages properly",async function(){
      personal.username = "enriquead";
      var result = await publicComm.loadMessages(personal,"testurl",true);
      assert.isNotNull(result);
  });
    
  it("Check notifications",async function(){ //See console log
       var group = {"file": {"url":"https://enriquead.solid.community/public/mariodiaz98.ttl"}, "name": "testChat", "type": "group", "urlCore": "https://enriquead.solid.community/public/mariodiaz98.ttl"};
       await publicComm.checkForNotifications(group,null);  
  }); 
    
  it("Reads chat groups",function(){
      personal.inbox = "https://enriquead.solid.community/public/";
      var result = publicComm.readChatGroups(personal);
      assert.isNotNull(result);
      
      
  });
      
});