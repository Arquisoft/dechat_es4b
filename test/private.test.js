var chai = require('chai');
const auth = require('solid-auth-client');

const Private = require('../lib/commprivate');

var assert = chai.assert;
const Core = require('../lib/core');
const chat = new Core(auth.fetch);
const Personal = require('../lib/personal');
let personal = new Personal(chat);

const privateComm = new Private(auth.fetch);

describe('Private communication testing', function () {
  
  it("Random string generates string",function(){
	var rdom = privateComm.randomString(5);
	assert.equal(rdom.length,5);

 
  })
    
  it("Establish private communication",function(){
      personal.username = "enriquead";
      var receiver = {username:"troken11",
                        inbox: "https://troken11.solid.community/inbox/",
                        webId: "https://troken11.solid.community/profile/card#me"}
      privateComm.sendFirstMessage(personal,receiver);
      
      
  })  
})