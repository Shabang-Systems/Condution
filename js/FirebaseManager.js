// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
//const firebase = require("firebase/app");

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

// Initialize Firebase Application
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


var taskCache = {}
async function dbGet(path) {
    // TODO: untested
    let ref = db;
    for (let [key, val] of path.entries()) {
        console.log(`getting doc ${val} from collection ${key}`);
        ref = ref.collection(key);
        if (typeof val === "object") // use like {user: userID, project: undefined}
            ref = ref.doc(val);
    }
    return await ref.get();
}

async function getTasks(userID) {
    let docIds = [];
    await db.collection("users").doc(userID).collection("tasks").get().then(snapshot => {
        snapshot.forEach(doc => {
            docIds.push(doc.id);
            taskCache[doc.id] = doc.data();
        });
    }).catch(err => {
        console.log('Error getting documents', err);
    });
    return docIds;
}

async function getInboxTasks(userID) {
    let docIds = []
    for (key in taskCache){
        task = taskCache[key]
        if ((!task.isComplete) && (task.project == "")) {
            docIds.push(key)
        }
    }
/*    let docIds = [];*/
    //await db.collection("users").doc(userID).collection("tasks").where("project", "==", "").get().then(snapshot => {
        //snapshot.forEach(doc => {
            //if(!doc.isComplete){
                //docIds.push(doc.id);
                //taskCache[doc.id] = doc.data();
            //}
        //});
    //}).catch(err => {
        //console.log('Error getting documents', err);
    /*});*/
    return docIds;
}

async function getDSTasks(userID) {
    let docIds = [];
    let dsTime = new Date();
    dsTime.setHours(dsTime.getHours() + 24);
    for (key in taskCache){
        task = taskCache[key]
        if ((!task.isComplete) && (task.due <= dsTime)) {
            docIds.push(key)
        }
    }
   /* await db.collection("users").doc(userID).collection("tasks").where("due", "<=", dsTime).get().then(snapshot => {*/
        //snapshot.forEach(doc => {
            //if(!doc.isComplete){
                //docIds.push(doc.id);
                //taskCache[doc.id] = doc.data();
            //}
        //});
    //}).catch(err => {
        //console.log('Error getting documents', err);
    /*});*/
    return docIds;
}

async function getInboxandDS(userID) {
    let ibt = await getInboxTasks(userID);
    let dst = await getDSTasks(userID);
    let dstWithoutIbt = dst.filter(x => ibt.indexOf(x) < 0);
    return [ibt, dstWithoutIbt]
}

async function getTaskInformation(userID, taskID) {
    //let taskDoc = await db.collection("users").doc(userID).collection("tasks").doc(taskID).get();
    //return taskDoc.data();
    return taskCache[taskID];
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
    for (let i=0; i<projectIDs.length; i++) {
        let projectDocumentName = "errorThing";
        await db.collection("users").doc(userID).collection("projects").doc(projectIDs[i]).get().then(function(doc) {
            if (doc.exists === true) {
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
    let tagNames = [];
    let tagNamesReverse = [];
    for (let j=0; j<tagIDs.length; j++) {
        let tagDocumentName = "errorThing";
        await db.collection("users").doc(userID).collection("tags").doc(tagIDs[j]).get().then(function(doc) {
            if (doc.exists === true) {
                tagDocumentName = doc.data().name;
            } else {
                // doc.data() will be undefined in this case
                console.error("No such document!");
            }
        }).catch(function(error) {
            console.error("Error getting document:", error);
        });
        if (tagDocumentName === "errorThing") {
            console.error("Thread was either skipped, or name was null within document", tagIDs[j]);
        }
        tagNames[tagIDs[j]] = tagDocumentName;
        tagNamesReverse[tagDocumentName] = tagIDs[j];
    }
    return [[projectNames, projectNamesReverse], [tagNames, tagNamesReverse]];
}

async function modifyTask(userID, taskID, updateQuery){
    let taskData = "error";
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).get().then(function(doc) {

        if (doc.exists !== true) {
            throw "excuse me wth, why are you getting me to modify something that does not exist???? *hacker noises*";
        }
    });
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).update(updateQuery);
    for (key in updateQuery) {
        taskCache[taskID][key] = updateQuery[key]
    }
}

async function newTask(userID, nameParam, descParam, deferParam, dueParam, isFlaggedParam, isFloatingParam, projectParam, tagsParam, tz) { //TODO: task order calculation
    let res = await db.collection("users").doc(userID).collection("tasks").add({
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
    taskCache[res.id] = {
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
    }
    return res.id;
}

async function newTag(userID, tagName) {
    let nt = await db.collection("users").doc(userID).collection("tags").add({
        name: tagName,
    });
    return nt.id;
}

async function completeTask(userID, taskID) {
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).get().then(function(doc) {
        if (doc.exists !== true) {
            throw "Document not found. Please don't try to set documents that don't exist.";
        }
    });
    await db.collection("users").doc(userID).collection("tasks").doc(taskID).update({
        isComplete: true
    });
    for (key in updateQuery) {
        taskCache[taskID].isComplete = true;
    }
}

async function deleteTask(userID, taskID) {
    db.collection("users").doc(userID).collection("tasks").doc(taskID).delete().then(function() {
        console.log("Task successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing task: ", error);
    });
    delete taskCache[taskID];
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

async function getProjectStructure(userID, projectID) {
    let children = [];

    await db                                            //  await for processing to finish
    .collection("users").doc(userID)                    //  navigate to this user
    .collection("projects").doc(projectID)              //  navigate to this project
    .collection("children").get()                       //  get the ids of the children of this project
    .then(snapshot => {
        snapshot.forEach(async doc => {                 //  for each child
            if (doc.data().type === "task") {             //      if the child is a task
                let order = taskCache[doc.data().childrenID].order; //  get the order of the task
                children.push({type: "task", content: doc.data().childrenID, sortOrder: order});   //  push its ID to the array
            } else if (doc.data().type === "project") {    //      if the child is a project
                // push the children of this project---same structure as the return obj of this func
                let order = (await db.collection("users").doc(userID).collection("projects").doc(doc.data().childrenID).get()).data().order; //  get the order of the task
                children.push({type: "project", content: (await getProjectStructure(userID, doc.data().childrenID)), sortOrder: order});
            }
        });
        //  NOTE: returns with `id` prop to preserve id of og project
    }).catch(console.error);
    children.sort((a,b) => a.sortOrder-b.sortOrder); //  sort by ascending order of order
    return { id: projectID, children: children };
}


