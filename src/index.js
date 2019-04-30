const auth = require("solid-auth-client");
const Core = require("../lib/core");
const DataSync = require("../lib/datasync");
const Alerts = require("./alerts");
const NotificationManager = require("../lib/notificationmanager");
//const fc = require("solid-file-client");
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj.js";


const Personal = require("../lib/personal");

let refreshIntervalId;
let core = new Core(auth.fetch);
let personal = null;
let dataSync= new DataSync(auth.fetch);
let nm = new NotificationManager();
let alerts = new Alerts();

let recorder = null;
let audio = null;

/**
 *    UTILITY FUNCTIONS
 */

function afterChatOption(){
  $("#chat-options").addClass("hidden");
  $("#how-it-works").addClass("hidden");
}

function loading1(){
  $("#chat-options").addClass("hidden");
  $("#how-it-works").addClass("hidden");
  $("#loading-gif").removeClass("hidden"); 
}

function loading2(){
  $("#loading-gif").addClass("hidden"); 
  $("#chat-options").removeClass("hidden");
  $("#how-it-works").removeClass("hidden");
}


function moveScrollDown(){
  $("#addMessages").animate({ scrollTop: document.getElementById("addMessages").scrollHeight }, 1000);
  $("#addMessagesGroup").animate({ scrollTop: document.getElementById("addMessages").scrollHeight }, 1000);
}

function showMain(){
  $("#chat").addClass("hidden");
  $("#toHide").addClass("hidden");
  $("#join-chat-options").addClass("hidden");
  $("#continue-chat-options").addClass("hidden");
  $("#chat-options").removeClass("hidden");
  $("#how-it-works").removeClass("hidden");
}

function optionEnabled(option){
  $("#"+option+"-enabled").removeClass("hidden");
  $("#"+option+"-disabled").addClass("hidden");
}

function optionDisabled(option){
  $("#"+option+"-enabled").addClass("hidden");
  $("#"+option+"-disabled").removeClass("hidden");
}


/**
 *    CALLING FUNCTIONS
 */

async function loadMessagesFromChat() {
  var texto = $("#urlContact").text();
  if(texto !== "Select a contact to start chatting"){
    core.loadMessages(personal, texto, nm, false).then(() => {
      core.checkForNotifications(personal, nm);
    });
  }   
  else{
    core.checkForNotifications(personal, nm);
  }
}

async function changeStateOfEmojis(){
  var a = $("#emojis-enabled").attr("class");
  if(a.includes("hidden")){
    core.changeStateOfEmojis(true);  
    optionEnabled("emojis");
  }
  else {
    core.changeStateOfEmojis(false);
    optionDisabled("emojis");
  }
  await loadMessagesFromChat();
}

async function changeStateOfNotifications(){
  var a = $("#notifications-enabled").attr("class");
  if(a.includes("hidden")){
    $("#notification-box").removeClass("hidden");
    optionEnabled("notifications");
  }
  else {
    $("#notification-box").addClass("hidden");
    optionDisabled("notifications");
  }
}

function sendMessage(){
  var message = $("#data-name").val();
  var receiver = $("#urlContact").text();
  if (receiver.length !== 0){
	  $("#data-name").val("");
	  core.sendMessage(personal, receiver, message);
	  $("#emoji-panel").prop("hidden",true);
	  setTimeout(function(){ moveScrollDown(); }, 5000);
  }
  else
	  alert("Select a contact to send a message, please");
}

async function loadChat(name, urlgroup){	
	$("#drop_zone").removeClass("hidden");
	$("#contactName").text(name);
	if ( urlgroup !== null ) {
		core.loadMessages(personal, urlgroup, nm, false);
		$("#urlContact").text(urlgroup);
	} else {		
		core.loadMessages(personal, name, nm, false);
		$("#urlContact").text(name);
	}
	setTimeout(function(){ moveScrollDown(); }, 2000);
}

/**
 * START
 */

auth.trackSession(async (session) => {
  const loggedIn = !!session;

  if (loggedIn) {
    personal = new Personal(core);
    nm = new NotificationManager();
    loading1();

    personal.loadNames(session.webId).then((name) => {
      personal.loadInbox();
      $("#user-name").text(name);
      $("#nav-login-btn").addClass("hidden");
    });

    personal.loadFriendList().then(() => { 
      setTimeout(function(){
        loading2();
        $("#user-menu").removeClass("hidden");
        $("#login-required").modal("hide");  
      }, 1000);
    });

    await core.checkForNotifications(personal, nm);
    // refresh every 5 sec
    refreshIntervalId = setInterval(loadMessagesFromChat, 5000);
  } 
  else {
    $("#nav-login-btn").removeClass("hidden");
    $("#user-menu").addClass("hidden");
    showMain();
    
    if(personal !== null && personal.running){
      personal.clearInfo();
    }  
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
});

/**
 * BUTTONS CLICK
 */



$(".login-btn").click(() => {
  auth.popupLogin({ popupUri: "https://solid.github.io/solid-auth-client/dist/popup.html" });
});

$("#logout-btn").click(() => {
  auth.logout();
});


$("#refresh-btn").click(loadMessagesFromChat);

$("#test-btn").click(() => {
  if(personal !== null && personal.running){
    personal.reloadFriendList();
  }
});

$("#add-friend-menu").click(() => {
  if (personal !== null && personal.running) {
    afterChatOption();
    $("#manage-friends").modal("show");
  } else {
    $("#nav-login-btn").removeClass("hidden");
    $("#user-menu").addClass("hidden");
    $("#login-required").modal("show");
  }
});

$("#add-friend-button").click(() => {
  var friendMe = $("#friend-name").val();
  var platform = $("input[name=preg2]:checked").val();
  var toShare = "https://" + friendMe;
	switch ( platform ) {
		case "community":
			toShare += ".solid.community/profile/card#me";
			break;
		case "inrupt":
			toShare += ".inrupt.net/profile/card#me";
			break;
		default:
			toShare = friendMe;
			break;
	}
  core.addFriend(personal, toShare);
  $("#friend-name").val("");
  document.querySelectorAll("[name=preg2]").forEach((x) => x.checked = false);
  setTimeout(function(){;setTimeout(function(){;}, 500);}, 50);
});

/**
 * This method updates the UI after a chat option has been selected by the user.
 */


$("#new-btn").click(async () => { 
  if (personal !== null && personal.running) {
    afterChatOption();
    //$("#possible-people").empty();
	  $("#peopleToChat").empty();
    var i=0;
    core.getChatGroups(personal).then((groupNames) => {
      for(const chat of groupNames) {
        //$("#possible-people").append("<option value="+chat.file.url+">"+chat.name+"</option>");  
		$("#peopleToChat").append("<div id='clicable"+i+"' class='chat_list'>" +
              "<div class='chat_people'>" +
                "<div class='chat_img'> <img src='https://ptetutorials.com/images/user-profile.png' alt='sunil'> </div>" +
                "<div class='chat_ib'>" +
                  "<h5>"+chat.name+/*"<span class='chat_date'>Dec 25</span>*/"</h5>" +
                  /*"<p>Test, which is a new approach to have all solutions" +
                   " astrology under one roof.</p>" +*/
                "</div>" +
              "</div>" +
            "</div>");
		document.getElementById("clicable" + i).addEventListener("click", function(){loadChat(chat.name,chat.file.url)}, false);
		i++;
      }
    });
    for await (const friend of personal.friendList) {		
       // $("#possible-people").append("<option value="+friend.username+">"+friend.username+"</option>");
		$("#peopleToChat").append("<div id='clicable"+i+"' class='chat_list'>" +
              "<div class='chat_people'>" +
                "<div class='chat_img'> <img src='https://ptetutorials.com/images/user-profile.png' alt='sunil'> </div>" +
                "<div class='chat_ib'>" +
                  "<h5>"+friend.username+/*"<span class='chat_date'>Dec 25</span>*/"</h5>" +
                  /*"<p>Test, which is a new approach to have all solutions" +
                   " astrology under one roof.</p>" +*/
                "</div>" +
              "</div>" +
            "</div>");
		document.getElementById("clicable" + i).addEventListener("click", function(){loadChat(friend.username,null)}, false);
		i++;
    }
    $( "#possible-people" ).dropdown();
    
    $("#data-name").keydown(function (e) {
      if (e.keyCode === 13) {
        sendMessage();
      }
    });
    $("#toHide").removeClass("hidden");
	$("#drop_zone").addClass("hidden");
    $("#emoji-panel").removeClass("hidden");
  } else {
    $("#nav-login-btn").removeClass("hidden");
    $("#user-menu").addClass("hidden");
    $("#login-required").modal("show");
  }
});

$("#create-group").click(async () => { 
  if (personal !== null && personal.running) {
    afterChatOption();
    $("#check-people-group").empty();
    for await (const friend of personal.friendList) {
		
		$("#check-people-group").append("<span id='check-people-group2' class='button-checkbox'>" + 
											"<button type='button' class='btn' data-color='primary'>"+friend.username+"</button>"+
											"<input  id=\""+friend.username+"\" type='checkbox' class='hidden' />"+
                                      "</span>");
		
		
      // $("#check-people-group").append("<input class=\"form-check-input\" type=\"checkbox\" id=\""+friend.username+
                                      // "\"><label class=\"form-check-label\" for=\""+friend.username+"\">"+
                                      // friend.username+"</label><br>");
    }
	
    $('.button-checkbox').each(function () {

    // Settings
    var $widget = $(this),
        $button = $widget.find('button'),
        $checkbox = $widget.find('input:checkbox'),
        color = $button.data('color'),
        settings = {
            on: {
                icon: 'glyphicon glyphicon-check'
            },
            off: {
                icon: 'glyphicon glyphicon-unchecked'
            }
        };

    // Event Handlers
    $button.on('click', function () {
        $checkbox.prop('checked', !$checkbox.is(':checked'));
        $checkbox.triggerHandler('change');
        updateDisplay();
    });
    $checkbox.on('change', function () {
        updateDisplay();
    });
      
      // Actions
      function updateDisplay() {
        var isChecked = $checkbox.is(':checked');

        // Set the button's state
        $button.data('state', (isChecked) ? "on" : "off");

        // Set the button's icon
        $button.find('.state-icon')
          .removeClass()
          .addClass('state-icon ' + settings[$button.data('state')].icon);

        // Update the button's color
        if (isChecked) {
          $button
            .removeClass('btn-default')
            .addClass('btn-' + color + ' active');
        }
        else {
          $button
            .removeClass('btn-' + color + ' active')
            .addClass('btn-default');
        }
      }

      // Initialization
      function init() {

        updateDisplay();

        // Inject the icon if applicable
        if ($button.find('.state-icon').length == 0) {
          $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i> ');
        }
      }

      init();
      
      });
      
      $("#create-new-group").modal("show");
    } else {
      $("#nav-login-btn").removeClass("hidden");
      $("#user-menu").addClass("hidden");
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
  //$("#create-new-group").addClass("hidden");
  // CREAR EL GRUPO AQUI
  var nameGroup = $("#group-name").val();
  if(friendsGroup.length > 0){
    if(nameGroup.length > 0 && nameGroup.trim().length > 0){
		  core.createGroup(personal, friendsGroup);
    }
    else{
      alerts.errorGroupCreated("Error creating new group", "Wrong name");
    }
  }
  else{
    alerts.errorGroupCreated("Error creating new group", "No friends selected");
  }
  $("#group-name").val("");
});




$("#start-new-chat-btn").click(async () => {
	sendMessage();
});




$("#clear-inbox-btn").click(async () => {
  $("#all-inbox-to-remove").empty();
  for (var file of personal.myInbox) {
    if(file.url.includes("group_")){
      var group = personal.getGroupByMyUrl(file.url);
      $("#all-inbox-to-remove").append(
            "<input class=\"form-check-input\" type=\"checkbox\" id=\""+file.label+"\">"
              + "<label class=\"form-check-label\" for=\""+file.label+"\">"
                + file.label + "  (Group: "+group.name+")</label><br>");
    }
    else{
      $("#all-inbox-to-remove").append(
        "<input class=\"form-check-input\" type=\"checkbox\" id=\""+file.label+"\">"
          +"<label class=\"form-check-label\" for=\""+file.label+"\">"+file.label+"</label><br>");
    }
    
  }
  $("#inbox-files").modal("show");
});

$("#select-all").click(async () => {
  $(":checkbox").prop("checked", true);
});

$("#remove-selected-files").click(async () => {
  var urls = new Array();
  for (var file of personal.myInbox) {
    if($("input[id=\""+file.label+"\"]").prop("checked")){
      urls.push(file.label);
    }
  }
  personal.clearInbox(dataSync, urls).then((i) => {
    personal.loadInbox(true);
    alerts.alertCountRemovedFromInbox(i);
  });
});



$("#goBack").click(() => {
	showMain();
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

$("#sendFiles").click(() => {
	console.log("Hola");
});

$("#share-friend-button").click(() => {
	var friendMe = $("#share-name").val();
	var platform = $("input[name=preg1]:checked").val();
	var toShare = "https://" + friendMe;
	switch ( platform ) {
		case "community":
			toShare += ".solid.community/profile/card#me";
			break;
		case "inrupt":
			toShare += ".inrupt.net/profile/card#me";
			break;
		default:
			toShare = friendMe;
			break;
	}
	var receiver = $("#contactName").text();
	$("#share-name").val("");
	document.querySelectorAll('[name=preg1]').forEach((x) => x.checked = false);
	core.sendContact(personal,receiver,toShare);
});

$("#inr").change(() => {
	$("#share-name").removeClass("hidden");
});

$("#oth").change(() => {
	$("#share-name").removeClass("hidden");
});

$("#comm").change(() => {
	$("#share-name").removeClass("hidden");
});

$("#inr2").change(() => {
	$("#friend-name").removeClass("hidden");
});

$("#oth2").change(() => {
	$("#friend-name").removeClass("hidden");
});

$("#comm2").change(() => {
	$("#friend-name").removeClass("hidden");
});

$("#sendContact").click(() => {
	$("#share-friend").modal("show");
});

$("#change-chat-image").click(() => {
	$("#backgrounds").empty();
	$("#changeeee").modal("show");
	var img = new Array();
	img.push("src/img/backgrounds/1.jpg");
	img.push("src/img/backgrounds/2.png");
	img.push("src/img/backgrounds/3.jpg");
	img.push("src/img/backgrounds/4.jpg");
	img.push("src/img/backgrounds/5.jpg");
	for ( var i=0; i<img.length; i++ ){
		$("#backgrounds").append("<img class='selectionOfBackground' id='selectedImage" + i + "' src='" + img[i] + "' alt='"+i+"'>");
	}
});

$(".selectionOfBackground")

$("#sendUbication").click(() => {
	
	$("#map").empty();
	
	$("#share-ubication").modal("show");
	
	navigator.geolocation.getCurrentPosition(getPosicion.bind(this), verErrores.bind(this));
	
	function getPosicion(posicion){
        var longitud = posicion.coords.longitude; 
        var latitud = posicion.coords.latitude; 
		var map = new Map({
			target: 'map',
			layers: [
				new TileLayer({
					source: new XYZ({
						url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					})
				})
			],
			view: new View({
				projection: 'EPSG:900913',
				center: fromLonLat(
					[longitud, latitud],
					'EPSG:900913'
				),
				zoom: 15
			})		
		});	
		var ubicationToShare = "data/ubication:" +longitud + "," + latitud;
		$("#ubicationLongLat").text(ubicationToShare);
	}
    function verErrores(error){
		var mensaje = "";
        switch(error.code) {
        case error.PERMISSION_DENIED:
            mensaje = "El usuario no permite la petición de geolocalización"
            break;
        case error.POSITION_UNAVAILABLE:
            mensaje = "Información de geolocalización no disponible"
            break;
        case error.TIMEOUT:
            mensaje = "La petición de geolocalización ha caducado"
            break;
        case error.UNKNOWN_ERROR:
            mensaje = "Se ha producido un error desconocido"
            break;
        }
		if ( mensaje !== "" )
			console.log(mensaje);

    }
});

$("#share-ubication-button").click( () => {
	var ubicationToShare = $("#ubicationLongLat").text();
	$("#ubicationLongLat").text("");
	var receiver = $("#urlContact").text();
	core.storeUbication(personal,receiver,ubicationToShare);
});


$("#enable-emojis").click(() => {
	changeStateOfEmojis();
});

$("#enable-notifications").click(() => {
	changeStateOfNotifications();
});

$('.button-checkbox').each(function () {

        // Settings
        var $widget = $(this),
            $button = $widget.find('button'),
            $checkbox = $widget.find('input:checkbox'),
            color = $button.data('color'),
            settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            };

        // Event Handlers
        $button.on('click', function () {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();
        });
        $checkbox.on('change', function () {
            updateDisplay();
        });

        // Actions
        function updateDisplay() {
            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $button.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $button.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$button.data('state')].icon);

            // Update the button's color
            if (isChecked) {
                $button
                    .removeClass('btn-default')
                    .addClass('btn-' + color + ' active');
            }
            else {
                $button
                    .removeClass('btn-' + color + ' active')
                    .addClass('btn-default');
            }
        }

        // Initialization
        function init() {

            updateDisplay();

            // Inject the icon if applicable
            if ($button.find('.state-icon').length == 0) {
                $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i> ');
            }
        }
        init();
    });


//Images sharing (here for some time)

function dropped(e){
	e.preventDefault();
	var files = e.dataTransfer.files;
	var receiver = $("#urlContact").text();
	for ( var f=0; f<files.length; f++){
		var fileType = files[f].name;
		if ( fileType.endsWith(".gif") || fileType.endsWith(".mp3") || fileType.endsWith(".mp4") 
			|| fileType.endsWith(".png") || fileType.endsWith(".jpg") 
			|| fileType.endsWith(".jpeg")) {
			var reader = new FileReader();
			reader.onload = async function (event){
				if ( fileType.endsWith(".mp3") )
					core.storeAudio(personal,receiver,event.target.result);
				else if ( fileType.endsWith(".mp4") )
					core.storeVideo(personal,receiver,event.target.result);
				else
					core.storePhoto(personal,receiver,event.target.result);
			};
			reader.readAsDataURL(files[f]);
		}
	}
}

function start(){
	var drop = document.getElementById("toHide");
	
	drop.addEventListener("dragenter",function(e){
		e.preventDefault();
	}, false);
	
	drop.addEventListener("dragover", function(e){
		e.preventDefault();
	}, false);
	
	drop.addEventListener("drop", dropped, false);
}

// $("#sendContact").click(() => {
	// recordStop();
// });

window.addEventListener("load", start, false);

// The other way to share-friend

$('#sendFiles').on('change', function() {
    var files = this.files;
	var receiver = $("#urlContact").text();
    for ( var f=0; f<files.length; f++){
		var fileType = files[f].name;
		console.log(fileType);
		if ( fileType.endsWith(".gif") || fileType.endsWith(".mp3") || fileType.endsWith(".mp4") 
			|| fileType.endsWith(".png") || fileType.endsWith(".jpg") 
			|| fileType.endsWith(".jpeg")) {
			var reader = new FileReader();
			reader.onload = async function (event){
				if ( fileType.endsWith(".mp3") )
					core.storeAudio(personal,receiver,event.target.result);
				else if ( fileType.endsWith(".mp4") )
					core.storeVideo(personal,receiver,event.target.result);
				else
					core.storePhoto(personal,receiver,event.target.result);
			};
			reader.readAsDataURL(files[f]);
		}
	}    
});
