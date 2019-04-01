var chai = require('chai');
const Message = require('../src/message')

var assert = chai.assert;
var date = Date.now();
var testMessage = new Message('Juan', date, 'Buenas noches');

describe('Message testing', function () {
  it('Message class test sender', function() {
    assert.equal(testMessage.sender, 'Juan');
  })

  it('Message class test content', function() {
    assert.equal(testMessage.content, "Buenas noches");
  })
  
  
  it('Message class test set sender', function() {
	testMessage.sender = "Pedro";
    assert.equal(testMessage.sender, "Pedro");
  })

  it('Message class test set content', function() {
	testMessage.content = "Buenos dias";
    assert.equal(testMessage.content, "Buenos dias");
  })
 
})