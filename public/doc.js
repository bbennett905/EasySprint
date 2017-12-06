//TODO when refreshing after login, everything is hidden
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

var db = firebase.database();

var docid = -1;
document.addEventListener('DOMContentLoaded', function() {
	// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
	// // The Firebase SDK is initialized and available here!
	if (!isLoggedIn) {
		document.getElementById('logged-in').style.display = 'none';
	}
	docid = parseInt(window.location.hash.substring(1));
	if (isNaN(docid)) {
		docid = -1;
	}
	if (docid > -1) {
		document.getElementById('doc-body').style.display = 'block';
		document.getElementById('doc-tabs').style.display = 'block';
		document.getElementById('nodoc').style.display = 'none';
	} else {
		document.getElementById('nodoc').style.display = 'block';
		document.getElementById('doc-body').style.display = 'none';
		document.getElementById('doc-tabs').style.display = 'none';
	}

	if (docid > -1) {
		db.ref('docs/' + docid + '/title').on('value', function(snapshot) {
			document.getElementById('doc-title').value = snapshot.val();
		});
		document.getElementById('doc-title').oninput = function() {
			//TODO some kind of last-edited indictator
			firebase.database().ref('docs/' + docid + '/title').set(this.value)
		};
		db.ref('docs/' + docid + '/sprintOverview').on('value', function(snapshot) {
			document.getElementById('doc-intro-overview').value = snapshot.val();
		});
		document.getElementById('doc-intro-overview').oninput = function() {
			//TODO some kind of last-edited indictator
			firebase.database().ref('docs/' + docid + '/sprintOverview').set(this.value)
		};
		db.ref('docs/' + docid + '/risks').on('value', function(snapshot) {
			document.getElementById('doc-intro-risks').value = snapshot.val();
		});
		document.getElementById('doc-intro-risks').oninput = function() {
			//TODO some kind of last-edited indictator
			firebase.database().ref('docs/' + docid + '/risks').set(this.value)
		};
		db.ref('docs/' + docid + '/schedule').on('value', function(snapshot) {
			document.getElementById('doc-intro-meeting').value = snapshot.val();
		});
		document.getElementById('doc-intro-meeting').oninput = function() {
			//TODO some kind of last-edited indictator
			firebase.database().ref('docs/' + docid + '/schedule').set(this.value)
		};
		firebase.database().ref('docs/' + docid + '/people').on('value', scrumMaster);
		document.getElementById('doc-intro-master').onchange = function() {
			for (var i = 0; i < this.length; i++) {
				if (this[i].checked) {
					var id = parseInt(this[i].id);
					if (!isNaN(id)) {
						firebase.database().ref('docs/' + docid + '/master').set(id);
					}
					break;
				}
			}
		};
		firebase.database().ref('docs/' + docid + '/master').on('value', function(snapshot) {
			var id = snapshot.val();
			var form = document.getElementById('doc-intro-master');
			for (var i = 0; i < form.length; i++) {
				if (parseInt(form[i].id) == id) {
					form[i].checked = true;
				} else {
					form[i].checked = false;
				}
			}
		});
		document.getElementById('people-add-btn').onclick = function() {
			console.log("button");
			var count = 0;
			firebase.database().ref('docs/' + docid + '/people').once('value', function(snapshot) {
				snapshot.forEach(function(innerSnap) {
					count++;
				});
				//count is the new id to use
				firebase.database().ref('docs/' + docid + '/people/' + count + '/name').set("Name");
				firebase.database().ref('docs/' + docid + '/people/' + count + '/email').set("test@example.com");
				firebase.database().ref('docs/' + docid + '/people/' + count + '/phone').set("867-5309");
			});
		};
		firebase.database().ref('docs/' + docid + '/people').on('value', peopleTable);
	}
});

var isLoggedIn = false;
/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */ 
var handleSignedInUser = function(user) {
	isLoggedIn = true;
	document.getElementById('logged-in').style.display = 'block';
	document.getElementById('logged-out').style.display = 'none';

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

	document.getElementById('docslist').innerHTML = "Loading your docs...";
	document.getElementById('docslist').style.display = 'none';
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
	user ? handleSignedInUser(user) : handleSignedOutUser();
});

function scrumMaster(snapshot) {
	var count = 0;
	document.getElementById("doc-intro-master").innerHTML = "";
	var para = document.createElement("p");
	snapshot.forEach(function(innerSnap) {
		count++;
		var name = innerSnap.child('name').val();
		var id = innerSnap.key;

		var user = document.createElement("INPUT");
		user.setAttribute("type", "radio");

		user.setAttribute("id", id);
		user.setAttribute("name", "radio");

		//document.getElementById("doc-intro-master").appendChild(user);
		/*creating label for Text to Radio button*/
		
		var lblYes = document.createElement("LABEL");
		lblYes.appendChild(user);
		/*create text node for label Text which display for Radio button*/
		var textYes = document.createTextNode(" " + name);
		lblYes.appendChild(textYes);
		para.appendChild(lblYes);
		document.getElementById("doc-intro-master").appendChild(para);

		var spaceBr= document.createElement("br");
		para.appendChild(spaceBr);
	});
	if (count == 0) {
		para.innerHTML = "Add someone to set the scrum master";
	}
	document.getElementById("doc-intro-master").appendChild(para);
}

function peopleTable(snapshot) {
	//Each line needs: name(input), email(input), phone(input), delete(button)
	//SO: have a row: 4 4 3 1
	//on small screens: hide email+phone
	var people = document.getElementById('peoplelist');
	people.innerHTML = "";
	var row = document.createElement("div");
	row.classList += "row";

	var nameCol = document.createElement("div");
	nameCol.classList += "col-xs-4";
	var emailCol = document.createElement("div");
	emailCol.classList += "col-sm-4 hidden-xs";
	var phoneCol = document.createElement("div");
	phoneCol.classList += "col-sm-3 hidden-xs";
	var delCol = document.createElement("div");
	delCol.classList += "col-xs-1";

	snapshot.forEach(function(innerSnap) {
		//TODO on changed listeners
		var n = document.createElement("input");
		n.classList.add("user-input");
		n.readOnly = true;
		n.ondblclick = function() {
			this.readOnly=false;
		};
		n.onblur = function() {
			this.readOnly=true;
		};
		n.value = innerSnap.child('name').val();
		var e = document.createElement("input");
		e.classList.add("user-input");
		e.readOnly = true;
		e.ondblclick = function() {
			this.readOnly=false;
		};
		e.onblur = function() {
			this.readOnly=true;
		};
		e.value = innerSnap.child('email').val();
		var p = document.createElement("input");
		p.classList.add("user-input");
		p.readOnly = true;
		p.ondblclick = function() {
			this.readOnly=false;
		};
		p.onblur = function() {
			this.readOnly=true;
		};
		p.value = innerSnap.child('phone').val();
		//TODO delete button
		var d = document.createElement("button");
		d.type = "button";
		d.classList.add("btn");
		d.classList.add("btn-danger");
		d.classList.add("btn-xs");
		d.innerHTML = "<span class=\"glyphicon glyphicon-remove\"></span>";
		d.onclick = function() {
			db.ref('docs/' + docid + '/people/' + innerSnap.key).remove();
		};
		nameCol.appendChild(n);
		emailCol.appendChild(e);
		phoneCol.appendChild(p);
		delCol.appendChild(d);
	});

	row.appendChild(nameCol);
	row.appendChild(emailCol);
	row.appendChild(phoneCol);
	row.appendChild(delCol);
	people.appendChild(row);
}
