//const {Loader} = require('semantic-chat');
const auth = require('solid-auth-client');
const fc = require('solid-file-client');
const namespaces = require('../lib/namespaces');
const { default: data } = require('@solid/query-ldflex');
const Core = require('../lib/core');

const Personal = require('../lib/personal');
const Communication = require('../lib/communication');

//const WebRTC = require('../lib/webrtc');

let refreshIntervalId;
let core = new Core(auth.fetch);
let personal = new Personal(core);
let comm = new Communication(auth.fetch);


$('.login-btn').click(() => {
  auth.popupLogin({ popupUri: 'https://solid.github.io/solid-auth-client/dist/popup.html' });
});

$('#logout-btn').click(() => {
  auth.logout();
});

$('#refresh-btn').click(checkForNotifications);

auth.trackSession(async session => {
  const loggedIn = !!session;

  if (loggedIn) {
    $('#chat-options').addClass('hidden');
    $('#loading-gif').removeClass('hidden');

    personal.loadNames(session.webId).then(name => {
      $('#user-name').text(name);
      $('#nav-login-btn').addClass('hidden');
    });

    personal.loadFriendList(session.webId).then(() => {
      $('#chat-options').removeClass('hidden');
      $('#loading-gif').addClass('hidden');
    });

    $('#user-menu').removeClass('hidden');
    $('#login-required').modal('hide');  

    await checkForNotifications();
    // refresh every 5 sec
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
    personal.clearInfo();
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
  
});

/**
 * This method updates the UI after a chat option has been selected by the user.
 */
function afterChatOption() {
  $('#chat-options').addClass('hidden');
  $('#how-it-works').addClass('hidden');
}

$('#new-btn').click(async () => { 
  if (personal.username) {
    afterChatOption();
    $('#possible-people').empty();
    for await (const friend of personal.friendList) {
        $('#possible-people').append('<option value='+friend.username+'>'+friend.username+'</option>');
    }
    
    $("#data-name").keydown(function (e) {
      if (e.keyCode == 13) {
        comm.sendMessage(personal, core);
      }
    });
    $('#new-chat-options').removeClass('hidden');
  } else {
    $('#login-required').modal('show');
  }
});

$('#start-new-chat-btn').click(async () => {
   await comm.sendMessage(personal, core);
});



/**
 * This method checks if a new move has been made by the opponent.
 * The necessarily data is stored and the UI is updated.
 * @returns {Promise<void>}
 */
async function checkForNotifications() {
  if($("#possible-people").val() != "")
    await comm.loadMessages(personal.username);
}

$('#clear-inbox-btn').click(async () => {
  await comm.clearInbox(core, personal);
});


$('.btn-cancel').click(() => {
  $('#chat').addClass('hidden');
  $('#new-chat-options').addClass('hidden');
  $('#join-chat-options').addClass('hidden');
  $('#continue-chat-options').addClass('hidden');
  $('#chat-options').removeClass('hidden');
  $('#how-it-works').removeClass('hidden');
});







$("#possible-people-btn").click( async () => comm.loadMessages(personal.username));




