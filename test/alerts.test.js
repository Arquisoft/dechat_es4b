var chai = require("chai");
const Alerts = require("../src/alerts");

var assert = chai.assert;
let alerts = new Alerts(true);


describe("Alerts testing", function () {

  it("Random id generates id",function(){
	var rdom = alerts.randomId(5);
	assert.equal(rdom.length,5); 
    assert.isTrue(typeof(rdom) == "string");
  });
    
    
  it("Testing different alerts",function(){
      // Look at console to see html generated
      var template = alerts.alertMessageReceived("Hola","Mensaje de prueba");
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.alertCountRemovedFromInbox(7);
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(template.includes("7")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.alertGroupCreated("TestGroup");
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(template.includes("TestGroup")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.errorGroupCreated("TestGroup","2");
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(template.includes("TestGroup")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.alertNewFriendAdded("Juan");
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(template.includes("Juan")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.errorFriendExisted("Juan");
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(template.includes("Juan")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.errorNewFriendDontExist("Juan");
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(template.includes("Juan")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.errorNewFriendFormat("Juan");
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.errorNeedAFriend();
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.alertGroupCoreRemoved("Grupo test");
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(template.includes("Grupo test")); 
      assert.isTrue(typeof(template) == "string");
      template = alerts.alertExpelledFromGroup("Grupo test");
      assert.isTrue(template.includes("alert")); 
      assert.isTrue(template.includes("Grupo test")); 
      assert.isTrue(typeof(template) == "string");
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
  });
});