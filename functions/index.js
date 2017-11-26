const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

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

exports.onNewDoc = functions.database.ref('/newDocs/{uid}').onWrite(event => {
	//event.params.uid
	//TODO figure out newdocid
	//TODO create/set: /docs/{newdocid}/users/{event.params.uid} = true
	//TODO create/set: /users/{event.params.uid}/{newdocid} = true
	//TODO delete: /newdocs/{uid}
	//TODO needs to return something?
});

exports.onAddUser = functions.database.ref('/docs/{docid}/users').onWrite(event => {
	const val = event.data.val();
	const uid = event.data.key;
	//TODO create/set: /users/{key}/{event.params.docid} = val
	//TODO needs to return something?
});
