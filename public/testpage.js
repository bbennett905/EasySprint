var db = firebase.database();

window.addEventListener('load', function() {
	if (firebase.auth().currentUser) {
		document.getElementById('testp').innerHTML += "<br>" + firebase.auth().currentUser.displayName;
	} else {
		document.getElementById('testp').innerHTML += "<br>You are not signed in!";
	}
});

//From testing, this seems to be the more reliable solution
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		document.getElementById('testp').innerHTML += "<br>AuthStateChanged with not null user";
	} else {
		document.getElementById('testp').innerHTML += "<br>AuthStateChanged with null user";
	}
});
