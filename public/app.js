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
	var count = 0;
	snapshot.forEach(function (snapshot) {
		if (snapshot.val()) {
			document.getElementById('docslist').innerHTML += snapshot.key + ", ";
			count++;
		}
	});
	if (count == 0) {
		document.getElementById('docslist').innerHTML = "You aren't in any docs, create one!";
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
