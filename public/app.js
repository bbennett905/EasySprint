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
	
});

document.addEventListener('DOMContentLoaded', function() {
	// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
	// // The Firebase SDK is initialized and available here!
	if (!isLoggedIn) {
		document.getElementById('logged-in').style.display = 'none';
	}
});

var isWaiting = false;
var onUidDocsChanged = function (snapshot) {
	if (isWaiting) {
		return;
	}
	console.log("onuiddocschanged");
	document.getElementById('docslist').innerHTML = "";
	document.getElementById('docslist-add').innerHTML = "";
	document.getElementById('docslist-head').innerHTML = "Your docs:";
	var count = 0;

	var e = document.createElement("BUTTON");
	e.type = "button";
	e.classList.add("btn");
	e.classList.add("btn-primary");
	e.classList.add("btn-md");
	e.value = "Create a new doc";
	e.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span>";
	e.onclick = function() {
		db.ref('newDocs/' + firebase.auth().currentUser.uid).set(true);
	};

	document.getElementById('docslist-add').appendChild(e);

	snapshot.forEach(function (snapshot) {
		console.log("foreach")
		if (snapshot.val()) {
			var div = document.createElement("div");
			div.classList.add("btn-group");
			div.classList.add("btn-block");

			var button = document.createElement("BUTTON");
			button.type = "button";
			button.classList.add("btn");
			button.classList.add("btn-primary");
			button.classList.add("btn-block");
			button.classList.add("doc-button");
			button.onclick = function() {
				location.href = "doc.html#" + snapshot.key;
			};
			var delDoc = document.createElement("button");
			delDoc.type = "button";
			delDoc.classList.add("btn");
			delDoc.classList.add("btn-danger");
			delDoc.innerHTML = "<span class=\"glyphicon glyphicon-remove\"></span>";
			delDoc.onclick = function() {
				db.ref('docs/' + snapshot.key).remove();
			};
			count++;

			isWaiting = true;
			db.ref('docs/' + snapshot.key + "/title").once('value', function(innerSnap) {
				isWaiting = false;
				console.log("got title");
				button.value = innerSnap.val();
				button.innerHTML = innerSnap.val();
				div.appendChild(button);
				div.appendChild(delDoc);
				document.getElementById('docslist').appendChild(div);
			});
		}
	});
	
	if (count == 0) {
		document.getElementById('docslist-head').innerHTML = "You aren't in any docs, create one!";
	}
};	

var isLoggedIn = false;
/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */ 
var handleSignedInUser = function(user) {
	isLoggedIn = true;
	document.getElementById('logged-in').style.display = 'block';
	document.getElementById('logged-out').style.display = 'none';

	var uidRef = db.ref('users/' + firebase.auth().currentUser.uid);
	uidRef.on('value', onUidDocsChanged);
	document.getElementById('docslist').style.display = 'block';

	document.getElementById('user-name').innerHTML = user.displayName;
	document.getElementById('user-email').innerHTML = user.email;
	$('#sign-out').on('click', function() {
		console.log("sign out");
		firebase.auth().signOut();
	});
};

/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
	isLoggedIn = false;
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
