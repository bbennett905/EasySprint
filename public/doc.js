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
		document.getElementById('email-btn').onclick = function() {
			var max = 0;
			firebase.database().ref('docs/' + docid + '/emailadd').once('value', function(snapshot) {
				snapshot.forEach(function(snap) {
					if (parseInt(snap.key) > max) {
						max = parseInt(snap.key);
					}
				});
				max++;
				firebase.database().ref('docs/' + docid + '/emailadd/' + max)
					.set(document.getElementById('email-input').value);
				document.getElementById('email-input').value = "";
				$('#add-email-modal').modal('hide');
			});
		};
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
				firebase.database().ref('docs/' + docid + '/userStories/' + max + '/title').set("Name user story here");
			});
		};
		firebase.database().ref('docs/' + docid + '/userStories').once('value', buildUserStoriesTable);
		//Sets up the listener for anything that has to do with generating report data
		generateReport();
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
	nameCol.classList += "col-sm-4 col-xs-11";
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
		var ndiv = document.createElement("div");
		var ediv = document.createElement("div");
		var pdiv = document.createElement("div");
		var ddiv = document.createElement("div");
		ndiv.appendChild(n);
		ediv.appendChild(e);
		pdiv.appendChild(p);
		ddiv.appendChild(d);

		nameCol.appendChild(ndiv);
		emailCol.appendChild(ediv);
		phoneCol.appendChild(pdiv);
		delCol.appendChild(ddiv);
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
		titleInput.style.width = "85%";
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
		var delButton = document.createElement("button");
		delButton.type = "button";
		delButton.style = "float: right;";
		delButton.classList.add("btn");
		delButton.classList.add("btn-danger");
		delButton.classList.add("btn-xs");
		delButton.classList.add("peoplelist-entry");
		delButton.innerHTML = "<span class=\"glyphicon glyphicon-remove\"></span>";
		delButton.onclick = function() {
			db.ref('docs/' + docid + '/userStories/' + innerSnap.key).remove();
		};
		title.appendChild(delButton);
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
		notesInput.style = "height:50px;";
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

		//Each task has: title, (notes), estimated, actual, assign, progress, delete
		//			5			1		1	2	2		1
		//Then add task button
		var tasksPanel = document.createElement("div");
		tasksPanel.classList.add("panel");
		tasksPanel.classList.add("panel-default");
		var tasksHead = document.createElement("div");
		tasksHead.classList.add("panel-heading");
		var tasksHeadRow = document.createElement("div");
		tasksHeadRow.classList.add("row");
		var tasksHeadTitle = document.createElement("div");
		tasksHeadTitle.classList += "col-md-5 col-xs-9";
		tasksHeadTitle.innerHTML = "Tasks";
		var tasksHeadEst = document.createElement("div");
		tasksHeadEst.classList.add("col-xs-2");
		tasksHeadEst.innerHTML = "Estimated Time";
		var tasksHeadAct = document.createElement("div");
		tasksHeadAct.classList.add("col-sm-1");
		tasksHeadAct.classList.add("hidden-xs");
		tasksHeadAct.classList.add("hidden-sm");
		tasksHeadAct.innerHTML = "Actual Time";
		var tasksHeadAssign = document.createElement("div");
		tasksHeadAssign.classList.add("col-sm-2");
		tasksHeadAssign.classList.add("hidden-xs");
		tasksHeadAssign.classList.add("hidden-sm");
		tasksHeadAssign.innerHTML = "Assigned To";
		var tasksHeadProgress = document.createElement("div");
		tasksHeadProgress.classList.add("col-sm-1");
		tasksHeadProgress.classList.add("hidden-xs");
		tasksHeadProgress.classList.add("hidden-sm");
		tasksHeadProgress.innerHTML = "Status";
		var tasksHeadDel = document.createElement("div");
		tasksHeadDel.classList.add("col-xs-1");
		tasksHeadDel.innerHTML = "Del";
		tasksHeadRow.appendChild(tasksHeadTitle);
		tasksHeadRow.appendChild(tasksHeadEst);
		tasksHeadRow.appendChild(tasksHeadAct);
		tasksHeadRow.appendChild(tasksHeadAssign);
		tasksHeadRow.appendChild(tasksHeadProgress);
		tasksHeadRow.appendChild(tasksHeadDel);
		tasksHead.appendChild(tasksHeadRow);
		tasksPanel.appendChild(tasksHead);
		var tasksBody = document.createElement("div");
		tasksBody.classList.add("panel-body");
		//creation of each individual row
		innerSnap.child('tasks').forEach(function(snap) {
			var row = document.createElement("div");
			row.classList += "row";

			var taskTitle = document.createElement("div");
			taskTitle.classList += "col-md-5 col-xs-9";
			//task title column
			var titleInput = document.createElement("input");
			titleInput.id = "us-task-title-" + innerSnap.key + "-" + snap.key;
			titleInput.classList += "user-input";
			titleInput.readOnly = true;
			titleInput.ondblclick = function() {
				this.readOnly=false;
			};
			titleInput.onblur = function() {
				this.readOnly=true;
			};
			titleInput.value = snap.child('title').val();
			titleInput.oninput = function () {
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key + '/title').set(this.value);
			};
			titleInput.placeholder = "Task";
			titleInput.style = "width:100%;";
			taskTitle.appendChild(titleInput);
			//
			var taskEst = document.createElement("div");
			taskEst.classList += "col-xs-2";
			var estInput = document.createElement("input");
			estInput.id = "us-task-est-" + innerSnap.key + "-" + snap.key;
			estInput.classList += "user-input";
			estInput.readOnly = true;
			estInput.ondblclick = function() {
				this.readOnly=false;
			};
			estInput.onblur = function() {
				this.readOnly=true;
			};
			estInput.value = snap.child('estimatedTime').val();
			estInput.oninput = function () {
				var val = parseInt(this.value);
				if (isNaN(val)) {
					return;
				}
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key + '/estimatedTime').set(val);
			};
			//generate Estimated Time column
			estInput.placeholder = "#";
			estInput.style = "width:100%;";
			taskEst.appendChild(estInput);
			var taskAct = document.createElement("div");
			taskAct.classList += "col-sm-1 hidden-xs hidden-sm";
			var actInput = document.createElement("input");
			actInput.id = "us-task-act-" + innerSnap.key + "-" + snap.key;
			actInput.classList += "user-input";
			actInput.readOnly = true;
			actInput.ondblclick = function() {
				this.readOnly=false;
			};
			actInput.onblur = function() {
				this.readOnly=true;
			};
			actInput.value = snap.child('actualTime').val();
			actInput.oninput = function () {
				var val = parseInt(this.value);
				if (isNaN(val)) {
					return;
				}
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key + '/actualTime').set(val);
			};
			//Generate Actual time column
			actInput.placeholder = "#";
			actInput.style = "width:100%;";
			taskAct.appendChild(actInput);
			//generate aasigned dropdown button
			var taskAssign = document.createElement("div");
			taskAssign.classList += "col-sm-2 hidden-xs hidden-sm dropdown";
			var taskAssignButton = document.createElement("button");
			taskAssignButton.classList +=  "btn-xs btn-info bg-warning dropdown-toggle";
			taskAssignButton.type += "button";
			taskAssignButton.setAttribute("data-toggle", "dropdown");
			taskAssignButton.innerHTML ="Not Assigned <span></span>";
			taskAssignButton.id = "us-task-assign-" + innerSnap.key + "-" + snap.key;
			var taskAssignDropdown = document.createElement("ul");
			taskAssignDropdown.classList += "dropdown-menu";
			//generate names of users within dropdown

			var count = 0;
			firebase.database().ref('docs/' + docid + '/people').once('value', function(s) {
				s.forEach(function(otherSnap) {
					
					count++;
					var name = otherSnap.child('name').val();
					var id = otherSnap.key;
					var user = document.createElement("li");
					var aUser = document.createElement("a");
					aUser.innerHTML = name;
					aUser.onclick = function (ev) {
						firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key + '/assignedTo').set(parseInt(id));
					};
					user.setAttribute("id", id);
					user.appendChild(aUser);
					taskAssignDropdown.appendChild(user);
				});
				if (count = 0) {
					var name = "No users!";
					var user = document.createElement("li");
					var aUser = document.createElement("a");
					aUser.innerHTML = name;
					user.setAttribute("id", id);
					user.appendChild(aUser);
					taskAssignDropdown.appendChild(user);
				}
			});
			firebase.database().ref('docs/' + docid + '/people/' + snap.child('assignedTo').val()).once('value', function(s) {
				if (s.child('name').val() == null) {
					taskAssignButton.innerHTML = "Not Assigned";
				} else {
					taskAssignButton.innerHTML = s.child('name').val();
				}
			});

			taskAssign.appendChild(taskAssignButton);
			taskAssign.appendChild(taskAssignDropdown);

			//Generate Status Dropdown
			var taskProgress = document.createElement("div");
			taskProgress.classList += "col-sm-1 hidden-xs hidden-sm dropdown";
			var taskProgressButton = document.createElement("button");
			taskProgressButton.id = "us-task-progress-" + innerSnap.key + "-" + snap.key;
			taskProgressButton.classList += "btn-xs btn-info bg-info dropdown-toggle";
			taskProgressButton.type += "button";
			taskProgressButton.setAttribute("data-toggle","dropdown");
			taskProgressButton.innerHTML = "Status <span></span>";
			var taskProgressDropdown = document.createElement("ul");
			taskProgressDropdown.classList += "dropdown-menu";
			if (snap.child('progress').val() == 'complete') {
				taskProgressButton.classList = "btn-xs btn-success bg-active dropdown-toggle";
				taskProgressButton.innerHTML = "Completed <span class= \"caret></span>";
			} else if (snap.child('progress').val() == 'inprogress') {
				taskProgressButton.classList = "btn-xs btn-info bg-active dropdown-toggle";
				taskProgressButton.innerHTML = "In Progress <span class= \"caret></span>";
			} else if (snap.child('progress').val() == 'notstarted') {
				taskProgressButton.classList = "btn-xs btn-primary bg-active dropdown-toggle";
				taskProgressButton.innerHTML = "Not Started <span class= \"caret></span>";
			} else if (snap.child('progress').val() == 'failed') {
				taskProgressButton.classList = "btn-xs btn-danger bg-active dropdown-toggle";
				taskProgressButton.innerHTML = "Failed <span class= \"caret></span>";
			} else if (snap.child('progress').val() == 'needhelp') {
				taskProgressButton.classList = "btn-xs btn-warning bg-active dropdown-toggle";
				taskProgressButton.innerHTML = "Need Help <span class= \"caret></span>";
			}

			//Generate elements within dropdown
			//complete element of dropdown
			var complete = document.createElement("li");
			complete.classList += "bg-success";
			var aComplete = document.createElement("a");
			aComplete.innerHTML = "Complete";
			aComplete.onclick =function (ev) {
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key + '/progress').set("complete");
            };
			complete.appendChild(aComplete);

			//inProgress element of dropdown
			var inProgress = document.createElement("li");
			inProgress.classList += "bg-info";
			var aInProgress = document.createElement("a");
			aInProgress.innerHTML ="In Progress";
			aInProgress.onclick =function (ev) {
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key + '/progress').set("inprogress");
            };
			inProgress.appendChild(aInProgress);

			//help needed element of dropdown
			var helpNeeded = document.createElement("li");
			helpNeeded.classList += "bg-warning";
			var aHelpNeeded = document.createElement("a");
			aHelpNeeded.innerHTML = "Help Needed";
            aHelpNeeded.onclick =function (ev) {
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key + '/progress').set("needhelp");
            };
            helpNeeded.appendChild(aHelpNeeded);
			//not started element of dropdown
            var notStarted = document.createElement("li");
            notStarted.classList += "bg-primary";
            var aNotStarted = document.createElement("a");
            aNotStarted.innerHTML = "Not Started";
            aNotStarted.onclick =function (ev) {
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key + '/progress').set("notstarted");
            };
            notStarted.appendChild(aNotStarted);
			//failed element of dropdown
            var failed = document.createElement("li");
            failed.classList += "bg-danger";
            var aFailed = document.createElement("a");
            aFailed.innerHTML = "Failed";
            aFailed.onclick =function (ev) {
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key + '/progress').set("failed");
                
            };
            failed.appendChild(aFailed);

            taskProgressDropdown.appendChild(complete);
            taskProgressDropdown.appendChild(inProgress);
            taskProgressDropdown.appendChild(helpNeeded);
            taskProgressDropdown.appendChild(notStarted);
            taskProgressDropdown.appendChild(failed);

            taskProgress.appendChild(taskProgressButton);
            taskProgress.appendChild(taskProgressDropdown);

			var taskDel = document.createElement("div");
			taskDel.classList += "col-xs-1";
			var taskDelBtn = document.createElement("button");
			taskDelBtn.type = "button";
			taskDelBtn.classList.add("btn");
			taskDelBtn.classList.add("btn-danger");
			taskDelBtn.classList.add("btn-xs");
			taskDelBtn.classList.add("peoplelist-entry");
			taskDelBtn.innerHTML = "<span class=\"glyphicon glyphicon-remove\"></span>";
			taskDelBtn.onclick = function() {
				db.ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + snap.key).remove();
			};
			taskDel.appendChild(taskDelBtn);

			row.appendChild(taskTitle);
			row.appendChild(taskEst);
			row.appendChild(taskAct);
			row.appendChild(taskAssign);
			row.appendChild(taskProgress);
			row.appendChild(taskDel);
			tasksBody.appendChild(row);
		});

		tasksPanel.appendChild(tasksBody);
		var addBtn = document.createElement("button");
		addBtn.type = "button";
		addBtn.classList += "btn btn-success btn-block btn-sm";
		addBtn.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span> Add a Task";
		addBtn.onclick = function() {
			var max = 0;
			firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks').once('value', function(s) {
				s.forEach(function(snap) {
					if (parseInt(snap.key) > max) {
						max = parseInt(snap.key);
					}
				});
				max++;
				//max is the new id to use
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + max + '/title').set("Task Title");
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/tasks/' + max + '/progress').set("notstarted");
			});
		}
		tasksPanel.appendChild(addBtn);
		div.appendChild(tasksPanel);

		innerSnap.child('acceptanceCriteria').forEach(function(snap) {
			//Generate Acceptance Criteria Panel
			var criteriaPanel = document.createElement('div');
			criteriaPanel.classList.add("panel");
			criteriaPanel.classList.add("panel-default");
			var criteriaHead = document.createElement('div');
			criteriaHead.classList.add("panel-heading");
			criteriaHead.innerHTML = "Acceptance Criteria";
			var delCriteriaButton = document.createElement("button");
			delCriteriaButton.type = "button";
			delCriteriaButton.style = "float: right;";
			delCriteriaButton.classList.add("btn");
			delCriteriaButton.classList.add("btn-danger");
			delCriteriaButton.classList.add("btn-xs");
			delCriteriaButton.classList.add("peoplelist-entry");
			delCriteriaButton.innerHTML = "<span class=\"glyphicon glyphicon-remove\"></span>";
			delCriteriaButton.onclick = function() {
				db.ref('docs/' + docid + '/userStories/' + innerSnap.key + '/acceptanceCriteria/' + snap.key).remove();
			};
			criteriaHead.appendChild(delCriteriaButton);
			var criteriaBody = document.createElement('div');
			criteriaBody.classList.add("panel-body");
			var criteriaInput = document.createElement('textarea');
			criteriaInput.classList.add("user-input");
			criteriaInput.style = "height:50px;";
			criteriaInput.id = "us-criteria-" + innerSnap.key + "-" + snap.key;
			criteriaInput.placeholder = "Add any Acceptance Criteria here";
			criteriaInput.datatype = "text";
			criteriaInput.readonly = true;
			criteriaInput.ondblclick = function() {
				this.readOnly = false;
			};
			criteriaInput.onblur = function() {
				this.readOnly = true;
			};
			criteriaInput.value = snap.val();
			criteriaInput.oninput = function () {
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/acceptanceCriteria/' + snap.key).set(this.value);
			};
			criteriaBody.appendChild(criteriaInput);
			criteriaPanel.appendChild(criteriaHead);
			criteriaPanel.appendChild(criteriaBody);
			div.appendChild(criteriaPanel);
		});

        var addCriteria = document.createElement("button");
        addCriteria.type = "button";
        addCriteria.classList += "btn btn-success btn-block btn-sm";
        addCriteria.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span> Add an Acceptance Criteria";
        addCriteria.onclick = function() {
			var max = 0;
			firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/acceptanceCriteria').once('value', function(s) {
				s.forEach(function(snap) {
					if (parseInt(snap.key) > max) {
						max = parseInt(snap.key);
					}
				});
				max++;
				//max is the new id to use
				firebase.database().ref('docs/' + docid + '/userStories/' + innerSnap.key + '/acceptanceCriteria/' + max).set("Empty acceptance criteria");
			});
        };

        div.appendChild(addCriteria);

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
			innerSnap.child('tasks').forEach(function(snap) {
				var title = document.getElementById("us-task-title-" + innerSnap.key + "-" + snap.key);
				title.value = snap.child('title').val();
				var est = document.getElementById("us-task-est-" + innerSnap.key + "-" + snap.key);
				est.value = snap.child('estimatedTime').val();
				var act = document.getElementById("us-task-act-" + innerSnap.key + "-" + snap.key);
				act.value = snap.child('actualTime').val();
				var assign = document.getElementById("us-task-assign-" + innerSnap.key + "-" + snap.key);
				firebase.database().ref('docs/' + docid + '/people/' + snap.child('assignedTo').val()).once('value', function(s) {
					if (s.child('name').val() == null) {
						assign.innerHTML = "Not Assigned";
					} else {
						assign.innerHTML = s.child('name').val();
					}
				});
				var status = document.getElementById("us-task-progress-" + innerSnap.key + "-" + snap.key);
				if (snap.child('progress').val() == 'complete') {
					status.classList = "btn-xs btn-success bg-active dropdown-toggle";
                	status.innerHTML = "Completed <span class= \"caret></span>";
				} else if (snap.child('progress').val() == 'inprogress') {
					status.classList = "btn-xs btn-info bg-active dropdown-toggle";
                	status.innerHTML = "In Progress <span class= \"caret></span>";
				} else if (snap.child('progress').val() == 'notstarted') {
					status.classList = "btn-xs btn-primary bg-active dropdown-toggle";
                	status.innerHTML = "Not Started <span class= \"caret></span>";
				} else if (snap.child('progress').val() == 'failed') {
					status.classList = "btn-xs btn-danger bg-active dropdown-toggle";
                	status.innerHTML = "Failed <span class= \"caret></span>";
				} else if (snap.child('progress').val() == 'needhelp') {
					status.classList = "btn-xs btn-warning bg-active dropdown-toggle";
                	status.innerHTML = "Need Help <span class= \"caret></span>";
				}
			});
			innerSnap.child('acceptanceCriteria').forEach(function(snap) {
				var criteria = document.getElementById("us-criteria-" + innerSnap.key + "-" + snap.key);
				criteria.value = snap.val();
			});
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
function generatePeopleReportTable() {
	var reportDiv = document.getElementById("report");
    var peoplePanel = document.createElement("div");
    peoplePanel.classList.add("panel");
    peoplePanel.classList.add("panel-default");
    var peopleHead = document.createElement("div");
    peopleHead.classList.add("panel-heading");
    var peopleHeadRow = document.createElement("div");
    peopleHeadRow.classList.add("row");
    var peopleHeadTitle = document.createElement("div");
    peopleHeadTitle.classList.add("col-sm-4");
    peopleHeadTitle.innerHTML = "People";
    var peopleHeadComplete = document.createElement("div");
    peopleHeadComplete.classList.add("col-sm-2");
    peopleHeadComplete.innerHTML = "Completed Hours";
    var peopleHeadAct = document.createElement("div");
    peopleHeadAct.classList.add("col");
    peopleHeadAct.classList.add("hidden-xs");
    peopleHeadAct.classList.add("hidden-sm");
    peopleHeadAct.innerHTML = "Actual Time";
    var peopleHeadIncomplete = document.createElement("div");
    peopleHeadIncomplete.classList.add("col-sm-2");
	peopleHeadIncomplete.innerHTML ="Incomplete Hours";
    var peopleHeadFailed = document.createElement("div");
    peopleHeadFailed.classList.add("col-sm-2");
    peopleHeadFailed.innerHTML="Failed  Hours";

    peopleHeadRow.appendChild(peopleHeadTitle);
    peopleHeadRow.appendChild(peopleHeadComplete);
    peopleHeadRow.appendChild(peopleHeadIncomplete);
    peopleHeadRow.appendChild(peopleHeadFailed);
    peopleHeadRow.appendChild(peopleHeadAct);
    peoplePanel.appendChild(peopleHeadRow);
    //var tasksBody = document.createElement("div");
    //tasksBody.classList.add("panel-body");
    var peopleBody = document.createElement("div");
    peopleBody.classList.add("panel-body");
    var peopleRow = document.createElement("div");
    peopleRow.classList.add("row");
    var personName = document.createElement("div");
    personName.classList.add("col-sm-4");
    personName.classList.add("bg-primary");
    //insert name here
    personName.innerHTML ="Kevin";
    var personComplete = document.createElement("div");
    personComplete.classList.add("col-sm-2");
    personComplete.classList.add("bg-success");

    //insert complete hours here
    personComplete.classList.add("text-center");
    personComplete.innerHTML = "30";
    var personAct = document.createElement("div");
    personAct.classList.add("col");
    personAct.classList.add("bg-info");
    personAct.classList.add("text-center");
    //peopleHeadAct.classList.add("hidden-xs");
    //peopleHeadAct.classList.add("hidden-sm");
    //insert actual hours here
    personAct.innerHTML = "7";
    var personIncomplete = document.createElement("div");
    personIncomplete.classList.add("col-sm-2");
    personIncomplete.classList.add("bg-warning");
    personIncomplete.classList.add("text-center");
    //insert incomplete hours here
    personIncomplete.innerHTML ="14";
    var personFailed = document.createElement("div");
    personFailed.classList.add("col-sm-2");
    personFailed.classList.add("bg-danger");
    personFailed.classList.add("text-center");
    //insert failed hours here
    personFailed.innerHTML="3";
    peopleRow.appendChild(personName);
    peopleRow.appendChild(personComplete);
    peopleRow.appendChild(personIncomplete);
    peopleRow.appendChild(personFailed);
    peopleRow.appendChild(personAct);
    peopleBody.appendChild(peopleRow);


    peoplePanel.appendChild(peopleBody);
    reportDiv.appendChild(peoplePanel);
}

function generateReport() {
	firebase.database().ref('docs/' + docid + '/userStories').on('value', function(snapshot) {
		//Index is person ID, val is # hours
		var estHoursById = [];
		var estHoursCompleted = 0;
		var estHoursNotStarted = 0;
		var estHoursInProgress = 0;
		var estHoursNeedHelp = 0;
		var estHoursFailed = 0;
		var tasksCompleted = 0;
		var tasksNotStarted = 0;
		var tasksInProgress = 0;
		var tasksNeedHelp = 0;
		var tasksFailed = 0;

		snapshot.forEach(function(innerSnap) {
			//Looping through stories

			innerSnap.child('tasks').forEach(function(snap) {
				//Looping through tasks
				var hours = snap.child('estimatedTime').val(); //should be an int
				if (null == estHoursById[snap.child('assignedTo').val()]) {
					estHoursById[snap.child('assignedTo').val()] = 0;
				}
				estHoursById[snap.child('assignedTo').val()] += hours;
				if (snap.child('progress').val() == 'complete') {
					estHoursCompleted += hours;
					tasksCompleted++;
				} else if (snap.child('progress').val() == 'inprogress') {
					estHoursInProgress += hours;
					tasksInProgress++;
				} else if (snap.child('progress').val() == 'notstarted') {
					estHoursNotStarted += hours;
					tasksNotStarted++;
				} else if (snap.child('progress').val() == 'failed') {
					estHoursFailed += hours;
					tasksFailed++;
				} else if (snap.child('progress').val() == 'needhelp') {
					estHoursNeedHelp += hours;
					tasksNeedHelp++;
				}
			});
		});

		var completedTime = estHoursCompleted;
		var notCompletedTime = estHoursInProgress + estHoursNeedHelp + estHoursNotStarted;
		var failedTime = estHoursFailed;
		var completedTasks = tasksCompleted;
		var notCompletedTasks = tasksInProgress + tasksNeedHelp + tasksNotStarted;
		var failedTasks = tasksFailed;

		//TODO call functions to draw progressbars and such, using above data
		//	Progressbar for time
		generateTimeProgressbar(completedTime, notCompletedTime, failedTime);
		//	Progressbar for tasks
		generateTasksProgressbar(completedTasks, notCompletedTasks, failedTasks);
		//	Table breakdown of people
	});
}

function generateTimeProgressbar(completed, notcompleted, failed) {
	var total = completed + notcompleted + failed;
	var progress = document.createElement('div');
	progress.style.height = "40px";
	progress.classList += "progress";
	var progressCompleted = document.createElement('div');
	progressCompleted.classList += "progress-bar progress-bar-success";
	progressCompleted.style.width = ((completed / total) * 100) + "%";
	progressCompleted.innerHTML = "<h5>Completed</h5>";
	progress.appendChild(progressCompleted);
	if (failed > 0) {
		var progressFailed = document.createElement('div');
		progressFailed.classList += "progress-bar progress-bar-danger";
		progressFailed.style.width = ((failed / total) * 100) + "%";
		progressFailed.innerHTML = "<h5>Failed</h5>";
		progress.appendChild(progressFailed);
	}
	document.getElementById('progress-hours-title').innerHTML = "";
	document.getElementById('progress-hours-title').innerHTML = completed + "hr completed | " + failed + "hr failed | " + notcompleted + "hr not completed";
	document.getElementById('progress-hours').innerHTML = "";
	document.getElementById('progress-hours').appendChild(progress);
}


function generateTasksProgressbar(completed, notcompleted, failed) {
	var total = completed + notcompleted + failed;
	var progress = document.createElement('div');
	progress.style.height = "40px";
	progress.classList += "progress";
	var progressCompleted = document.createElement('div');
	progressCompleted.classList += "progress-bar progress-bar-success";
	progressCompleted.style.width = ((completed / total) * 100) + "%";
	progressCompleted.innerHTML = "<h5>Completed</h5>";
	progress.appendChild(progressCompleted);
	if (failed > 0) {
		var progressFailed = document.createElement('div');
		progressFailed.classList += "progress-bar progress-bar-danger";
		progressFailed.style.width = ((failed / total) * 100) + "%";
		progressFailed.innerHTML = "<h5>Failed</h5>";
		progress.appendChild(progressFailed);
	}
	document.getElementById('progress-tasks-title').innerHTML = "";
	document.getElementById('progress-tasks-title').innerHTML = completed + " tasks completed | " + failed + " tasks failed | " + notcompleted + " tasks not completed";
	document.getElementById('progress-tasks').innerHTML = "";
	document.getElementById('progress-tasks').appendChild(progress);
}
