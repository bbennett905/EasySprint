//TODO when refreshing after login, everything is hidden
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

var db = firebase.database();

var docid = -1;
document.addEventListener('DOMContentLoaded', function() {
	// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
	// // The Firebase SDK is initialized and available here!
	if (!isLoggedIn) {
		document.getElementById('logged-in').style.display = 'none';
		document.getElementById('logged-out').style.display = 'block';
	} else {
		document.getElementById('logged-in').style.display = 'block';
		document.getElementById('logged-out').style.display = 'none';
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
			var max = 0;
			firebase.database().ref('docs/' + docid + '/people').once('value', function(snapshot) {
				snapshot.forEach(function(innerSnap) {
					if (parseInt(innerSnap.key) > max) {
						max = parseInt(innerSnap.key);
					}
				});
				max++;
				//max is the new id to use
				firebase.database().ref('docs/' + docid + '/people/' + max + '/name').set("Name");
				firebase.database().ref('docs/' + docid + '/people/' + max + '/email').set("test@example.com");
				firebase.database().ref('docs/' + docid + '/people/' + max + '/phone').set("867-5309");
			});
		};
		firebase.database().ref('docs/' + docid + '/people').once('value', buildPeopleTable);
		document.getElementById('userstories-add-btn').onclick = function() {
			var max = 0;
			firebase.database().ref('docs/' + docid +'/userStories').once('value', function(snapshot) {
				snapshot.forEach(function(innerSnap) {
					if (parseInt(innerSnap.key) > max) {
						max = parseInt(innerSnap.key);
					}
				});
				max++;
				firebase.database().ref('docs/' + docid + '/userStories/' + max + '/title').set("Unnamed User Story");
			});
		};
		firebase.database().ref('docs/' + docid + '/userStories').once('value', buildUserStoriesTable);
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
		para.innerHTML = "Add someone to set a scrum master!";
	}
	document.getElementById("doc-intro-master").appendChild(para);
}

var isPeopleUpdateRegistered = false;
function buildPeopleTable(snapshot) {
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

	var count = 0;
	snapshot.forEach(function(innerSnap) {
		count++;
		var n = document.createElement("input");
		n.id = "p-n-" + innerSnap.key;
		n.classList.add("user-input");
		n.classList.add("peoplelist-entry");
		n.readOnly = true;
		n.ondblclick = function() {
			this.readOnly=false;
		};
		n.onblur = function() {
			this.readOnly=true;
		};
		n.value = innerSnap.child('name').val();
		n.oninput = function () {
			firebase.database().ref('docs/' + docid + '/people/' + innerSnap.key + '/name').set(this.value);
		};
		var e = document.createElement("input");
		e.id = "p-e-" + innerSnap.key;
		e.classList.add("user-input");
		e.classList.add("peoplelist-entry");
		e.readOnly = true;
		e.ondblclick = function() {
			this.readOnly=false;
		};
		e.onblur = function() {
			this.readOnly=true;
		};
		e.value = innerSnap.child('email').val();
		e.oninput = function () {
			firebase.database().ref('docs/' + docid + '/people/' + innerSnap.key + '/email').set(this.value);
		};
		var p = document.createElement("input");
		p.id = "p-p-" + innerSnap.key;
		p.classList.add("user-input");
		p.classList.add("peoplelist-entry");
		p.readOnly = true;
		p.ondblclick = function() {
			this.readOnly=false;
		};
		p.onblur = function() {
			this.readOnly=true;
		};
		p.value = innerSnap.child('phone').val();
		p.oninput = function () {
			firebase.database().ref('docs/' + docid + '/people/' + innerSnap.key + '/phone').set(this.value);
		};
		var d = document.createElement("button");
		d.type = "button";
		d.classList.add("btn");
		d.classList.add("btn-danger");
		d.classList.add("btn-xs");
		d.classList.add("peoplelist-entry");
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
	if (count == 0) {
		people.innerHTML = "No one's on this team, add someone!";
	}
	if (!isPeopleUpdateRegistered) {
		firebase.database().ref('docs/' + docid + '/people').on('value', updatePeopleTable);
		isPeopleUpdateRegistered = true;
	}
}

var lastPeopleSize = 0;

function updatePeopleTable(snapshot) {
	var count = 0;
	snapshot.forEach(function(innerSnap) {
		count++;
	});
	if (count != lastPeopleSize) {
		//Need to rebuild table
		lastPeopleSize = count;
		buildPeopleTable(snapshot);
	} else {
		//Length is same, so no need to rebuild
		lastPeopleSize = count;
		snapshot.forEach(function(innerSnap) {
			var n = document.getElementById("p-n-" + innerSnap.key);
			n.value = innerSnap.child('name').val();
			var e = document.getElementById("p-e-" + innerSnap.key);
			e.value = innerSnap.child('email').val();
			var p = document.getElementById("p-p-" + innerSnap.key);
			p.value = innerSnap.child('phone').val();
		});
	}
}

var isUserStoriesUpdateRegistered = false;
function buildUserStoriesTable(snapshot) {
	var list = document.getElementById('userstories-list');
	list.innerHTML = "";
	//TODO progress bar for each US?
	snapshot.forEach(function(innerSnap) {
		//Title, notes, tasks, acceptance criteria
		var div = document.createElement('div');

		var title = document.createElement('h4');
		var titleInput = document.createElement("input");
		titleInput.id = "us-title-" + innerSnap.key;
		titleInput.classList.add("user-input");
		titleInput.ondblclick = function() {
			this.readOnly = false;
		};
		titleInput.onblur = function() {
			this.readOnly = true;
		};
		titleInput.placeholder = "No title";
		titleInput.value = innerSnap.child('title').val();
		titleInput.oninput = function () {
			firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/title').set(this.value);
		};
		title.appendChild(titleInput);
		div.appendChild(title);

		var notesPanel = document.createElement('div');
		notesPanel.classList.add("panel");
		notesPanel.classList.add("panel-default");
		var notesHead = document.createElement('div');
		notesHead.classList.add("panel-heading");
		notesHead.innerHTML = "Notes";
		var notesBody = document.createElement('div');
		notesBody.classList.add("panel-body");
		var notesInput = document.createElement('textarea');
		notesInput.classList.add("user-input");
		notesInput.id = "us-notes-" + innerSnap.key;
		notesInput.placeholder = "Any notes, links, references can be saved here";
		notesInput.datatype = "text";
		notesInput.readonly = true;
		notesInput.ondblclick = function() {
			this.readOnly = false;
		};
		notesInput.onblur = function() {
			this.readOnly = true;
		};
		notesInput.value = innerSnap.child('notes').val();
		notesInput.oninput = function () {
			firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/notes').set(this.value);
		};
		notesBody.appendChild(notesInput);
		notesPanel.appendChild(notesHead);
		notesPanel.appendChild(notesBody);
		div.appendChild(notesPanel);
		list.appendChild(div);
	});
	
	if (!isUserStoriesUpdateRegistered) {
		firebase.database().ref('docs/' + docid + '/userStories').on('value', updateUserStoriesTable);
		isUserStoriesUpdateRegistered = true;
	}
}

function updateUserStoriesTable(snapshot) {
	if (isUserStorySnapshotChanged(snapshot)) {
		buildUserStoriesTable(snapshot);
	} else {
		snapshot.forEach(function(innerSnap) {
			var title = document.getElementById("us-title-" + innerSnap.key);
			title.value = innerSnap.child('title').val();
			var title = document.getElementById("us-notes-" + innerSnap.key);
			title.value = innerSnap.child('notes').val();
		});
	}
}

var lastUserStoriesSize = 0;
var lastTasksSize = [];
var lastCriteriaSize = [];
function isUserStorySnapshotChanged(snapshot) {
	var count = 0;
	var tasksCountList = [];
	var criteriaCountList = [];
	snapshot.forEach(function(innerSnap) {
		count++;
		var taskCount = 0;
		innerSnap.child('tasks').forEach(function(snap) {
			taskCount++;
		});
		tasksCountList[count] = taskCount;
		var criteriaCount = 0;
		innerSnap.child('acceptanceCriteria').forEach(function(snap) {
			criteriaCount++;
		});
		criteriaCountList[count] = criteriaCount;
	});
	var isDifferent = false;
	if (lastUserStoriesSize != count || 
		lastTasksSize.length != tasksCountList.length ||
		lastCriteriaSize.length != criteriaCountList.length) {
		isDifferent = true;
	} else {
		for (var i = 0; i < lastTasksSize.length; i++) {
			if (lastTasksSize[i] != tasksCountList[i]) {
				isDifferent = true;
			}
		}
		for (var i = 0; i < lastCriteriaSize.length; i++) {
			if (lastCriteriaSize[i] != criteriaCountList[i]) {
				isDifferent = true;
			}
		}
	}

	lastTasksSize = tasksCountList;
	lastUserStoriesSize = count;
	lastCriteriaSize = criteriaCountList;
	return isDifferent;
}
