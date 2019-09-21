const functions = require('firebase-functions');
// gain access to db via sdk
const admin = require('firebase-admin');
// calls express on same line
const app = require('express')();

admin.initializeApp();

var firebaseConfig = {
    apiKey: "AIzaSyD0fVBb1FO3I5U6I8CFTyZitBMGoIjyhE4",
    authDomain: "socialape-603.firebaseapp.com",
    databaseURL: "https://socialape-603.firebaseio.com",
    projectId: "socialape-603",
    storageBucket: "socialape-603.appspot.com",
    messagingSenderId: "521755814690",
    appId: "1:521755814690:web:7c6dd2e82862b26022537b"
};

const firebase = require('firebase');

// need this to authenticate
firebase.initializeApp(firebaseConfig);

// first arg, name of route
// 2nd arg, name of handler
app.get('/screams', (req, res) => {
    admin
      .firestore()
      .collection('screams')
      .orderBy('createdAt', 'desc')
      .get().then(data => {
        let screams = [];
        data.forEach(doc => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
                // node 6: ...doc.data() would get all data
            });
        });
        return res.json(screams);
    })
    .catch(err => console.error(err));
});

app.post('/scream', (req, res) => {
    // account for non-POST requests
    if (req.method !== 'POST') {
        return res.status(400).json({ error: 'Method not allowed'});
    }
    const newScream = {
        // body of request, property body in body
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString(),
        data: "test"
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

// signup route
app.post('/signup', (req, res) =>  {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    // TODO: validate data

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      .then(data => {
          // registration success
          return res.status(201).json({ message: `user ${data.user.uid} signed up successfully` })
      })
      .catch(err => {
          console.err(err);
          return res.status(500).json({ error: err.code });
      })
});
exports.api = functions.https.onRequest(app);
// change region
// exports.api = functions.region('europe-west1').https.onRequest(app);