// FirebaseUI config.
function getUiConfig() {
	return {
		callbacks: {
			// Called when the user has been successfully signed in.
			signInSuccess: function(user, credential, redirectUrl) {
				handleSignedInUser(user);
				// Do not redirect.
				return false;
			}
		},
		// Opens IDP Providers sign-in flow in a popup.
		signInFlow: 'popup',
		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		]
	};
}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', getUiConfig());

//TODO when refreshing after login, everything is hidden
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

var db = firebase.database();

window.addEventListener('load', function() {
	document.getElementById('sign-out').addEventListener('click', function() {
		firebase.auth().signOut();
	});
	document.getElementById('test-buttona').addEventListener('click', function() {
		db.ref('newDocs/' + firebase.auth().currentUser.uid).set(true);
	});
	document.getElementById('test-buttonb').addEventListener('click', function() {
		db.ref('docs/1/users/fakeuid').set(true);
	});

	var numRows = 1;
	document.getElementById('add_row').addEventListener('click', function() {
		var table = document.getElementById('people-table');
		var row = table.insertRow(table.rows.length);
		var inputRow = table.rows[1];

		row.insertCell(0);
		row.insertCell(1).innerHTML = document.getElementById('people-table-input-name').value;
		row.insertCell(2).innerHTML = document.getElementById('people-table-input-mail').value;
		row.insertCell(3).innerHTML = document.getElementById('people-table-input-phone').value;
		
		/*document.getElementById('addr' + numRows).innerHtml = "<td>" + (numRows + 1) + 
			"</td><td><input name='name" + numRows + 
			"' type='text' placeholder='Name' class='form-control input-md'  /> </td><td><input  name='mail" + 
			numRows + "' type='text' placeholder='Mail'  class='form-control input-md'></td><td><input  name='mobile" +
			numRows + "' type='text' placeholder='Mobile'  class='form-control input-md'></td>";
		console.log(document.getElementById('tab_logic').innerHTML);
		document.getElementById('tab_logic').innerHTML += '<tr id="addr'+(numRows+1)+'"></tr>';
		console.log(document.getElementById('tab_logic').innerHTML);*/
		numRows++;
	});
	document.getElementById('delete_row').addEventListener('click', function() {
		if (numRows > 1) {
			var table = document.getElementById('people-table');
			table.deleteRow(table.rows.length - 1);
			numRows--;
		} else {
			//should give a warning or something here
		}
	});
});

document.addEventListener('DOMContentLoaded', function() {
	// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
	// // The Firebase SDK is initialized and available here!

	try {
		let app = firebase.app();
		let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
		document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
	} catch (e) {
		console.error(e);
		document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
	}
	
	document.getElementById('logged-in').style.display = 'none';
	document.getElementById('docslist').style.display = 'none';
});

var onUidDocsChanged = function (snapshot) {
	document.getElementById('docslist').innerHTML = "";
	document.getElementById('docslist-add').innerHTML = "";
	document.getElementById('docslist-head').innerHTML = "Your docs:";
	var count = 0;

	var e = document.createElement("BUTTON");
	e.type = "button";
	e.classList.add("btn");
	e.classList.add("btn-primary");
	e.classList.add("btn-sm");
	e.value = "Create a new doc";
	e.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span> Create Doc";
	e.onClick = function() {
		//TODO do something
	};
	document.getElementById('docslist-add').appendChild(e);
	

	snapshot.forEach(function (snapshot) {
		if (snapshot.val()) {
			e = document.createElement("BUTTON");
			e.type = "button";
			e.classList.add("btn");
			e.classList.add("btn-primary");
			e.classList.add("btn-block");
			e.value = snapshot.key; //TODO should be doc name
			e.innerHTML = snapshot.key;
			e.onClick = function() {
				//TODO do something
			};
			document.getElementById('docslist').appendChild(e);
			document.getElementById('docslist').innerHTML += "<br>";
			//innerHTML += snapshot.key + ", ";
			count++;
		}
	});
	
	if (count == 0) {
		document.getElementById('docslist-head').innerHTML = "You aren't in any docs, create one!";
	}
};	

/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */ 
var handleSignedInUser = function(user) {
	document.getElementById('logged-in').style.display = 'block';
	document.getElementById('logged-out').style.display = 'none';

	var uidRef = db.ref('users/' + firebase.auth().currentUser.uid);
	uidRef.on('value', onUidDocsChanged);
	document.getElementById('docslist').style.display = 'block';
};

/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
	document.getElementById('logged-in').style.display = 'none';
	document.getElementById('logged-out').style.display = 'block';

	ui.start('#firebaseui-auth-container', getUiConfig);

	var uidRef = db.ref('users/' + firebase.auth().currentUser.uid);
	uidRef.off('value', onUidDocsChanged);

	document.getElementById('docslist').innerHTML = "Loading your docs...";
	document.getElementById('docslist').style.display = 'none';
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
	user ? handleSignedInUser(user) : handleSignedOutUser();
});
