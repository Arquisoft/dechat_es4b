require('chai');
const Message = require('../src/message')
var assert = require('assert');
const testMessage = new Message('Juan', 'Ana', 'Buenas noches')

describe('Simple test', function () {
  it('2 plus 2 is 4', function () {
    assert.equal(2+2, 4)
  })

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