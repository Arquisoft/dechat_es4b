const CryptoJS = require("crypto-js");

class Encryptor{
    
    encrypt(text){
        var encrypted = CryptoJS.enc.Utf8.parse(text);
        encrypted = "@"+CryptoJS.enc.Base64.stringify(encrypted);
        return encrypted;
    }
    
    decrypt(text){
        var firstChar = text.charAt(0);
        if(firstChar == "@"){
            text = text.substr(1,text.length-1);
            var encrypted = CryptoJS.enc.Base64.parse(text);
            var decrypted = CryptoJS.enc.Utf8.stringify(encrypted);
            return decrypted;
        }
       
        
        return text;
    }
}
module.exports = Encryptor;