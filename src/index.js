//const {Loader} = require('semantic-chat');
const auth = require('solid-auth-client');
const fc = require('solid-file-client');
const namespaces = require('../lib/namespaces');
const { default: data } = require('@solid/query-ldflex');
const Core = require('../lib/core');

const Personal = require('../lib/personal');
const Communication = require('../lib/communication');

//const WebRTC = require('../lib/webrtc');

const DataSync = require('../lib/datasync');

    
let dataSync = new DataSync(auth.fetch);
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

$('#open-btn').click(() => {
  /*
  var chatUrl = "CHAT_URL";
  var userWebId = "USER_WEB_ID";
  var firstId = "FIRST_ID";
  var userDataUrl = "USER_DATA_URL";
  dataSync.executeSPARQLUpdateForUser("https://trokentest.solid.community/inbox/" + "test.ttl", `INSERT DATA { <${chatUrl}> <${namespaces.schema}contributor> <${userWebId}>;
  <${namespaces.schema}recipient> <${firstId}>;
  <${namespaces.storage}storeIn> <${userDataUrl}>.}`);
  */
/*
 var messageUrl = "MESSAGE_URL2";
 var time = "TIME2";
 var psUsername = "PS_USERNAME2";
 var messageTx = "MESSAGE_TX2";

 dataSync.executeSPARQLUpdateForUser("https://trokentest.solid.community/inbox/" + "test.ttl", 
 `INSERT DATA {<${messageUrl}> a <${namespaces.schema}Message>;<${namespaces.schema}dateSent> <${time}>;<${namespaces.schema}givenName> <${psUsername}>; <${namespaces.schema}text> <${messageTx}>.}`);

 getNewMessage("https://trokentest.solid.community/inbox/" + "test.ttl", );
*/
var message = $('#data-name').val();
var a = $("#possible-people option:selected").val();
var receiver = core.getFriendOfList(personal.friendList, a);
comm.sendFirstMessage(personal, receiver);
});



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



async function getNewMessage(fileurl) {
  const deferred = Q.defer();
  const rdfjsSource = await rdfjsSourceFromUrl(fileurl, this.fetch);

  if (rdfjsSource) {
    const engine = newEngine();
    let messageFound = false;
    //const self = this;
    engine.query(`SELECT * {
        ?message a <${namespaces.schema}Message>;
          <${namespaces.schema}dateSent> ?time;
          <${namespaces.schema}givenName> ?username;
          <${namespaces.schema}text> ?msgtext.
      }`, {
        sources: [{
          type: 'rdfjsSource',
          value: rdfjsSource
        }]
      })
      .then(function(result) {
        result.bindingsStream.on('data', async function(result) {
          console.log(result);
          /*
          messageFound = true;
          result = result.toObject();
          const messageUrl = result['?message'].value;
          const messagetext = result['?msgtext'].value.split("/inbox/")[1].replace(/U\+0020/g, " ").replace(/U\+003A/g, ":");
          const author = result['?username'].value.replace(/U\+0020/g, " ");
          const time = result['?time'].value.split("/")[4];
          const inboxUrl = fileurl;
          deferred.resolve({
            inboxUrl,
            messagetext,
            messageUrl,
            author,
            time
          });
          */
        });

        result.bindingsStream.on('end', function() {
          if (!messageFound) {
            deferred.resolve(null);
          }
        });
      });
  } else {
    deferred.resolve(null);
  }

  return deferred.promise;
}



$("#possible-people-btn").click( async () => comm.loadMessages(personal.username));




