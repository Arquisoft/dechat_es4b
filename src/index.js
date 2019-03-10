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
let board;
let userDataUrl;
let oppWebId;
let chatsToJoin = [];
let chatName;
let refreshIntervalId;
let selectedTheme = 'default';
let core = new Core(auth.fetch);
let webrtc = null;

const fullColor = {
  'w': 'white',
  'b': 'black'
};
const possibleThemes = {
  default: {
    name: 'Classic',
    pieceTheme: 'web-app/img/chesspieces/wikipedia/{piece}.png',
    color: {
      black: '#b58863',
      white: '#f0d9b5'
    }
  },
  modern: {
    name: 'Modern',
    pieceTheme: 'web-app/img/chesspieces/freevector/{piece}.png',
    color: {
      black: 'deepskyblue',
      white: 'lightskyblue'
    }
  }
};

$('.login-btn').click(() => {
  auth.popupLogin({ popupUri: 'popup.html' });
});

$('#logout-btn').click(() => {
  auth.logout();
});

$('#refresh-btn').click(checkForNotifications);

$('#theme-btn').click(() => {
  const $modalBody = $('#theme-selector .modal-body');
  $modalBody.empty();

  const keys = Object.keys(possibleThemes);

  keys.forEach(k => {
    const theme = possibleThemes[k];

    const $radio = `<div class="form-check">
                <input type="radio" class="form-check-input" name="theme" id="${k}-theme" value="${k}" ${k === selectedTheme ? 'checked' : ''}>
                <label class="form-check-label" for="${k}-theme">${theme.name}</label>
              </div>`;

    $modalBody.append($radio);
  });

  $('#theme-selector').modal('show');
});

$('#save-theme-btn').click(() => {
  const newTheme = $('input[name="theme"]:checked').val();

  if (newTheme !== selectedTheme) {
    selectedTheme = newTheme;

    if (semanticChat) {
      setUpBoard(semanticChat);
    }
  }

  $('#theme-selector').modal('hide');
});

/**
 * This method does the necessary updates of the UI when the different Chat options are shown.
 */
function setUpForEveryChatOption() {
  $('#chat-loading').removeClass('hidden');
  $('#chat').removeClass('hidden');
}

/**
 * This method does the preparations after every Chat option has been set up.
 */
function setUpAfterEveryChatOptionIsSetUp() {

}

/**
 * This method sets up a new chess Chat.
 * @returns {Promise<void>}
 */
async function setUpNewChessChat() {
  setUpForEveryChatOption();

  const startPosition = getNewChatPosition();
  const realTime = getRealTime();
  semanticChat = await core.setUpNewChat(userDataUrl, userWebId, oppWebId, startPosition, chatName, dataSync, realTime);

  if (realTime) {
    let newMoveFound = false;
    webrtc = new WebRTC({
      userWebId,
      userInboxUrl: await core.getInboxUrl(userWebId),
      opponentWebId: oppWebId,
      opponentInboxUrl: await core.getInboxUrl(oppWebId),
      fetch: auth.fetch,
      initiator: true,
      onNewData: rdfjsSource => {
        core.checkForNewMoveForRealTimeChat(semanticChat, dataSync, userDataUrl, rdfjsSource, (san, url) => {
          semanticChat.loadMove(san, {url});
          board.position(semanticChat.getChess().fen());
          updateStatus();
          newMoveFound = true;
        });

        if (!newMoveFound) {
          core.checkForGiveUpOfRealTimeChat(semanticChat, rdfjsSource, (agentUrl, objectUrl) => {
            semanticChat.loadGiveUpBy(agentUrl);
            $('#real-time-opponent-quit').modal('show');
          });
        }
      },
      onCompletion: () => {
        $('#real-time-setup').modal('hide');
      },
      onClosed: (closedByUser) => {
        if (!closedByUser && !$('#real-time-opponent-quit').is(':visible')) {
          $('#real-time-opponent-quit').modal('show');
        }
      }
    });

    $('#real-time-setup .modal-body ul').append('<li>Invitation sent</li>');
    $('#real-time-setup').modal('show');
  }
  

  setUpBoard(semanticChat);
  setUpAfterEveryChatOptionIsSetUp();
}

/**
 * This method lets a player continue an existing chess chat.
 * @param chatUrl: the url of the chat to continue.
 * @returns {Promise<void>}
 */
async function continueExistingChessChat(chatUrl) {
  setUpForEveryChatOption();
  const loader = new Loader(auth.fetch);
  semanticChat = await loader.loadFromUrl(chatUrl, userWebId, userDataUrl);
  oppWebId = semanticChat.getOpponentWebId();

  setUpBoard(semanticChat);
  setUpAfterEveryChatOptionIsSetUp();
}

/**
 * This method sets up the chessboard.
 * @param semanticChat: the Semantic Chat which drives the board.
 * @returns {Promise<void>}
 */
async function setUpBoard(semanticChat) {
  const chat = semanticChat.getChess();

  // do not pick up pieces if the Chat is over
  // only pick up pieces for the side to move
  const onDragStart = function(source, piece, position, orientation) {
    const userColor = semanticChat.getUserColor();

    if (chat.chat_over() === true || userColor !== chat.turn()) {
      return false;
    }

    if (chat.chat_over() === true || (userColor !== chat.turn() &&
        ((userColor === 'w' && piece.search(/^b/) !== -1) ||
        (userColor === 'b' && piece.search(/^w/) !== -1)))) {
      return false;
    }
  };

  const onDrop = async function(source, target) {
    // see if the move is legal
    const move = semanticChat.doMove({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return 'snapback';

    await dataSync.executeSPARQLUpdateForUser(userDataUrl, move.sparqlUpdate);

    if (move.notification) {
      if (semanticChat.isRealTime()) {
        // TODO send notification over data channel
        webrtc.sendData(move.notification);
      } else {
        dataSync.sendToOpponentsInbox(await core.getInboxUrl(oppWebId), move.notification);
      }
    }

    updateStatus();
  };

  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  const onSnapEnd = function() {
    board.position(chat.fen());
  };

  const cfg = {
    draggable: true,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    position: chat.fen(),
    orientation: fullColor[semanticChat.getUserColor()],
    pieceTheme: possibleThemes[selectedTheme].pieceTheme
  };

  board = ChessBoard('board', cfg);

  $('#chat').removeClass('hidden');
  $('#chat-loading').addClass('hidden');

  $('.black-3c85d').css('background-color', possibleThemes[selectedTheme].color.black);
  $('.white-1e1d7').css('background-color', possibleThemes[selectedTheme].color.white);

  const oppName = await core.getFormattedName(oppWebId);

  $('#opponent-name').text(oppName);

  if (semanticChat.getName()) {
    $('#name-of-the-chat').text(semanticChat.getName());
  } else {
    $('#name-of-the-chat').text(semanticChat.getUrl());
  }

  updateStatus();
}

auth.trackSession(async session => {
  const loggedIn = !!session;

  if (loggedIn) {
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
    semanticChat = null;
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
        console.log('<option value='+friend.username+'>'+friend.name+'</option>');
    }

   $('#new-chat-options').removeClass('hidden');
   $('#data-url').prop('value', core.getDefaultDataUrl(userWebId));

  } else {
    $('#login-required').modal('show');
  }
});

$('#start-new-chat-btn').click(async () => {
  /*
  TO DELETE
  const dataUrl = $('#data-url').val();

  if (await core.writePermission(dataUrl, dataSync)) {
    $('#new-chat-options').addClass('hidden');
    oppWebId = $('#possible-opps').val();
    userDataUrl = dataUrl;
    chatName = $('#chat-name').val();
    afterChatSpecificOptions();
    setUpNewChessChat();
  } else {
    $('#write-permission-url').text(dataUrl);
    $('#write-permission').modal('show');
  }*/
  var message = $('#data-name').val();
  var a = $("#possible-people option:selected").val();
  var receiver = core.getFriendOfList(friendList, a);
  var intro1 = "<chatting with "+userWebId+">\n"
  var intro2 = "<chatting with "+receiver.card+">\n"
  try {
    dataSync.sendToOpponentsInbox(receiver.inbox, intro1 + message);
    dataSync.sendToOpponentsInbox("https://"+myUsername+".solid.community/inbox/", intro2 + message);
  } catch (e) {
    core.logger.error(`Could not send message to the user.`);
    core.logger.error(e);
  }


});

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

$('#join-chat-btn').click(async () => {
  if ($('#join-data-url').val() !== userWebId) {
    userDataUrl = $('#join-data-url').val();

    if (await core.writePermission(userDataUrl, dataSync)){
      $('#join-chat-options').addClass('hidden');
      const chatUrl = $('#chat-urls').val();

      let i = 0;

      while (i < chatsToJoin.length && chatsToJoin[i].chatUrl !== chatUrl) {
        i++;
      }

      const chat = chatsToJoin[i];

      // remove it from the array so it's no longer shown in the UI
      chatsToJoin.splice(i, 1);

      afterChatSpecificOptions();
      setUpForEveryChatOption();
      oppWebId = chat.opponentWebId;
      semanticChat = await core.joinExistingChessChat(chatUrl, chat.invitationUrl, oppWebId, userWebId, userDataUrl, dataSync, chat.fileUrl);

      if (semanticChat.isRealTime()) {
        webrtc = new WebRTC({
          userWebId,
          userInboxUrl: await core.getInboxUrl(userWebId),
          opponentWebId: oppWebId,
          opponentInboxUrl: await core.getInboxUrl(oppWebId),
          fetch: auth.fetch,
          initiator: false,
          onNewData: rdfjsSource => {
            let newMoveFound = false;

            core.checkForNewMoveForRealTimeChat(semanticChat, dataSync, userDataUrl, rdfjsSource, (san, url) => {
              semanticChat.loadMove(san, {url});
              board.position(semanticChat.getChess().fen());
              updateStatus();
              newMoveFound = true;
            });

            if (!newMoveFound) {
              core.checkForGiveUpOfRealTimeChat(semanticChat, rdfjsSource, (agentUrl, objectUrl) => {
                semanticChat.loadGiveUpBy(agentUrl);
                $('#real-time-opponent-quit').modal('show');
              });
            }
          },
          onCompletion: () => {
            $('#real-time-setup').modal('hide');
          },
          onClosed: (closedByUser) => {
            if (!closedByUser && !$('#real-time-opponent-quit').is(':visible')) {
              $('#real-time-opponent-quit').modal('show');
            }
          }
        });

        webrtc.start();

        $('#real-time-setup .modal-body ul').append('<li>Response sent</li><li>Setting up direct connection</li>');
        $('#real-time-setup').modal('show');
      }

      setUpBoard(semanticChat);
      setUpAfterEveryChatOptionIsSetUp();
    } else {
      $('#write-permission-url').text(userDataUrl);
      $('#write-permission').modal('show');
    }
  } else {
    console.warn('We are pretty sure you do not want to remove your WebID.');
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
 * This method updates the status of the chat in the UI.
 */
function updateStatus() {
  const statusEl = $('#status');
  let status = '';
  const chat = semanticChat.getChess();

  let moveColor = 'White';

  if (chat.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if (chat.in_checkmate() === true) {
    status = 'chat over, ' + moveColor + ' is in checkmate.';
  }

  // draw?
  else if (chat.in_draw() === true) {
    status = 'chat over, drawn position';
  }

  // chat still on
  else {
    status = moveColor + ' to move';

    // check?
    if (chat.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  statusEl.html(status);
}


/**
 * This method checks if a new move has been made by the opponent.
 * The necessarily data is stored and the UI is updated.
 * @returns {Promise<void>}
 */
async function checkForNotifications() {
  console.log('Checking for new notifications');

  const updates = await core.checkUserInboxForUpdates(await core.getInboxUrl(userWebId));

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
  });
}

/**
 * This method processes a response to an invitation to join a chat.
 * @param response: the object representing the response.
 * @param fileurl: the url of the file containing the notification.
 * @returns {Promise<void>}
 */
async function processResponseInNotification(response, fileurl) {
  const rsvpResponse = await core.getObjectFromPredicateForResource(response.responseUrl, namespaces.schema + 'rsvpResponse');
  let chatUrl = await core.getObjectFromPredicateForResource(response.invitationUrl, namespaces.schema + 'event');

  if (chatUrl) {
    chatUrl = chatUrl.value;

    if (semanticChat && semanticChat.getUrl() === chatUrl && semanticChat.isRealTime()) {
      if (rsvpResponse.value === namespaces.schema + 'RsvpResponseYes') {
        $('#real-time-setup .modal-body ul').append('<li>Invitation accepted</li><li>Setting up direct connection</li>');
        webrtc.start();
      }
    } else {
      let chatName = await core.getObjectFromPredicateForResource(chatUrl, namespaces.schema + 'name');
      const loader = new Loader(auth.fetch);
      const chatOppWebId = await loader.findWebIdOfOpponent(chatUrl, userWebId);
      const opponentsName = await core.getFormattedName(chatOppWebId);

      //show response in UI
      if (!chatName) {
        chatName = chatUrl;
      } else {
        chatName = chatName.value;
      }

      let text;

      if (rsvpResponse.value === namespaces.schema + 'RsvpResponseYes') {
        text = `${opponentsName} accepted your invitation to join "${chatName}"!`;
      } else if (rsvpResponse.value === namespaces.schema + 'RsvpResponseNo') {
        text = `${opponentsName} refused your invitation to join ${chatName}...`;
      }

      if (!$('#invitation-response').is(':visible')) {
        $('#invitation-response .modal-body').empty();
      }

      if ($('#invitation-response .modal-body').text() !== '') {
        $('#invitation-response .modal-body').append('<br/>');
      }

      $('#invitation-response .modal-body').append(text);
      $('#invitation-response').modal('show');

      dataSync.executeSPARQLUpdateForUser(await core.getStorageForChat(userWebId, chatUrl), `INSERT DATA {
    <${response.invitationUrl}> <${namespaces.schema}result> <${response.responseUrl}>}
  `);
    }

    dataSync.deleteFileForUser(fileurl);
  } else {
    console.log(`No chat url was found for response ${response.value}.`);
  }
}

$('#clear-inbox-btn').click(async () => {
  const resources = await core.getAllResourcesInInbox(await core.getInboxUrl(userWebId));

  resources.forEach(async r => {
    //if (await core.fileContainsChessInfo(r)) {
      dataSync.deleteFileForUser(r);
    //}
  });
});

function stopPlaying() {
  $('#chat').addClass('hidden');
  $('#chat-options').removeClass('hidden');
  $('#how-it-works').removeClass('hidden');
  semanticChat = null;
  board = null;

  if (webrtc) {
    setTimeout(() => {
      webrtc.stop();
      webrtc = null;
    }, 1000);
  }
}

function giveUp() {
  const result = semanticChat.giveUpBy(userWebId);

  dataSync.executeSPARQLUpdateForUser(userDataUrl, `INSERT DATA { ${result.sparqlUpdate} }`);
  webrtc.sendData(result.notification);
}

$('#stop-playing').click(() => {
  if (semanticChat.isRealTime()) {
    $('#real-time-quit').modal('show');
  } else {
    stopPlaying();
  }
});

$('#yes-quit-real-time-btn').click(async () => {
  $('#real-time-quit').modal('hide');

  giveUp();
  stopPlaying();
});

$('#custom-position-chk').change(() => {
  if ($('#custom-position-chk').prop('checked')) {
    $('#custom-position').removeClass('hidden');
  } else {
    $('#custom-position').addClass('hidden');
  }
});

$('.btn-cancel').click(() => {
  semanticChat = null;
  oppWebId = null;

  $('#chat').addClass('hidden');
  $('#new-chat-options').addClass('hidden');
  $('#join-chat-options').addClass('hidden');
  $('#continue-chat-options').addClass('hidden');
  $('#chat-options').removeClass('hidden');
  $('#how-it-works').removeClass('hidden');
});

$('#opp-quit-ok-btn').click(() => {
  $('#real-time-opponent-quit').modal('hide');

  stopPlaying();
});

/**
 * This method determines what the start position is of a new chess chat based on the what the player selected in the UI.
 * @returns {*}
 */
function getNewChatPosition() {
  if ($('#custom-position-chk').prop('checked')) {
    return $('#fen').val();
  } else {
    return null;
  }
};

function getRealTime() {
  return $('#real-time-chk').prop('checked');
};


async function getFriends() { 
  var subject = userWebId;
  var predicate = "http://xmlns.com/foaf/0.1/name";

  var friends = null;
  
  fc.fetchAndParse( subject ).then( store => {
      searchFriendsOnList(store.statements);
  }, err => console.log("could not fetch : "+err) ) ;

  /*
  if(friends != null)
    searchFriendsOnList(friends.statements, myUser);
    */
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
};

// todo: this is an attempt to cleanly exit the chat, but this doesn't work at the moment
window.onunload = window.onbeforeunload = () => {
  if (semanticChat.isRealTime() && webrtc) {
    giveUp();
  }
};