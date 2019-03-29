var chai = require('chai');
const Core = require('../lib/core');
const Personal = require ('../lib/personal');
const chat = new Core();
const personal = new Personal(chat);
var assert = chai.assert;


describe('Simple personal testing', function () {
  
    it('Clear info test', function() {
       personal.username = "NameToClear";
       personal.friendList.push({username: "enriquead", 
				inbox: "https://enriquead.solid.community/inbox/"});  
       personal.friendList.push({username: "userfortesting", 
				inbox: "https://userfortesting.solid.community/inbox/"});
       assert.isNotNull(personal.username);
       assert.equal(personal.friendList.length,2);        
	   personal.clearInfo();
       assert.isNull(personal.username);
       assert.equal(personal.friendList.length,0);
    
  })
  

})