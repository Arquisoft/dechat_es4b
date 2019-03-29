var chai = require('chai');
const Core = require('../lib/core');
const Personal = require ('../lib/personal');
const chat = new Core();
const personal = new Personal(chat);
var assert = chai.assert;


describe('Simple personal testing', function () {
  
    it('Simple', function() {
	   assert.equal(2,2);
  })
  

})