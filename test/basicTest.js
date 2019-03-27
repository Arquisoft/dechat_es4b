require('chai');
const Message = require('../src/message')
const Core = require('../lib/core');
const chat = new Core();
var assert = require('assert');
const testMessage = new Message('Juan', 'Ana', 'Buenas noches')

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
  
  
  
  

})