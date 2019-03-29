var chai = require('chai');
const Message = require('../src/message')

var assert = chai.assert;
const testMessage = new Message('Juan', 'Ana', 'Buenas noches');

describe('Message testing', function () {
  it('Message class test sender', function() {
    assert.equal(testMessage.sender, 'Juan')
  })

  it('Message class test receiver', function() {
    assert.equal(testMessage.receiver, 'Ana')
  })

  it('Message class test content', function() {
    assert.equal(testMessage.content, 'Buenas noches')
  })
 
})