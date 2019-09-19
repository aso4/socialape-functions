const functions = require('firebase-functions');
// gain access to db via sdk
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

// functions namespace
// req, res are args
exports.getScreams = functions.https.onRequest((req, res) => {
    // pass in name of collection. 
    // documentation: Cloud Firestore -> Read data -> Get data once
    admin.firestore().collection('screams').get().then(data => {
        let screams = [];
        data.forEach(doc => {
            // populate screams
            screams.push(doc.data());
        });
        // return as json object
        return res.json(screams);
    })
    // catch errors and log to console
    .catch(err => console.error(err));
});

exports.createScream = functions.https.onRequest((req, res) => {
    const newScream = {
        // body of request, property body in body
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    // access db
    admin.firestore()
    // access collection
        .collection('screams')
        // create/write
        .add(newScream)
        // return
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully`})
        })
        // catch error
        .catch(err => {
            res.status(500).json({ error: 'something went wrong'});
            console.error(err);
        });
});