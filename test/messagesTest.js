var chai = require('chai');
const Message = require('../src/message')

var assert = chai.assert;
var testMessage = new Message('Juan', 'Ana', 'Buenas noches');

describe('Message testing', function () {
  it('Message class test sender', function() {
    assert.equal(testMessage.sender, 'Juan')
  })

  it('Message class test receiver', function() {
    assert.equal(testMessage.receiver, 'Ana')
  })

  it('Message class test content', function() {
    assert.equal(testMessage.content, "Buenas noches")
  })
  
  
  it('Message class test set sender', function() {
	testMessage.sender = "Pedro";
    assert.equal(testMessage.sender, "Pedro")
  })

  it('Message class test set receiver', function() {
	testMessage.receiver = "Manuel";
    assert.equal(testMessage.receiver, "Manuel")
  })

  it('Message class test set content', function() {
	testMessage.content = "Buenos dias";
    assert.equal(testMessage.content, "Buenos dias");
  })
 
})