var chai = require('chai');
const auth = require('solid-auth-client');
var assert = chai.assert;
const Private = require('../lib/commprivate');

const privateComm = new Private(auth.fetch);

describe('Private communication testing', function () {
  
  it("Random string generates string",function(){
	var rdom = privateComm.randomString(5);
	assert.equal(rdom.length,5);

 
  })
})