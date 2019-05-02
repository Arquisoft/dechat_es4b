var chai = require("chai");
var Core = require("../lib/core");
var Personal = require ("../lib/personal");
const auth = require("solid-auth-client");
const DataSync = require("../lib/datasync");
var chat = new Core(auth.fetch);
var personal = new Personal(chat);
var assert = chai.assert;
let dataSync= new DataSync(auth.fetch);


describe("Simple personal testing", function () {
	
	
	it("Test constructor", function() {	 
	  assert.isNotNull(personal);
  });

  it("Getters are working",function(){
      personal.username = "SomeUser";
    assert.isNull(personal.getAllInfoFromUsername("noEnrique"));
    assert.isDefined(personal.getWebIdUrl());
    assert.equal(personal.getCore(),chat);
    assert.isNotNull(personal.getFriendList()); 
    personal.clearInfo();
      
  });
  
  it("Clear info test", function() {
    personal.username = "NameToClear";
    personal.friendList.push({username: "enriquead", 
    inbox: "https://enriquead.solid.community/inbox/"});  
    personal.friendList.push({username: "userfortesting", 
    inbox: "https://userfortesting.solid.community/inbox/"});
    
    assert.isNotNull(personal.getAllInfoFromUsername("enriquead"));
    assert.isNotNull(personal.username);
    assert.equal(personal.friendList.length,2);
    personal.clearInfo();
    assert.isNull(personal.username);
    assert.equal(personal.friendList.length,0);  
  });
    
/*
  it("Clears inbox",async function() {
    personal.username = "enriquetest2";
    var name = await personal.clearInbox(dataSync);
    assert.isNotNull(dataSync);
  });
  
*/
  
  it("Loads names",async function(){
    var result = await personal.loadNames("https://enriquead.solid.community/profile/card#me");
    assert.equal(result,"enriquead");
  });
    
    it("Reload friends",async function() {
    personal.userWebId = "https://enriquead.solid.community/profile/card#me";
    personal.friendList = new Array();
    await personal.reloadFriendList();
    assert.isTrue(personal.friendList.length>0); 
  });
    
    it("Checks if file exists properly",function(){
        personal.myInbox = new Array();
        personal.myInbox.push({label: "enriquead.ttl"});
        personal.myInbox.push({label: "enriquetest.ttl"});
        assert.isTrue(personal.fileExists("enriquead"));
        assert.isFalse(personal.fileExists("noExiste"));
        
    });
    
    it("Search groups by id or url",function(){
        var chat = {url: "id1testing"};
        personal.groupsLoaded.push(
        {"file":chat, "name": "name", "type": "group", "urlCore": "test"});
        chat = {url: "id2testing"};
         personal.groupsLoaded.push(
        {"file":chat, "name": "name", "type": "group", "urlCore": "test"});
        
        assert.equal(personal.getAllGroups().length,2);  
        assert.isNull(personal.getGroupByMyUrl("false"));
         assert.isNotNull(personal.getGroupByMyUrl("id1testing"));
         assert.isNull(personal.getGroupByID("false"));
         assert.isNotNull(personal.getGroupByID("id1"));
        
        
        
    });
    
  /*WIP
  it("Loads groups",async function(){
      personal.username = "enriquead";  
      await personal.loadInbox();
      await personal.loadGroupNames();
      assert.isNotNull(personal.groupsLoaded);
  })*/
  
  
  
  
  

});