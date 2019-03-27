var chai = require('chai');
const Message = require('../src/message')
const Core = require('../lib/core');
const Personal = require ('../lib/personal');
const chat = new Core();
const personal = new Personal(chat);
var assert = chai.assert;
const testMessage = new Message('Juan', 'Ana', 'Buenas noches');

var friendList = new Array();
friendList.push({username: "enriquead", 
				inbox: "https://enriequad.solid.community/inbox/"});  
friendList.push({username: "userfortesting", 
				inbox: "https://userfortesting.solid.community/inbox/"});

describe('Simple chat testing', function () {
  //Message Test
  it('Message class test sender', function() {
    assert.equal(testMessage.sender, 'Juan')
  })

  it('Message class test receiver', function() {
    assert.equal(testMessage.receiver, 'Ana')
  })

  it('Message class test content', function() {
    assert.equal(testMessage.content, 'Buenas noches')
  })
  // Core tests
  it('getUsername test', function() {
	   assert.equal(chat.getUsername("https://userfortesting.solid.community"),"userfortesting");
  })
  
  it('Check not me when it must return true', function() {
	   assert.equal(chat.checkNotMe("https://userfortesting.solid.community/profile/card#me","enriquead"),true);
  })
  
  it('Check not me when it must return false', function() {
	   assert.equal(chat.checkNotMe("https://userfortesting.solid.community/profile/card#me","userfortesting"),false);
  })
  
  it('Friend from list is expected',function() {
	var friend = chat.getFriendOfList(friendList,"enriquead");
	assert.isNotNull(friend);
  })
  
  it('Friend does not exist on list',function() {
	var friend = chat.getFriendOfList(friendList,"thisUserDoesNotExist");
	assert.isNull(friend);
  })
  
 
  
  
  
  
  
  

})