// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

var firebaseConfig = {
    apiKey: "AIzaSyDFv40o-MFNy4eVfQzLtPG-ATkBUOHPaSI",
    authDomain: "condution-7133f.firebaseapp.com",
    databaseURL: "https://condution-7133f.firebaseio.com",
    projectId: "condution-7133f",
    storageBucket: "condution-7133f.appspot.com",
    messagingSenderId: "544684450810",
    appId: "1:544684450810:web:9b1caf7ed9285890fa3a43"
};

const fields = {
    NAME: "name",
    DESC: "desc",
    DEFER: "defer",
    FLAGGED: "isFlagged",
    FLOATING: "isFloating",
    PROJECT: "project",
    TAGS: "tags",
    TIMEZONE: "timezone"
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

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
};

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
};

async function getTaskInformation(userID, taskID) {
    let taskDoc = await db.collection("users").doc(userID).collection("tasks").doc(taskID).get()
    return taskDoc.data();
};

async function getProjectsandTags(userID) {
    let projectIDs = [];
    let tagIDs = [];
        await db.collection("users").doc(userID).collection("projects").get().then(snapshot => {
        snapshot.forEach(doc => {
            projectIDs.push(doc.id);
        });
    }).catch(err => {
        console.log('Error getting documents', err);
    });
    await db.collection("users").doc(userID).collection("tags").get().then(snapshot => {
        snapshot.forEach(doc => {
            tagIDs.push(doc.id);
        });
    }).catch(err => {
        console.log('Error getting documents', err);
    });
    //const projectIDs = db.collection("users").doc(userID).collection("projects").select();
    //const tags = db.collection("usnpm ers").doc(userID).collection("tags").select();

    let projectcrapNames = {};
    let projectcrapNamesReverse = {};
    let i;
    for (i=0; i<projectIDs.length; i++) {
        let projectDocumentName = "errorThing";
        await db.collection("users").doc(userID).collection("projects").doc(projectIDs[i]).get().then(function(doc) {
            if (doc.exists) {
                projectDocumentName = doc.data().name;
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
        if (projectDocumentName != "errorThing") {
            //console.log(projectDocumentName);
        } else {
            console.log("error, thread was either skipped, or name was null within document", projectIDs[i]);
        }
        /*
        projectIDs[i]

         */
        projectcrapNames[projectIDs[i]]=projectDocumentName;
        projectcrapNamesReverse[projectDocumentName]=projectIDs[i];
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
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        })
        if (tagDocumentName != "errorThing") {
            //console.log(tagDocumentName);
        } else {
            console.log("error, thread was either skipped, or name was null within document", tagIDs[j]);
        }
        tagcrapNames[tagIDs[j]]=tagDocumentName;
        tagcrapNamesReverse[tagDocumentName]=tagIDs[j];
    }
    return [[projectcrapNames, projectcrapNamesReverse], [tagcrapNames, tagcrapNamesReverse]];
}

async function modifyTask(userID, taskID, param, newVal) {
    var taskData = "error";
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).get().then(function(doc) {
        if (doc.exists == true) {
            taskData = doc.data();
        } else {
            throw "excuse me wth why are you gettingeddd me to modify something that does not exist???? *hacker noises*";
        }
    });
    console.log(taskData);
    switch(param) {
        case fields.NAME:
            taskData.name = newVal;
            break;
        case fields.DESC:
            taskData.desc = newVal;
            break;
        case fields.DEFER:
            taskData.defer = newVal;
            break;
        case fields.FLAGGED:
            taskData.isFlagged = newVal;
            break;
        case fields.FLOATING:
            taskData.isFloating = newVal;
            break;
        case fields.PROJECT:
            taskData.project = newVal;
            break;
        case fields.TAGS:
            taskData.tags = newVal;
            break;
        case fields.TIMEZONE:
            taskData.timezone = newVal;
            break;
    }
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).set(taskData);
    // comment to take up the newline
}

/*
async function modifyTasks(userID, taskID, params){
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).get().then(function(doc) {
        if (doc.exists != true) {
            throw "excuse me wth why are you gettingeddd me to modify something that does not exist???? *hacker noises*";
        }
    });
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).set({
        name: params.name,
        desc: params.desc,
        defer: params.defer,
        due: params.due,
        isFlagged: params.isFlagged,
        isFloating: params.isFloating,
        project: params.project,
        tags: params.tags,
        isComplete: params.isComplete
    });
}
*/

async function newTask(userID, nameParam, descParam, deferParam, dueParam, isFlaggedParam, isFloatingParam, projectParam, tagsParam, tz) {
    await db.collection("users").doc(userID).collection("tasks").add({
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
