var homescreenServerdata;

function checkCredentials() {
	//alert("checkCredentials wurde aufgerufen!");
	//zu testzwecken: setze localstorage username & pw auf leer! --> zeige login screen immer an!
	//localStorage.removeItem("username");
	var username = localStorage.getItem("username");
	//alert("checkCredentials wurde aufgerufen mit username: "+username);
	if(isEmpty(username)) {
	return false;
	}else{
	//im localstorage gibt es einen Username --> home screen muss geladen werden! (mit sync call!)
	return true;
	}
}

function openRundenuebersicht(spielID, positionInServerdata) {
	//alert("URL"+serverURL + "game/overview/" + spielID + "homescreenServerdata[positionInServerdata]:"+JSON.stringify(homescreenServerdata[positionInServerdata])+" position:"+positionInServerdata);
	
	//Schreibe Spieldaten in localstorage (f�r Fragescreen und enemy_username)
	localStorage.setItem("enemyUsername", getEnemyUsername(homescreenServerdata[positionInServerdata]) );
	localStorage.setItem("gameInfo", JSON.stringify(homescreenServerdata[positionInServerdata]) );
	
	//Markiere im localStorage, dass die Runden�bersichtdaten nicht neu geholt werden m�ssen
	localStorage.setItem("gameOverviewInitialize", true);
	
	//hole Serverdaten in localStroage & gehe in neuen Screen nur bei Erfolg! (aber wechsel in neuen Screen nicht in callback, sondern ausgelagert & durch event RundenuebersichtDataloaded initiiert, damit AJAX wiederverwendet werden kann.
	fetchRundenuebersichtData(spielID);		
}


function openNeuesSpielScreen() {
	var neuesSpielView = new steroids.views.WebView("html/neuesSpiel.html");
	steroids.layers.push(neuesSpielView);
}

function sync() {
	//TEST.
	//popEvent("popAll");
	
	var credentialsAvailable = checkCredentials();
	//var test_uname = localStorage.getItem("username");
	//alert("credentialsAvailable: "+credentialsAvailable+" username: "+test_uname);
	

//zu testzwecken: setze username & password im local storage (normalerweise geschieht das im login!)
	//localStorage.setItem("username", "Kevin01");	//Kevin01
	//localStorage.setItem("password", "secret"); //secret

//Sync darf nur ausgef�hrt werden, wenn username vorhanden ist!)
	if(credentialsAvailable){
	//Setze Usernamen 
	$("#username_div").text(localStorage.getItem("username"));

	//lade Hauptmen�daten vom Server & f�ge die entsprechenden HTML Elemente hinzu
	fetchServerData();
	}else{
		//kein username vorhanden --> gehe zum login screen
		//im localstorage gibt es keinen Username --> gehe zum Login Screen 
		var newView = new steroids.views.WebView("html/login.html");
		steroids.layers.push(newView);
	}
}

function fetchServerData() {
	//alert("fetchServerData aufgerufen");
	$.ajax( {
			url:serverURL + "user/sync",
			type:"POST",
			contentType:"text/plain",
			beforeSend:function(xhr){authHeader(xhr);},
			crossDomain:true,
			success:function(obj){handleServerData(obj);},
			error:function(obj){alert("Fehler beim holen der Hauptmen�-Spieldaten! "+JSON.stringify(obj));},
			data:"0123456789"
			}); 
	
	
	//zu testzwecken (Testdaten ohne Serveranbindung!)
var tmpServerData = 
		[
		//Pending Spiel 1, welches von Kevin02 als Duellanfrage vorliegt
		{
           "spielID": 1,
           "spieltypName":
           {
               "name": "M"
           },
           "spieler1":
           {
               "benutzername": "Kevin02"
           },
           "spieler2":
           {
               "benutzername": "Kevin01"
           },
           "sieger": null,
           "verlierer": null,
           "wartenAuf":
           {
               "benutzername": "Kevin01"
           },
           "aktuelleRunde": 1,
           "spielstatusName":
           {
               "name": "P"
           },
           "letzteAktivitaet": 1392739847000
       }, //Pending Spiel 2 , welches von Kevin02 als Duellanfrage vorliegt
	   {
           "spielID": 2,
           "spieltypName":
           {
               "name": "M"
           },
           "spieler1":
           {
               "benutzername": "Kevin02"
           },
           "spieler2":
           {
               "benutzername": "Kevin01"
           },
           "sieger": null,
           "verlierer": null,
           "wartenAuf":
           {
               "benutzername": "Kevin01"
           },
           "aktuelleRunde": 1,
           "spielstatusName":
           {
               "name": "P"
           },
           "letzteAktivitaet": 1392739847000
       },
	   //Aktives Spiel, bei dem Kevin02 bereits die erste & zweite Runde gespielt hat 
	   {
           "spielID": 3,
           "spieltypName":
           {
               "name": "M"
           },
           "spieler1":
           {
               "benutzername": "Kevin02"
           },
           "spieler2":
           {
               "benutzername": "Kevin01"
           },
           "sieger": null,
           "verlierer": null,
           "wartenAuf":
           {
               "benutzername": "Kevin01"
           },
           "aktuelleRunde": 2,
           "spielstatusName":
           {
               "name": "A"
           },
           "letzteAktivitaet": 1392739847000
       },
	    //Aktives Spiel gegen kevin02, bei dem Kevin01 die erste Runde bereits gespielt hat.
	   {
           "spielID": 4,
           "spieltypName":
           {
               "name": "M"
           },
           "spieler1":
           {
               "benutzername": "Kevin02"
           },
           "spieler2":
           {
               "benutzername": "Kevin01"
           },
           "sieger": null,
           "verlierer": null,
           "wartenAuf":
           {
               "benutzername": "Kevin02"
           },
           "aktuelleRunde": 1,
           "spielstatusName":
           {
               "name": "A"
           },
           "letzteAktivitaet": 1392739847000
       }];
	  // handleServerData(tmpServerData);
}

function handleServerData(serverSyncData){
	//alert("handleServerData wurde aufgerufen. Neue Serverdaten:"+JSON.stringify(serverSyncData));
	//schreibe sync Daten in localstorage
	homescreenServerdata = serverSyncData;
	
	//entferne aktuelle Buttons vom Screen (alle werden anhand der neuen Serverdaten neu hinzugef�gt!)
	$("#ActionRequiredGames_div").empty();
	$("#WaitingForGames_div").empty();
	$("#OpenDuelRequests_list_container").empty();
	
	for(var i=0;i<serverSyncData.length;i++){
		//alert(JSON.stringify(serverSyncData[i]));
		//Pr�fe, ob Eintrag ein Spiel darstellt, bei dem der Nutzer dran ist: (aktiv & warten auf = benutzer)
		if(	serverSyncData[i].spielstatusName.name 		== "A" && 
			serverSyncData[i].wartenAuf.benutzername	== localStorage.getItem("username")
		){
		addActionRequiredGame(serverSyncData[i], i);
		}
		//Pr�fe, ob Eintrag ein Spiel darstellt, bei dem auf den Gegner gewartet wird:
		else if (	serverSyncData[i].spielstatusName.name 		== "A" && 
					serverSyncData[i].wartenAuf.benutzername	!= localStorage.getItem("username")
		){
		addWaitingForGame(serverSyncData[i], i);
		}
		//Pr�fe, ob Eintrag eine eigene offene Duellanfrage darstellt: (Status "pending")
		else if (	serverSyncData[i].spielstatusName.name 		== "P" && 
					serverSyncData[i].wartenAuf.benutzername	== localStorage.getItem("username")
		){
		showDuelRequest(serverSyncData[i],i);
		}
		else if (	serverSyncData[i].spielstatusName.name 		== "P" && 
					serverSyncData[i].wartenAuf.benutzername	== getEnemyUsername(serverSyncData[i])
		//pr�fe, ob der Eintrag eine Duellanfrage darstellt, die noch von einem Gegner beantwortet werden muss! 
		){
		addOpenDuelRequest(serverSyncData[i]);
		}
	}

}

function addOpenDuelRequest(gameData) {
var enemy_username = getEnemyUsername(gameData);
$("#OpenDuelRequests_list_container").append('<li class="topcoat-list__item">'+enemy_username+'</li>');
}

function addActionRequiredGame(gameData, positionInServerData){
	//alert("addActionRequiredGame wurde aufgerufen"+JSON.stringify(gameData));
	var enemy_username = getEnemyUsername(gameData);
	//f�ge HTML ein:
	$("#ActionRequiredGames_div").append("<div class='content-padded'><button class='topcoat-button--large center full custom_icon_button_left Rand2 textklein yourTurnButton' ontouchend ='openRundenuebersicht("+gameData.spielID+","+positionInServerData+")' >Du bist an der Reihe gegen "+enemy_username+" SpielID: "+gameData.spielID+" </a></div>" 
	);
}

function addWaitingForGame(gameData, positionInServerData){
	//alert("addWaitingForGame wurde aufgerufen"+JSON.stringify(gameData));
	var enemy_username = getEnemyUsername(gameData);
	$("#WaitingForGames_div").append("<div class='content-padded'><button class='topcoat-button--large--quiet center full custom_icon_button_left Rand1 textklein yourTurnButton' ontouchend='openRundenuebersicht("+gameData.spielID+","+positionInServerData+")' >"+enemy_username+" SpielID: "+gameData.spielID+" </a></div>");
}

function getEnemyUsername(gameData){
	//alert("gameData in getEnemyUsername:"+JSON.stringify(gameData));
	if (gameData.spieler1.benutzername == localStorage.getItem("username")){
		//Spieler 1 = User --> Spieler2 = Gegner
		return gameData.spieler2.benutzername;
		} else { //Spieler 1 ist nicht der user --> Spieler 1 ist der Gegner!
		return gameData.spieler1.benutzername;
		}
}

function showDuelRequest(gameData, positionInServerData){
//alert("showDuelRequest wurde aufgerufen"+JSON.stringify(gameData));

	navigator.notification.confirm(      
	 gameData.spieler1.benutzername+" fordert dich zu einem Duell heraus!",//+"SpielID: "+gameData.spielID, // message    
     function(buttonIndex){
	 onConfirmDuelRequest(buttonIndex, gameData, positionInServerData);
	 },           	// callback to invoke with index of button pressed       
	 "Duellanfrage",           			// title      
	 ['Annehmen','Ablehnen']   			// buttonLabels    
	 );
	 
}

function onConfirmDuelRequest(buttonIndex, gameData, positionInServerData){
	//alert("gameData transferred"+JSON.stringify(gameData));

	switch (buttonIndex) {
		case 1: //Duell wurde angenommen!
		//Zeige button f�r dieses Spiel im Homescreen
		addActionRequiredGame(gameData, positionInServerData);
		// best�tige Duellannahme bei Server
		//alert("TODO: Duellannahme bei Server best�tigt");
				
		$.ajax( {
			url:serverURL + "game/answerInvite/"+gameData.spielID,
			type:"POST",
			contentType:"text/plain",
			beforeSend:function(xhr){authHeader(xhr);},
			crossDomain:true,
			success:function(obj){
			//alert("Duellannahme bei Server erfolgreich best�tigt!");
			},
			error:function(obj){
			alert("Fehler bei Best�tigung der Duellannahme"+JSON.stringify(obj));
			},
			data:"true"
			}); 
			
			break;
		case 2: //Duellanfrage wurde abgelehnt!
		//best�tige Duellablehnung bei Server
		//alert("TODO: Duellablehnung bei Server best�tigt");		
		$.ajax( {
			url:serverURL + "game/answerInvite/"+gameData.spielID,
			type:"POST",
			contentType:"text/plain",
			beforeSend:function(xhr){authHeader(xhr);},
			crossDomain:true,
			success:function(obj){
			//alert("Duellablehnung bei Server erfolgreich best�tigt!");
			},
			error:function(obj){alert("Fehler bei Best�tigung der Duellablehnung"+JSON.stringify(obj));},
			data:"false"
			});
			break;
	}
}

function abmelden(){
//l�sche credentials in localstorage
localStorage.removeItem("username");
localStorage.removeItem("password");
//zeige login screen (neuladen der seite --> username nicht gesetzt --> Login �ffnet sich!
window.location.reload();

}

function openRundenuebersichtScreen(){
	var rundenuebersichtView = new steroids.views.WebView("html/rundenuebersicht.html");
		steroids.layers.push(rundenuebersichtView);
}

function onVisibilityChange() {
    //alert("document.visibilityState: " + document.visibilityState);
    //alert("document.hidden: " + document.hidden);

	var docHidden = document.hidden;
	if(docHidden == false){
	//Wenn auf das Dokument zur�ckgekehrt wird, soll es aktualisiert werden
	//alert("onVisibilityChange wurde aufgerufen & sync wird aufgerufen!");
	sync();
	}else{
	//Wenn das Dokument verlassen wird, soll nichts getan werden!
	//alert("onVisibilityChange wurde aufgerufen, aber nichts wird getan!");
	}
 
}

//sobald die Runden�bersichtsdaten geladen sind, soll in den RundenuebersichtScreen navigiert werden!
document.addEventListener("RundenuebersichtDataloaded", openRundenuebersichtScreen, false);

//sobald das Dokument rdy ist, sollen die Serverdaten geladen & das Dokument mit den Datenbef�llt werden
document.addEventListener("deviceready", sync, false);

//Eventhandler f�r das aktualisieren beim "zur�ckkehren" auf den homescreen durch pop/popAll
document.addEventListener("visibilitychange", onVisibilityChange, false);





