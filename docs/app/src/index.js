const auth = require("solid-auth-client");
const fc = require("solid-file-client");
const namespaces = require("../lib/namespaces");
const { default: data } = require("@solid/query-ldflex");
const Core = require("../lib/core");
const DataSync = require("../lib/datasync");

const Personal = require("../lib/personal");

let refreshIntervalId;
let core = new Core(auth.fetch);
let personal = new Personal(core);
let dataSync= new DataSync(auth.fetch);


$(".login-btn").click(() => {
  auth.popupLogin({ popupUri: "https://solid.github.io/solid-auth-client/dist/popup.html" });
});

$("#logout-btn").click(() => {
  auth.logout();
});


/**
 * This method checks if a new move has been made by the opponent.
 * The necessarily data is stored and the UI is updated.
 * @returns {Promise<void>}
 */
async function checkForNotifications() {
  var length = $("#mySelectList > option").length;
  if(length === 0){
    await core.loadMessages(personal, $("#possible-people option:selected").val(),false);
  }   
}

$("#refresh-btn").click(checkForNotifications);

$("#open-btn").click(() => {
  //USE IT FOR TESTING
});




auth.trackSession(async session => {
  const loggedIn = !!session;

  if (loggedIn) {
    $("#chat-options").addClass("hidden");
    $("#loading-gif").removeClass("hidden");

    personal.loadNames(session.webId).then(name => {
      personal.loadInbox();
      $("#user-name").text(name);
      $("#nav-login-btn").addClass("hidden");
    });

    personal.loadFriendList(session.webId).then(() => {
      $("#chat-options").removeClass("hidden");
      $("#loading-gif").addClass("hidden");
    });

    $("#user-menu").removeClass("hidden");
    $("#login-required").modal("hide");  

    await checkForNotifications();
    // refresh every 5 sec
    refreshIntervalId = setInterval(checkForNotifications, 5000);
  } else {
    $("#nav-login-btn").removeClass("hidden");
    $("#user-menu").addClass("hidden");
    $("#chat").addClass("hidden");
    $("#new-chat-options").addClass("hidden");
    $("#join-chat-options").addClass("hidden");
    $("#continue-chat-options").addClass("hidden");
    $("#chat-options").removeClass("hidden");
    $("#how-it-works").removeClass("hidden");
    personal.clearInfo();
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
  
});

/**
 * This method updates the UI after a chat option has been selected by the user.
 */
function afterChatOption() {
  $("#chat-options").addClass("hidden");
  $("#how-it-works").addClass("hidden");
}

$("#new-btn").click(async () => { 
  if (personal.username) {
    afterChatOption();
    
    $("#possible-people").empty();
    core.getChatGroups(personal).then(groupNames => {
      for(const chat of groupNames) {
        $("#possible-people").append("<option value="+chat.file.url+">"+chat.name+"</option>");      
      }
    });
    for await (const friend of personal.friendList) {
        $("#possible-people").append("<option value="+friend.username+">"+friend.username+"</option>");
    }
  $( "#possible-people" ).dropdown();
    
    $("#data-name").keydown(function (e) {
      if (e.keyCode === 13) {
        var message = $("#data-name").val();
        var receiver = $("#possible-people option:selected").val();
        $("#data-name").val("");
        core.sendMessage(personal, receiver, message);
        setTimeout(function(){ moveScrollDown() }, 5000);
      }
    });
    $("#new-chat-options").removeClass("hidden");
    $("#emoji-panel").removeClass("hidden");
  } else {
    $("#login-required").modal("show");
  }
});

$("#create-group").click(async () => { 
  if (personal.username) {
    afterChatOption();
    $("#check-people-group").empty();
    for await (const friend of personal.friendList) {
      $("#check-people-group").append("<input class='form-check-input' type='checkbox' id='"+friend.username+"'><label class='form-check-label' for='"+friend.username+"'>"+friend.username+"</label><br>");
    }
    $("#create-new-group").removeClass("hidden");
  } else {
    $("#login-required").modal("show");
  }
});

$("#create-button").click(async () => { 
  var friendsGroup = new Array();
  for await (const friend of personal.friendList) {
    if($("#"+friend.username).prop("checked")){
      friendsGroup.push(friend);
	}
  }
  $("#create-new-group").addClass("hidden");
  // CREAR EL GRUPO AQUI
  if(friendsGroup.length > 0 && $("#group-name").val().length > 0 &&  $("#group-name").val().trim().length > 0){
    core.createGroup(personal, friendsGroup);
	}
});


function moveScrollDown() {
  $("#addMessages").animate({ scrollTop: document.getElementById("addMessages").scrollHeight }, 1000);
  $("#addMessagesGroup").animate({ scrollTop: document.getElementById("addMessages").scrollHeight }, 1000);
}

$("#start-new-chat-btn").click(async () => {
	var message = $("#data-name").val();
  var receiver = $("#possible-people option:selected").val();
  $("#data-name").val("");
	core.sendMessage(personal, receiver, message);
  $("#emoji-panel").prop("hidden",true);
  setTimeout(function(){ moveScrollDown(); }, 5000);
});




$("#clear-inbox-btn").click(async () => {
  await personal.clearInbox(dataSync);
});


$(".btn-cancel").click(() => {
  $("#chat").addClass("hidden");
  $("#new-chat-options").addClass("hidden");
  $("#join-chat-options").addClass("hidden");
  $("#continue-chat-options").addClass("hidden");
  $("#chat-options").removeClass("hidden");
  $("#how-it-works").removeClass("hidden");
});

$("#cancel-group-menu").click(() => {
  $("#create-new-group").addClass("hidden");
});

$("#possible-people-btn").click( async () => {
  core.loadMessages(personal,$("#possible-people option:selected").val(),false);
  setTimeout(function(){ moveScrollDown(); }, 2000);
});

$(".emoji-button").click(function() { 
  var id = $(this).attr("id");
  if($("#data-name").val().length === 0) {
    $("#data-name").val(":"+id+": ");
  } else {
    $("#data-name").val($("#data-name").val() + " :"+id+": ");
  }
});

// Hide and show emoji panel
$("#openEmojiBtn").click(() => {
	var isActivated = ! ($("#emoji-panel").attr("hidden"));
  $("#emoji-panel").prop("hidden",isActivated);
  isActivated = !($("#addMessagesGroup").attr("hidden"));
  $("#addMessagesGroup").prop("hidden",isActivated);
});



//Images sharing (here for some time)

function dropped(e){
	e.preventDefault();
	var files = e.dataTransfer.files;
	for ( var f=0; f<files.length; f++){
		console.log("Storing photo");
//		core.storePhoto(personal,files[f]);
	}
}

function start(){
	var drop = document.getElementById("drop_zone");
	
	drop.addEventListener("dragenter",function(e){
		e.preventDefault();
	}, false);
	
	drop.addEventListener("dragover", function(e){
		e.preventDefault();
	}, false);
	
	drop.addEventListener("drop", dropped, false);
}


		// var photoUbication = storePhoto(files[f]);
		// $("#data-name").val(photoUbication);
		// await com.sendMessage(personal);


window.addEventListener("load",start,false);
