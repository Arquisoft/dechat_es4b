var chai = require('chai');
const Core = require('../lib/core');
const Personal = require ('../lib/personal');
const auth = require('solid-auth-client');
const DataSync = require('../lib/datasync');
const chat = new Core(auth.fetch);
const personal = new Personal(chat);
var assert = chai.assert;
let dataSync= new DataSync(auth.fetch);


describe('Simple personal testing', function () {
	
	
	it('Test constructor', function() {
	 
	  assert.isNotNull(personal);
    
  })
  
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
    
    it('Loads friends',async function() {
       var name = await personal.loadFriendList("https://enriquead.solid.community/profile/card#me")
       assert.isNotNull(name);
    
  })
    it('Clears inbox',async function() {
       personal.username = "enriquead";     
       var name = await personal.clearInbox(dataSync)
       assert.isNotNull(dataSync);
    
  })
  
  
  
  
  

})