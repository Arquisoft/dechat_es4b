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


$('.login-btn').click(() => {
  auth.popupLogin({ popupUri: 'popup.html' });
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
    refreshIntervalId = setInterval(checkForNotifications, 5000);
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

async function sendMessage(){
  var message = $('#data-name').val();
  var a = $("#possible-people option:selected").val();
  var receiver = core.getFriendOfList(friendList, a);
  var intro1 = "<chatting with "+userWebId+">\n"
  var intro2 = "<chatting with "+receiver.card+">\n"
  try {
    dataSync.sendToOpponentsInbox(receiver.inbox, intro1 + message);
    dataSync.sendToOpponentsInbox("https://"+myUsername+".solid.community/inbox/", intro2 + message);
    document.getElementById("data-name").value = "";
    if($("#sent-messages").val()=="")
      $("#sent-messages").val(message);
    else
	    $("#sent-messages").val($("#sent-messages").val() + "\n" + message);
    //dataSync.createEmptyFileForUser("https://"+myUsername+".solid.community/inbox/"+receiver.username+".ttl");
    //dataSync.executeSPARQLUpdateForUser("https://"+myUsername+".solid.community/inbox/"+receiver.username+".ttl", 'INSERT DATA {'+message+'}');
  } catch (e) {
    core.logger.error(`Could not send message to the user.`);
    core.logger.error(e);
  }
}

$('#join-btn').click(async () => {
  if (userWebId) {
    afterChatOption();
    $('#join-chat-options').removeClass('hidden');
    $('#join-data-url').prop('value', core.getDefaultDataUrl(userWebId));
    $('#join-looking').addClass('hidden');

    if (chatsToJoin.length > 0) {
      $('#join-loading').addClass('hidden');
      $('#join-form').removeClass('hidden');
      const $select = $('#chat-urls');
      $select.empty();

      chatsToJoin.forEach(chat => {
        let name = chat.name;

        if (!name) {
          name = chat.chatUrl;
        }

        $select.append($(`<option value="${chat.chatUrl}">${name} (${chat.realTime ? `real time, ` : ''}${chat.opponentsName})</option>`));
      });
    } else {
      $('#no-join').removeClass('hidden');
    }
  } else {
    $('#login-required').modal('show');
  }
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

  const updates = await core.checkUserInboxForUpdates(await core.getInboxUrl(userWebId));
/*
  updates.forEach(async (fileurl) => {
    let newMoveFound = false;
    // check for new moves
    await core.checkForNewMove(semanticChat, userWebId, fileurl, userDataUrl, dataSync, (san, url) => {
      semanticChat.loadMove(san, {url});
      board.position(semanticChat.getChess().fen());
      updateStatus();
      newMoveFound = true;
    });

    if (!newMoveFound) {
      // check for acceptances of invitations
      const response = await core.getResponseToInvitation(fileurl);

      if (response) {
        processResponseInNotification(response, fileurl);
      } else {
        // check for chats to join
        const chatToJoin = await core.getJoinRequest(fileurl, userWebId);

        if (chatToJoin) {
          chatsToJoin.push(await core.processChatToJoin(chatToJoin, fileurl));
        }
      }
    }
  
  });*/
}

$('#clear-inbox-btn').click(async () => {
  const resources = await core.getAllResourcesInInbox(await core.getInboxUrl(userWebId));

  resources.forEach(async r => {
    //if (await core.fileContainsChessInfo(r)) {
      dataSync.deleteFileForUser(r);
    //}
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

// todo: this is an attempt to cleanly exit the chat, but this doesn't work at the moment
window.onunload = window.onbeforeunload = () => {
  if (semanticChat.isRealTime() && webrtc) {
    giveUp();
  }
};