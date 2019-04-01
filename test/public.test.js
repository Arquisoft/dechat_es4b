var chai = require('chai');
const auth = require('solid-auth-client');

var assert = chai.assert;

const Group = require('../lib/commgroup');

const publicComm = new Group(auth.fetch);

describe('Private communication testing', function () {
  
  it("Random string generates string",function(){
	var rdom = publicComm.randomString(5);
	assert.equal(rdom.length,5);

  })
})