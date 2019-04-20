var chai = require("chai");
const Encryptor = require("../lib/encrypt");

const encryptor = new Encryptor("test");

var assert = chai.assert;

describe("Encrypt/Decrypt testing", function () {
  
  it("Two Encryptions of same word return same string",function(){
	var plainText1 = "Esto va a ser encriptado";
    var encrypted1 = encryptor.encrypt(plainText1);
    var plainText2 = "Esto va a ser encriptado";
    var encrypted2 = encryptor.encrypt(plainText2);
    assert.equal(encrypted1,encrypted2);
  });
 
    it("Plain text remains the same after encrypt/decrypt process",function(){
	var plainText1 = "Esto va a ser encriptado";
    var encrypted1 = encryptor.encrypt(plainText1);
    var after = encryptor.decrypt(encrypted1);
    assert.equal(plainText1,after);
  });
});