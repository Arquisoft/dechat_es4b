var chai = require("chai");
const auth = require("solid-auth-client");

const Private = require("../lib/commprivate");

var assert = chai.assert;
const Core = require("../lib/core");
const chat = new Core(auth.fetch);
const Personal = require("../lib/personal");
let personal = new Personal(chat);

const privateComm = new Private(auth.fetch);

describe("Private communication testing", function () {
  
  it("Random string generates string",function(){
	var rdom = privateComm.randomString(5);
	assert.equal(rdom.length,5);

 
  })
    
  it("Establish private communication",async function(){
      personal.username = "dechat-es4b";
      var receiver = {username:"enriquetest2",
                        inbox: "https://enriquetest2.solid.community/inbox/",
                        webId: "https://enriquetest2.solid.community/profile/card#me"};
      privateComm.sendFirstMessage(personal,receiver,"Test");   
      var comunicacion = await privateComm.communicationEstablished(personal.username,receiver);
      assert.equal(comunicacion,true);
  })  
    
  it("Loads messages properly",async function(){
      var result = await privateComm.loadMessages("dechat-es4b","enriquetest2",true);
      
      
  }) 
    
  

   
})