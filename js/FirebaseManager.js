// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
const firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDFv40o-MFNy4eVfQzLtPG-ATkBUOHPaSI",
    authDomain: "condution-7133f.firebaseapp.com",
    databaseURL: "https://condution-7133f.firebaseio.com",
    projectId: "condution-7133f",
    storageBucket: "condution-7133f.appspot.com",
    messagingSenderId: "544684450810",
    appId: "1:544684450810:web:9b1caf7ed9285890fa3a43"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

async function getTasks(userID) {
    let docIds = [];
    await db.collection("users").doc(userID).collection("tasks").get().then(snapshot => {
        snapshot.forEach(doc => {
            docIds.push(doc.id);
        });
    }).catch(err => {
        console.log('Error getting documents', err);
    });
    return docIds;
}

async function getInboxTasks(userID) {
    let docIds = [];
    await db.collection("users").doc(userID).collection("tasks").where("project", "==", "").get().then(snapshot => {
        snapshot.forEach(doc => {
            docIds.push(doc.id);
        });
    }).catch(err => {
        console.log('Error getting documents', err);
    });
    return docIds;
}

async function getTaskInformation(userID, taskID) {
    let taskDoc = await db.collection("users").doc(userID).collection("tasks").doc(taskID).get()
    return taskDoc.data();
}

async function getProjectsandTags(userID) {
    let projectIDs = [];
    let tagIDs = [];
        await db.collection("users").doc(userID).collection("projects").get().then(snapshot => {
        snapshot.forEach(doc => {
            projectIDs.push(doc.id);
        });
    }).catch(err => {
        console.error('Error getting documents', err);
    });
    await db.collection("users").doc(userID).collection("tags").get().then(snapshot => {
        snapshot.forEach(doc => {
            tagIDs.push(doc.id);
        });
    }).catch(err => {
        console.error('Error getting documents', err);
    });
    //const projectIDs = db.collection("users").doc(userID).collection("projects").select();
    //const tags = db.collection("usnpm ers").doc(userID).collection("tags").select();

    let projectNames = {};
    let projectNamesReverse = {};
    let i;
    for (i=0; i<projectIDs.length; i++) {
        let projectDocumentName = "errorThing";
        await db.collection("users").doc(userID).collection("projects").doc(projectIDs[i]).get().then(function(doc) {
            if (doc.exists) {
                projectDocumentName = doc.data().name;
            } else {
                // doc.data() will be undefined in this case
                console.error("No such document!");
            }
        }).catch(function(error) {
            console.error("Error getting document:", error);
        });
        if (projectDocumentName !== "errorThing") {
            //console.log(projectDocumentName);
        } else {
            console.error("error, thread was either skipped, or name was null within document", projectIDs[i]);
        }
        /*
        projectIDs[i]

         */
        projectNames[projectIDs[i]]=projectDocumentName;
        projectNamesReverse[projectDocumentName]=projectIDs[i];
    }
    let tagcrapNames = [];
    let tagcrapNamesReverse = [];
    let j;
    for (j=0; j<tagIDs.length; j++) {
        let tagDocumentName = "errorThing";
        await db.collection("users").doc(userID).collection("tags").doc(tagIDs[j]).get().then(function(doc) {
            if (doc.exists) {
                tagDocumentName = doc.data().name;
            } else {
                // doc.data() will be undefined in this case
                console.error("No such document!");
            }
        }).catch(function(error) {
            console.error("Error getting document:", error);
        })
        if (tagDocumentName !== "errorThing") {
            //console.log(tagDocumentName);
        } else {
            console.error("Thread was either skipped, or name was null within document", tagIDs[j]);
        }
        tagcrapNames[tagIDs[j]]=tagDocumentName;
        tagcrapNamesReverse[tagDocumentName]=tagIDs[j];
    }
    return [[projectNames, projectNamesReverse], [tagcrapNames, tagcrapNamesReverse]];
}

async function modifyTask(userID, taskID, updateQuery){
    var taskData = "error";
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).get().then(function(doc) {

        if (doc.exists !== true) {
            throw "excuse me wth, why are you getting me to modify something that does not exist???? *hacker noises*";
        }
    });
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).update(updateQuery);
}

async function newTask(userID, nameParam, descParam, deferParam, dueParam, isFlaggedParam, isFloatingParam, projectParam, tagsParam, tz) {
    await db.collection("users").doc(userID).collection("tasks").add({
        // TODO: maybe accept a dictionary as a parameter instead of accepting everything as a parameter
        name:nameParam,
        desc:descParam,
        defer:deferParam,
        due:dueParam,
        isFlagged: isFlaggedParam,
        isFloating: isFloatingParam,
        project: projectParam,
        tags: tagsParam,
        timezone: tz,
        isComplete: false
    });
}

async function completeTask(userID, taskID) {
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).get().then(function(doc) {
        if (doc.exists!=true) {
            throw "Document not found. Please don't try to set documents that don't exist.";
        }
    });
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).update({
        isComplete: true
    });
}

async function deleteTask(userID, taskID) {
    db.collection("users").doc(userID).collection("tasks").doc(taskID).delete().then(function() {
        console.log("Task successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing task: ", error);
    });
}

async function deleteProject(userID, projectID) {
    db.collection("users").doc(userID).collection("projects").doc(projectID).delete().then(function() {
        console.log("Project successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing project: ", error);
    });
}

async function deleteTag(userID, tagID) {
    db.collection("users").doc(userID).collection("tag").doc(tagID).delete().then(function() {
        console.log("Tag successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing tag: ", error);
    });
}
