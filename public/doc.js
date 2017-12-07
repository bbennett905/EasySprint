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
			taskAssign.classList += "col-sm-2 hidden-xs hidden-sm";
			// TODO dropdown, with built




			//Generate Status Dropdown
			var taskProgress = document.createElement("div");
			taskProgress.classList += "col-sm-1 hidden-xs hidden-sm dropdown";
			var taskProgressButton = document.createElement("button");
			taskProgressButton.classList += "btn-xs btn-info bg-info dropdown-toggle";
			taskProgressButton.type += "button";
			taskProgressButton.setAttribute("data-toggle","dropdown");
			taskProgressButton.innerHTML = "Status <span></span>";
			var taskProgressDropdown = document.createElement("ul");
			taskProgressDropdown.classList += "dropdown-menu";

			//Generate elements within dropdown
			//complete element of dropdown
			var complete = document.createElement("li");
			complete.classList += "bg-success";
			var aComplete = document.createElement("a");
			aComplete.innerHTML = "Complete";
			aComplete.onclick =function (ev) {
                taskProgressButton.classList = "btn-xs btn-active bg-success dropdown-toggle";
                taskProgressButton.innerHTML = "Complete <span class= \"caret></span>";

            };
			complete.appendChild(aComplete);

			//inProgress element of dropdown
			var inProgress = document.createElement("li");
			inProgress.classList += "bg-info";
			var aInProgress = document.createElement("a");
			aInProgress.innerHTML ="In Progress";
			aInProgress.onclick =function (ev) {
				taskProgressButton.classList = "btn-xs btn-info bg-info dropdown-toggle";
                taskProgressButton.innerHTML = "In Progress <span class= \"caret></span>";

            };
			inProgress.appendChild(aInProgress);

			//help needed element of dropdown
			var helpNeeded = document.createElement("li");
			helpNeeded.classList += "bg-warning";
			var aHelpNeeded = document.createElement("a");
			aHelpNeeded.innerHTML = "Help Needed";
            aHelpNeeded.onclick =function (ev) {
                taskProgressButton.classList = "btn-xs btn-warning bg-active dropdown-toggle";
                taskProgressButton.innerHTML = "Help Needed <span class= \"caret></span>";

            };
            helpNeeded.appendChild(aHelpNeeded);
			//not started element of dropdown
            var notStarted = document.createElement("li");
            notStarted.classList += "bg-primary";
            var aNotStarted = document.createElement("a");
            aNotStarted.innerHTML = "Not Started";
            aNotStarted.onclick =function (ev) {
                taskProgressButton.classList = "btn-xs btn-primary bg-active dropdown-toggle";
                taskProgressButton.innerHTML = "Not Started <span class= \"caret></span>";

            };
            notStarted.appendChild(aNotStarted);
			//failed element of dropdown
            var failed = document.createElement("li");
            failed.classList += "bg-danger";
            var aFailed = document.createElement("a");
            aFailed.innerHTML = "Failed";
            aFailed.onclick =function (ev) {
                taskProgressButton.classList = "btn-xs btn-danger bg-active dropdown-toggle";
                taskProgressButton.innerHTML = "Failed <span class= \"caret></span>";
            };
            failed.appendChild(aFailed);

            taskProgressDropdown.appendChild(complete);
            taskProgressDropdown.appendChild(inProgress);
            taskProgressDropdown.appendChild(helpNeeded);
            taskProgressDropdown.appendChild(notStarted);
            taskProgressDropdown.appendChild(failed);

            taskProgress.appendChild(taskProgressButton);
            taskProgress.appendChild(taskProgressDropdown);
			// TODO
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
			});
		}
		tasksPanel.appendChild(addBtn);
		div.appendChild(tasksPanel);
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
				// TODO assign, status
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
