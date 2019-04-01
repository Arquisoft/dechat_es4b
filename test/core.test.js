var chai = require('chai');
const auth = require('solid-auth-client');
const Core = require('../lib/core');
const namespaces = require("../lib/namespaces");

const chat = new Core(auth.fetch);
var assert = chai.assert;


var friendList = new Array();
friendList.push({username: "enriquead", 
				inbox: "https://enriquead.solid.community/inbox/"});  
friendList.push({username: "userfortesting", 
				inbox: "https://userfortesting.solid.community/inbox/"});

describe('Core testing', function () {
  
  it('getUsername test', function() {
	   assert.equal(chat.getUsername("https://userfortesting.solid.community"),"userfortesting");
  })
  
  it('Check not me when it must return true', function() {
	   assert.equal(chat.checkNotMe("https://userfortesting.solid.community/profile/card#me","enriquead"),true);
  })
  
  it('Check not me when it must return false', function() {
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
  
  it("Inbox URL",async function(){
	  const inboxUrls = [];
		inboxUrls["https://enriquead.solid.community/profile/card#me"]= await chat.getInboxUrl("https://enriquead.solid.community/profile/card#me");
    
  })

  
  

})