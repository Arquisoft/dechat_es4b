var chai = require("chai");
const auth = require("solid-auth-client");
const Core = require("../lib/core");
const namespaces = require("../lib/namespaces");

const chat = new Core(auth.fetch);
var assert = chai.assert;
const Personal = require("../lib/personal");
let personal = new Personal(chat);


var friendList = new Array();
friendList.push({username: "enriquead", 
				inbox: "https://enriquead.solid.community/inbox/"});  
friendList.push({username: "userfortesting", 
				inbox: "https://userfortesting.solid.community/inbox/"});

describe("Core testing", function () {
    
  it("Getters are working",function(){
      assert.isNotNull(chat.getInboxUrls());
      assert.equal(chat.getFetch(),auth.fetch);
      assert.isNotNull(chat.getAlreadyCheckedResources());
      assert.isNotNull(chat.getGroupCommunication());
      assert.isNotNull(chat.getPrivateCommunication());
      
  })
  
  it("getUsername test", function() {
		assert.equal(chat.getUsername("https://userfortesting.solid.community"),"userfortesting");
  })
  
  it("Check not me when it must return true", function() {
		assert.equal(chat.checkNotMe("https://userfortesting.solid.community/profile/card#me","enriquead"),true);
  })
  
  it("Check not me when it must return false", function() {
		assert.equal(chat.checkNotMe("https://userfortesting.solid.community/profile/card#me","userfortesting"),false);
  })
  
  it("Friend from list is expected",function() {
	var friend = chat.getFriendOfList(friendList,"enriquead");
	assert.isNotNull(friend);
  })
  
  it("Friend does not exist on list",function() {
	var friend = chat.getFriendOfList(friendList,"thisUserDoesNotExist");
	assert.isNull(friend);
  })
  
  it("Random string generates string",function(){
	var rdom = chat.randomString(5);
	assert.equal(rdom.length,5);

 
  })
  
  it("Someone is not my friend",function(){
	var result = chat.isFriend ("https://userfortesting.solid.community","https://enriquead.solid.community/profile/card#me");
	assert.equal(result,false);
	  
  })
  
  
  it("Obtain chat groups",async function(){
		personal.username="enriquead";
		var loaded = await personal.loadInbox();
		var chats = await chat.getChatGroups(personal);
		assert.isNotNull(chats);
		
  })


  
  

  
  

})