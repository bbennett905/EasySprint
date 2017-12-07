// ----- Firebase Cloud Functions -----
// Purpose of these, for this project, is to work with the database
//	in a way to ensure that the DB is secure and users can't access
//	other people's docs.

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/**
 * Called when a user requests to create a new doc by writing to the
 * 	newDocs/ table. Then, creates a new doc and gives the user access
 */
exports.onNewDoc = functions.database.ref('/newDocs/{uid}').onCreate(event => {
	const uid = event.params.uid;
	
	//Probably not the best way to do this, but I think it should work
	var largestId = 0;
	var newId = 0;

	//Do 3 things here:
	//	Add a new doc with uid as a user
	//	Add that doc to the user's editable docs
	//	Remove the newdocs entry
	return admin.database().ref('docs').once('value', function (snapshot) {
			snapshot.forEach(function(snapshot) {
				var id = snapshot.key;
				if (typeof id === 'string' || id instanceof String) {
					id = parseInt(id);
				}
				
				if (id > largestId) {
					largestId = id;
				}
			});
			newId = largestId + 1;
			console.log("onNewDoc: Creating new doc with id = " + newId);
		}).then(function(s) {
			return Promise.all([
				admin.database().ref('docs/' + newId + '/users/' + uid).set(true),
				admin.database().ref('docs/' + newId + '/title').set("Untitled Doc"),
				admin.database().ref('users/' + uid + '/' + newId).set(true),
				admin.database().ref('newDocs/' + uid).remove()	
			]);
		})
});

/**
 * Called when a new user is added to an existing doc - 
 *  adds that doc to the users table, allowing them to access it
 */
exports.onAddUser = functions.database.ref('/docs/{docid}/users/{uid}').onWrite(event => {
	const val = event.data.val();
	const uid = event.data.key;

	return admin.database().ref('users/' + uid + '/' + event.params.docid).set(val);
});

exports.onShare = functions.database.ref('docs/{docid}/emailadd/{index}').onWrite(event => {
	const docid = event.params.docid;
	const index = event.params.index;
	const email = event.data.val();

	return admin.auth().getUserByEmail(email)
		.then(function(userRecord) {
			const uid = userRecord.uid;
			return Promise.all([
				admin.database().ref('docs/' + docid + '/users/' + uid).set(true),
				admin.database().ref('docs/' + docid + '/emailadd/' + index).remove()
			]);
		});	
		/*.catch(function(error) {
			//probably an invalid email
		});*/
});
