const functions = require('firebase-functions');
// gain access to db via sdk
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

// first arg, name of route
// 2nd arg, name of handler
app.get('/screams', (req, res) => {
    admin.firestore().collection('screams').get().then(data => {
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
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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

// app is container for all routes
// best practices:
// https://baseurl.com/api/
// or https://api.baseurl.com
exports.api = functions.https.onRequest(app);