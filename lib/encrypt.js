const CryptoJS = require("crypto-js");

class Encryptor{
    
    constructor(key) {
        this.key = key;
    }
    
    encrypt(text){
        var encrypted = CryptoJS.enc.Utf8.parse(text);
        encrypted = CryptoJS.enc.Base64.stringify(encrypted);
        return encrypted;
    }
    
    decrypt(text){
        var encrypted = CryptoJS.enc.Base64.parse(text);
        var decrypted = CryptoJs.enc.Utf8.stringify(encrypted);
        return decrypted;
    }
}