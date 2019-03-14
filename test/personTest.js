import { describe, it } from 'mocha'
import { assert, expect } from 'chai'
const fc = require('solid-file-client');

var index = require('../src/index.js');

var credentials = {
    "idp"      : "https://solid.community",
    "username" : "dechat-es4b",                  
    "password" : "copiarLoQueQuerais19.",     // OPTIONAL !!!
    "base"     : "https://dechat-es4b.solid.community",
    "test"     : "/public/test/"
}

describe('Obtain friends test!', function () {
  it('obtainSomething', function () {
	fc.login(credentials);
    index.getFriends();
	assert(index.friendList.length > 0);
  })
})
