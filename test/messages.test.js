var chai = require("chai");
const Message = require("../src/message");

var assert = chai.assert;
var date = Date.now();
var testMessage = new Message("Juan", date, "Buenas noches");

describe("Message testing", function () {

  it("Message class test sender", function() {
    assert.equal(testMessage.sender, "Juan");
  });
  
  it("Message class test content", function() {
    assert.equal(testMessage.content, "Buenas noches");
  });
  
  it("Message class test dateTime", function() {
    assert.equal(testMessage.dateTime, date);
  });
  
  it("Message class test set sender", function() {
	testMessage.sender = "Pedro";
    assert.equal(testMessage.sender, "Pedro");
  });
  
  it("Message class test set dateTime", function() {
	var ahora = Date.now();
	testMessage.dateTime = ahora;
    assert.equal(testMessage.dateTime, ahora);
  });

  it("Message class test set content", function() {
	testMessage.content = "Buenos dias";
    assert.equal(testMessage.content, "Buenos dias");
  });
  
  it("Message class Receiver", function() {
	testMessage.receiver = "Manuel";
    assert.equal(testMessage.receiver, "Manuel");
  });
 
});