checkCredentials();

function checkCredentials() {
	//alert("checkCredentials wurde aufgerufen!");
	//zu testzwecken: setze localstorage username & pw auf leer! --> zeige login screen immer an!
	localStorage.removeItem("username");
	//zu testzwecken: setze username --> gehe direkt in den home screen!
	//localStorage.setItem("username", "Kevin01");
	//localStorage.setItem("password", "secret");
	
	if(isEmpty(localStorage.getItem("username"))) {
	//im localstorage gibt es keinen Username --> gehe zum Login Screen 
	var newView = new steroids.views.WebView("html/login.html");
	steroids.layers.push(newView);
	
	}else{
	//im localstorage gibt es einen Username --> home screen muss geladen werden! (mit sync call!)
	}
}

function openRundenuebersicht(spielID) {
	//TODO PHIL:
	//hole daten f�r runden�bersicht f�r Spiel ID vom Server 
	//schreibe Runden�berischtsdaten in localstorage, damit "runden�bersicht" screen die richtigen Daten anzeigen kann
	var rundenuebersichtView = new steroids.views.WebView("html/rundenuebersicht.html");
	steroids.layers.push(rundenuebersichtView);
}

function openNeuesSpielScreen() {
	var neuesSpielView = new steroids.views.WebView("html/neuesSpiel.html");
	steroids.layers.push(neuesSpielView);
}

function sync() {
	var credentialsAvailable;
	if(isEmpty(localStorage.getItem("username"))) {
	//im localstorage gibt es keinen Username 
	credentialsAvailable = false;
	}else{
	//im localstorage gibt es einen Username 
	credentialsAvailable = true;
	}
	

//zu testzwecken: setze username & password im local storage (normalerweise geschieht das im login!)
	localStorage.setItem("username", "Kevin01");
	localStorage.setItem("password", "secret");

//Sync darf nur ausgef�hrt wrden, wenn nicht direkt zum Login screen weitergeleitet wird (username vorhanden ist!)
	if(credentialsAvailable){
	
	//alert("sync wurde aufgerufen");
	
	//Setze Usernamen
	$("#username_div").text(localStorage.getItem("username"));

	//lade Hauptmen�daten vom Server & f�gre die entsprechenden HTML Elemente hinzu
	fetchServerData();
	}
}

function fetchServerData() {
	//alert("fetchServerData aufgerufen");
	
	var v_username = localStorage.getItem("username");
	var v_password = localStorage.getItem("password");
	
	/*
	$.ajax( {
			url:serverURL + "user/sync",
			type:"POST",
			success:function(obj){handleServerData(obj);},
			error:function(obj){alert(JSON.stringify(obj));},
			username:v_username,
			passwort:v_password,
			data:"0123456789"
			}); 
	*/
	
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
	   handleServerData(tmpServerData);
}

function handleServerData(serverSyncData){
	//alert("handleServerData wurde aufgerufen"+JSON.stringify(serverSyncData));
	
	for(var i=0;i<serverSyncData.length;i++){
		//alert(JSON.stringify(serverSyncData[i]));
		//Pr�fe, ob Eintrag ein Spiel darstellt, bei dem der Nutzer dran ist: (aktiv & warten auf = benutzer)
		if(	serverSyncData[i].spielstatusName.name 		== "A" && 
			serverSyncData[i].wartenAuf.benutzername	== localStorage.getItem("username")
		){
		addActionRequirendGame(serverSyncData[i]);
		}
		//Pr�fe, ob Eintrag ein Spiel darstellt, bei dem auf den Gegner gewartet wird:
		else if (	serverSyncData[i].spielstatusName.name 		== "A" && 
					serverSyncData[i].wartenAuf.benutzername	!= localStorage.getItem("username")
		){
		addWaitingForGame(serverSyncData[i]);
		}
		//Pr�fe, ob Eintrag eine offene Duellanfrage darstellt: (Status "pending")
		else if (	serverSyncData[i].spielstatusName.name 		== "P" && 
					serverSyncData[i].wartenAuf.benutzername	== localStorage.getItem("username")
		){
		showDuelRequest(serverSyncData[i]);
		}
	}

}

function addActionRequirendGame(gameData){
	//alert("addActionRequirendGame wurde aufgerufen"+JSON.stringify(gameData));
	var enemy_username = getEnemyUsername(gameData);
	//f�ge HTML ein:
	$("#ActionRequiredGames_div").append("<div class='content-padded'><button class='topcoat-button--large center full custom_icon_button_left Rand2 textklein yourTurnButton' ontouchend ='openRundenuebersicht("+gameData.spielID+")' >Du bist an der Reihe gegen "+enemy_username+" SpielID: "+gameData.spielID+"</a></div>"
	);
}

function addWaitingForGame(gameData){
	//alert("addWaitingForGame wurde aufgerufen"+JSON.stringify(gameData));
	var enemy_username = getEnemyUsername(gameData);
	//f�ge HTML ein:
	$("#WaitingForGames_div").append("<div class='content-padded'><button class='topcoat-button--large--quiet center full custom_icon_button_left Rand1 textklein yourTurnButton' ontouchend='openRundenuebersicht("+gameData.spielID+")' >"+enemy_username+" SpielID: "+gameData.spielID+" </a></div>");

}

function getEnemyUsername(gameData){
	if (gameData.spieler1.benutzername == localStorage.getItem("username")){
		//Spieler 1 = User --> Spieler2 = Gegner
		return gameData.spieler2.benutzername;
		} else { //Spieler 1 ist nicht der user --> Spieler 1 ist der Gegner!
		return gameData.spieler1.benutzername;
		}
}

function showDuelRequest(gameData){
//alert("showDuelRequest wurde aufgerufen"+JSON.stringify(gameData));

	navigator.notification.confirm(      
	 gameData.spieler1.benutzername+" fordert dich zu einem Duell heraus!",//+"SpielID: "+gameData.spielID, // message    
     function(buttonIndex){
	 onConfirmDuelRequest(buttonIndex, gameData);
	 },           	// callback to invoke with index of button pressed       
	 "Duellanfrage",           			// title      
	 ['Annehmen','Ablehnen']   			// buttonLabels    
	 );
	 
}

function onConfirmDuelRequest(buttonIndex, gameData){
	//alert("gameData transferred"+JSON.stringify(gameData));

	var v_username = localStorage.getItem("username");
	var v_password = localStorage.getItem("password");
	
	switch (buttonIndex) {
		case 1: //Duell wurde angenommen!
		//Zeige button f�r dieses Spiel im Homescreen
		addActionRequirendGame(gameData);
		// best�tige Duellannahme bei Server
		//alert("TODO: Duellannahme bei Server best�tigt");
				
		$.ajax( {
			url:serverURL + "game/answerInvite/"+gameData.spielID,
			type:"POST",
			success:function(obj){alert("Duellannahme bei Server erfolgreich best�tigt!");},
			error:function(obj){alert("Fehler bei Best�tigung der Duellannahme"+JSON.stringify(obj));},
			username:v_username,
			passwort:v_password,
			data:"true"
			}); 
			
			break;
		case 2: //Duellanfrage wurde abgelehnt!
		//best�tige Duellablehnung bei Server
		//alert("TODO: Duellablehnung bei Server best�tigt");		
		$.ajax( {
			url:serverURL + "game/answerInvite/"+gameData.spielID,
			type:"POST",
			success:function(obj){alert("Duellablehnung bei Server erfolgreich best�tigt!");},
			error:function(obj){alert("Fehler bei Best�tigung der Duellablehnung"+JSON.stringify(obj));},
			username:v_username,
			passwort:v_password,
			data:"false"
			});
			break;
	}
}

function abmelden(){
//l�sche credentials in localstorage
localStorage.removeItem("username");
localStorage.removeItem("username");
//zeige login screen (neuladen der seite --> username nicht gesetzt --> Login �ffnet sich!
window.location.reload();

}


//sobald das Dokument rdy ist, sollen die Serverdaten geladen & das Dokument mit den Datenbef�llt werden
document.addEventListener("deviceready", sync, false);
document.addEventListener("resume", test, false);