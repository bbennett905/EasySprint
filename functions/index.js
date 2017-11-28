const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//possible way to do this - user doesnt write, but when a user is added to a doc
// use firebase functions to add that doc to the user's table entry
// something like: - won't work for creating new doc, only adding users!
//    on db write to /docs/$docid/users/
//      foreach child of node
//        /users/ child.key /$docid = child.val
// may need to instead, have another 'table': 'newdocs'
//  entrys indexed as if array, has userid: true
//  allows anyone to write to it, and when functions sees a write to it:
//    create doc and add to users table: child(/$userid)
//  in client, listen for uid docs list change then open the new doc
//using both of those together should work
//needs users set to allow write from functions only

exports.onNewDoc = functions.database.ref('/newDocs/{uid}').onCreate(event => {
	const uid = event.params.uid;
	console.log("onNewDoc: uid=" + uid);
	
	//Probably not the best way to do this, but I think it should work
	var largestId = 0;
	var newId = 0;

	//Do 3 things here:
	//	Add a new doc with uid as a user
	//	Add that doc to the user's editable docs
	//	Remove the newdocs entry
	return admin.database().ref('docs').once('value', function (snapshot) {
			snapshot.forEach(function(snapshot) {
				//TODO is val actually a string
				var id = snapshot.key;
				if (typeof id === 'string' || id instanceof String) {
					id = parseInt(id);
				}
				
				console.log("onNewDoc: this ss.key=" + snapshot.key);
				console.log("onNewDoc: this ss.val=" + snapshot.val());
				console.log("onNewDoc: this id=" + id);
				if (id > largestId) {
					console.log("onNewDoc: id is greater");
					largestId = id;
				}
			});
			newId = largestId + 1;
			console.log("onNewDoc: newId=" + newId);
		}).then(function(s) {
			return Promise.all([
				admin.database().ref('docs/' + newId + '/users/' + uid).set(true),
				admin.database().ref('users/' + uid + '/' + newId).set(true),
				admin.database().ref('newDocs/' + uid).remove()	
			]);
		})
});

/**
 * Called when a new user is added to an existing doc - 
 *  adds that user to the users table
 */
exports.onAddUser = functions.database.ref('/docs/{docid}/users/{uid}').onWrite(event => {
	const val = event.data.val();
	const uid = event.data.key;
	console.log("onAddUser: val=" + val + ", uid=" + uid);
	//TODO this may be horribly wrong
	return admin.database().ref('users/' + uid + '/' + event.params.docid).set(val);
});
