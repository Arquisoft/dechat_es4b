//const {Loader} = require('semantic-chat');
const auth = require('solid-auth-client');
const fc = require('solid-file-client');
const DataSync = require('../lib/datasync');
const namespaces = require('../lib/namespaces');
const { default: data } = require('@solid/query-ldflex');
const Core = require('../lib/core');

const WebRTC = require('../lib/webrtc');

let userWebId;
let myUsername;
let friendList;
let semanticChat;
let dataSync = new DataSync(auth.fetch);
let userDataUrl;
let oppWebId;
let chatsToJoin = [];
let chatName;
let refreshIntervalId;
let selectedTheme = 'default';
let core = new Core(auth.fetch);
let invitations;
let alertInvitations = false;



$('.login-btn').click(() => {
  auth.popupLogin({ popupUri: 'https://solid.github.io/solid-auth-client/dist/popup.html' });
});

$('#logout-btn').click(() => {
  auth.logout();
});

$('#refresh-btn').click(checkForNotifications);


/**
 * This method does the necessary updates of the UI when the different Chat options are shown.
 */
function setUpForEveryChatOption() {
  $('#chat-loading').removeClass('hidden');
  $('#chat').removeClass('hidden');
}

auth.trackSession(async session => {
  const loggedIn = !!session;

  if (loggedIn) {
    $('#chat-options').addClass('hidden');
    $('#loading-gif').removeClass('hidden');
    // Para sacar el nombre
    //const name = await core.getFormattedName(userWebId);
    // Para sacar el username
    myUsername = await core.getUsername(session.webId);    

    if (myUsername) {
      $('#user-name').text(myUsername);
    }

    userWebId = session.webId;
    if(friendList == null)
      await getFriends(); 

    $('#user-menu').removeClass('hidden');
    $('#nav-login-btn').addClass('hidden');
    $('#login-required').modal('hide');  

    checkForNotifications();
    // refresh every 5sec
    refreshIntervalId = setInterval(checkForNotifications, 10000);
  } else {
    $('#nav-login-btn').removeClass('hidden');
    $('#user-menu').addClass('hidden');
    $('#chat').addClass('hidden');
    $('#new-chat-options').addClass('hidden');
    $('#join-chat-options').addClass('hidden');
    $('#continue-chat-options').addClass('hidden');
    $('#chat-options').removeClass('hidden');
    $('#how-it-works').removeClass('hidden');
    userWebId = null;
    board = null;
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
  
});

/**
 * This method updates the UI after a chat option has been selected by the player.
 */
function afterChatOption() {
  $('#chat-options').addClass('hidden');
  $('#how-it-works').addClass('hidden');
}

function afterChatSpecificOptions() {
}

$('#new-btn').click(async () => { 
  if (userWebId) {
    afterChatOption();
    $('#possible-people').empty();
    for await (const friend of friendList) {
        $('#possible-people').append('<option value='+friend.username+'>'+friend.name+'</option>');
    }
    
    $("#data-name").keydown(function (e) {
      if (e.keyCode == 13) {
        sendMessage();
      }
    });
    $('#new-chat-options').removeClass('hidden');
  } else {
    $('#login-required').modal('show');
  }
});

$('#start-new-chat-btn').click(async () => {
   await sendMessage();
});

// async function readMessagesBetweenUsers(userFrom, userTo) {
	// var file = await fileClient.readFile(url);
	// var readingRoute = "https://" + userName + ".solid.community/inbox/" + userName + ".txt";
// }

async function sendMessage() {
  var message = $('#data-name').val();
  var a = $("#possible-people option:selected").val();
  var receiver = core.getFriendOfList(friendList, a);
  if(await communicationEstablished(receiver)){
    sendMessageToMyPod(receiver);
  }
  else{
    try {
      sendInvitation(receiver);  
    } catch (e) {
      core.logger.error(`Could not send message to the user.`);
      core.logger.error(e);
    }   
  }
  if($("#sent-messages").val()=="")
      $("#sent-messages").val(message);
  else
	    $("#sent-messages").val($("#sent-messages").val() + "\n" + message);
    //dataSync.createEmptyFileForUser("https://"+myUsername+".solid.community/inbox/"+receiver.username+".ttl");
    //dataSync.executeSPARQLUpdateForUser("https://"+myUsername+".solid.community/inbox/"+receiver.username+".ttl", 'INSERT DATA {'+message+'}');
  
}

$('#join-btn').click(async () => {
  if (userWebId) {
    afterChatOption();
    $('#join-chat-options').removeClass('hidden');
    $('#people-invites').empty();
    for await (const inv of invitations) {
      $('#people-invites').append('<option value='+inv+'>'+inv+'</option>');
    }
  } else {
    $('#login-required').modal('show');
  }
});

$('#accept-inv').click(async () => {
  acceptInvitation();
});

$('#continue-btn').click(async () => {
  if (userWebId) {
    afterChatOption();

    const $tbody = $('#continue-chat-table tbody');
    $tbody.empty();
    $('#continue-chat-options').removeClass('hidden');

    const chats = await core.getChatsToContinue(userWebId);

    $('#continue-looking').addClass('hidden');

    if (chats.length > 0) {
      $('#continue-loading').addClass('hidden');
      $('#continue-chats').removeClass('hidden');

      chats.forEach(async chat => {
        let name = await core.getObjectFromPredicateForResource(chat.chatUrl, namespaces.schema + 'name');

        if (!name) {
          name = chat.chatUrl;
        } else {
          name = name.value;
        }

        const loader = new Loader(auth.fetch);
        const oppWebId = await loader.findWebIdOfOpponent(chat.chatUrl, userWebId);
        const oppName = await core.getFormattedName(oppWebId);

        const $row = $(`
          <tr data-chat-url="${chat.chatUrl}" class='clickable-row'>
            <td>${name}</td>
            <td>${oppName}</td>
          </tr>`);

        $row.click(function() {
          $('#continue-chat-options').addClass('hidden');
          const selectedChat = $(this).data('chat-url');

          let i = 0;

          while (i < chats.length && chats[i].chatUrl !== selectedChat) {
            i ++;
          }

          userDataUrl = chats[i].storeUrl;

          afterChatSpecificOptions();
          continueExistingChessChat(selectedChat);
        });

        $tbody.append($row);
      });
    } else {
      $('#no-continue').removeClass('hidden');
    }
  } else {
    $('#login-required').modal('show');
  }
});

$('#continue-chat-btn').click(async () => {
  $('#continue-chat-options').addClass('hidden');
  const chats = await core.getChatsToContinue(userWebId);
  const selectedChat = $('#continue-chat-urls').val();
  let i = 0;

  while (i < chats.length && chats[i].chatUrl !== selectedChat) {
    i ++;
  }

  userDataUrl = chats[i].storeUrl;

  afterChatCSpecificOptions();
  continueExistingChessChat(selectedChat);
});

/**
 * This method checks if a new move has been made by the opponent.
 * The necessarily data is stored and the UI is updated.
 * @returns {Promise<void>}
 */

async function checkForNotifications() {
  console.log('Checking for new notifications');

  const updates = await core.getAllResourcesInInbox(await core.getInboxUrl(userWebId));

  console.log('Checked');

  invitations = new Array();

  updates.forEach(async (fileurl) => {
    fc.readFile(fileurl).then(  body => {
      if(body.includes("ZXCVB")){
        invitations.push(fileurl);
        if(!alertInvitations){
          alertInvitations = !alertInvitations
          alert("New invitations!!");
          $('#join-btn').removeClass('hidden')
        }  
      }
   }, err => console.log(err) );
  });
}

$('#clear-inbox-btn').click(async () => {
  const resources = await core.getAllResourcesInInbox(await core.getInboxUrl(userWebId));

  resources.forEach(async r => {
      dataSync.deleteFileForUser(r);
  });
});


$('.btn-cancel').click(() => {
  $('#chat').addClass('hidden');
  $('#new-chat-options').addClass('hidden');
  $('#join-chat-options').addClass('hidden');
  $('#continue-chat-options').addClass('hidden');
  $('#chat-options').removeClass('hidden');
  $('#how-it-works').removeClass('hidden');
});

async function getFriends() { 
  var subject = userWebId;
  var predicate = "http://xmlns.com/foaf/0.1/name";

  var friends = null;
  
  fc.fetchAndParse( subject ).then( store => {
      searchFriendsOnList(store.statements);
  }, err => console.log("could not fetch : "+err) ) ;
};

async function searchFriendsOnList(possibleList) {
  friendList = new Array();
  for(var i=0; i<possibleList.length; i++){
    if(core.isFriend(possibleList[i].object.value, myUsername))
      friendList.push({card: possibleList[i].object.value, 
                        username: core.getUsername(possibleList[i].object.value), 
                        name: await core.getFormattedName(possibleList[i].object.value),
                        inbox: "https://"+core.getUsername(possibleList[i].object.value)+".solid.community/inbox/"});
  }
  $('#chat-options').removeClass('hidden');
  $('#loading-gif').addClass('hidden');
};

function sendInvitation(receiver){
  var myInbox = "https://"+myUsername+".solid.community/inbox/";
  var message = "\n@@@\n" + $('#data-name').val();
  document.getElementById("data-name").value = "";   
  
  /*
  // Prueba de crear carpeta
  var userRoute = "https://" + "mariodiaz98" + ".solid.community/";
  var folder = userRoute + "public/chat/" + receiver.username +"/";

  fc.createFolder(folder);
  fc.createFile(folder+"/"+(new Date().getTime()), message);
  */
  
  fc.updateFile(receiver.inbox + myUsername + ".txt", myInbox + receiver.username + ".txt" + "\n@@@\n").then( success => {
    console.log( `Send message to their PODs.`)
  }, err => console.log(err) );
  fc.updateFile(myInbox + receiver.username + ".txt", receiver.inbox + myUsername + ".txt" + message).then( success => {
    console.log( `Send message to your POD.`)
  }, err => console.log(err) );
  fc.updateFile(myInbox + receiver.username + ".txt.acl", templatePermission(receiver.username, receiver.username + ".txt")).then( success => {
    console.log( `Send message to your POD.`)
  }, err => console.log(err) );
}

function sendMessageToMyPod(receiver){
  var myInbox = "https://"+myUsername+".solid.community/inbox/";
  var body = "";
  fc.readFile(myInbox + receiver.username + ".txt").then( success => {
    if(success.split('\n').length < 7){
      console.log(success.split('\n').length);
      givePermission(myInbox, receiver);
    }

      
    body = success + "\n" + $('#data-name').val();
    fc.updateFile(myInbox + receiver.username + ".txt", body).then( success => {
      console.log( `Send message to your POD.`);
      document.getElementById("data-name").value = "";
    }, err => console.log(err) );
  }, err => console.log(err) );
}

$("#possible-people-btn").click( async () => {
	alert("Cambiado");
	
	// Routes of users inbox
	var myInbox = "https://"+myUsername+".solid.community/inbox/"; 
	var otherUser = $("possible-people").text();
	var otherInbox = "https://"+otherUser+".solid.community/inbox/";
	
	// Let's read each message file
	
	var fileWithMessagesSentByMe = myInbox + otherUser + ".txt";	// Example: https://mariodiaz98.solid.community/inbox/dechat-es4b.txt
	var fileWithMessagesSentByTheOtherUSer = otherInbox + myUsername + ".txt";	// Example: https://dechat-es4b.solid.community/inbox/mariodiaz98.txt
	
	fc.readFile(fileWithMessagesSentByMe).then(  body => {
		console.log(`File content is : ${body}.`);
			}, err => console.log(err) );
			
	fc.readFile(fileWithMessagesSentByTheOtherUSer).then(  body => {
		console.log(`File content is : ${body}.`);
			}, err => console.log(err) );
});

// async function loadMessages(){
	
	// alert("Cambiado");
	
	// // Routes of users inbox
	// var myInbox = "https://"+myUsername+".solid.community/inbox/"; 
	// var otherUser = $("possible-people").val();
	// var otherInbox = "https://"+otherUser+".solid.community/inbox/";
	
	// // Let's read each message file
	
	// var fileWithMessagesSentByMe = myInbox + otherUser + ".txt";	// Example: https://mariodiaz98.solid.community/inbox/dechat-es4b.txt
	// var fileWithMessagesSentByTheOtherUSer = otherInbox + myUsername + ".txt";	// Example: https://dechat-es4b.solid.community/inbox/mariodiaz98.txt
	
	// fc.readFile(fileWithMessagesSentByMe).then(  body => {
		// console.log(`File content is : ${body}.`);
			// }, err => console.log(err) );
			
	// fc.readFile(fileWithMessagesSentByTheOtherUSer).then(  body => {
		// console.log(`File content is : ${body}.`);
			// }, err => console.log(err) );
	
	
	
// }
/*
function acceptInvitation(receiver){
  var urlFile = $('#people-invites').val();
  var text = "";

  fc.updateFile("https://trokentest.solid.community/inbox/troken11.txt", 'QWERTY' + text).then( success => {
    console.log( `Permissions changed your POD.`)
  }, err => console.log(err) );

  fc.readFile(urlFile).then( success => {
    text = success.replace('ZXCVB','');
    for(var i=0; i<friendList.length; i++){
      if(urlFile.includes(friendList[i].username)){
        givePermission(text, urlFile, friendList[i].username, friendList[i].inbox);
      }
    }
    console.log( `Read invitation from my PODs.` + urlFile);
  }, err => console.log(err) );
}*/

function givePermission(myInbox, receiver){
  fc.updateFile(myInbox + receiver.username + ".txt.acl", 
                templatePermission(receiver.username, receiver.username+".txt")).then( success => {
      console.log( `Permissions changed your POD.`)
  }, err => console.log(err) );
}

function templatePermission(other, file){
  var textPer = "@prefix : <#>.\n"+
                "@prefix n0: <http://www.w3.org/ns/auth/acl#>.\n"+
                "@prefix n1: <http://xmlns.com/foaf/0.1/>.\n"+
                "@prefix c: </profile/card#>.\n"+
                "@prefix c0: <https://"+other+".solid.community/profile/card#>.\n\n"+
                ":ControlReadWrite\n"+
                  "\ta n0:Authorization;\n"+
                  "\tn0:accessTo <"+file+">;\n"+
                  "\tn0:agent c:me, c0:me;\n"+
                  "\tn0:mode n0:Control, n0:Read, n0:Write.\n"+
                ":Read\n"+
                  "\ta n0:Authorization;\n"+
                  "\tn0:accessTo <"+file+">;\n"+
                  "\tn0:agentClass n1:Agent;\n"+
                  "\tn0:mode n0:Read.\n"/*+
                ":ReadWrite\n"+
                  "\ta n0:Authorization;\n"+
                  "\tn0:accessTo <"+file+">;\n"+
                  "\tn0:agent c0:me;\n"+
                  "\tn0:mode n0:Read, n0:Write.\n"*/;
  return textPer;
}

async function communicationEstablished(receiver){
  var exists = false;
  await core.getAllResourcesInInbox(await core.getInboxUrl(userWebId)).then(files => {
    files.forEach(async (fileurl) => {
      if(fileurl.includes(receiver.username)){
        exists = true;
      }
    });
  } 
  );
  return exists;
}

// todo: this is an attempt to cleanly exit the chat, but this doesn't work at the moment
window.onunload = window.onbeforeunload = () => {
  if (semanticChat.isRealTime() && webrtc) {
    giveUp();
  }
};