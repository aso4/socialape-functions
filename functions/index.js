const functions = require('firebase-functions');
// gain access to db via sdk
const admin = require('firebase-admin');
// calls express on same line
const app = require('express')();

admin.initializeApp();



const firebase = require('firebase');

const db = admin.firestore();

// need this to authenticate
firebase.initializeApp(firebaseConfig);

// first arg, name of route
// 2nd arg, name of handler
app.get('/screams', (req, res) => {
    db
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

    db
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

    // path
    db.doc(`/users/${newUser.handle}`).get()
    // promise
      .then((doc) => {
          if (doc.exists) {
              // problem
              return res.status(400).json({ handle: 'this handle is already taken' });
          } else {
            firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
          }
      })
      .then((data) => {
          // return authentication token so user can request more data
          return data.user.getIdToken();
      })
      .then((token) => {
          return res.status(201).json({ token });
      })
      .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: err.code });
      });

});
exports.api = functions.https.onRequest(app);
// change region
// exports.api = functions.region('europe-west1').https.onRequest(app);