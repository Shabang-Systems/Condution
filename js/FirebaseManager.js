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

var quickDirtyCacheByIdsWithCollisionsTODO = {};
const quickDirtyGetLastKeyOfDictTODO = (dict) => {
    Object.values(dict)[Object.values(dict).length-1]
};

// NOTE: not async to remove the need to await/then it
function dbRef(path) {
    // TODO: refactor for query caching
    let ref = db;
    for (let [key, val] of Object.entries(path)) {
        ref = ref.collection(key);
        if (typeof val === 'string') // get doc
            ref = ref.doc(val);
        else if (Array.isArray(val)) // where clause: use like {task: ['project', '==', '']}
            ref = ref.where(...val);
        else if (typeof val === 'undefined') // wildcard: use like {user: userID, project: undefined}
            break;
    }
    return {    // NOTE: wrapped in promise.resolve
        get: ref.get.bind(ref),
        set: (data, options) => { cacheDump(); return ref.set.bind(ref)(data, options); },
        add: (data) => { cacheDump(); return ref.add.bind(ref)(data); },
        delete: () => { cacheDump(); return ref.delete.bind(ref)(); },
        update: (data) => { cacheDump(); return ref.update.bind(ref)(data); }
    };
}

async function dbGet(path, debug=false) {
    // TODO: query caching
    // NOTE: not awaited because this is an async function, should be awaited outside of it
    const finalKey = quickDirtyGetLastKeyOfDictTODO(path);              //  get the final key
    if (debug) console.log(finalKey); // TODO: remove debug things
    if (typeof finalKey === 'string') {                                 //  it's (probably) a id
            console.log('string aka doc');
        if (quickDirtyCacheByIdsWithCollisionsTODO.hasOwnProperty(finalKey)) {   //  and the cache has it
            return quickDirtyCacheByIdsWithCollisionsTODO[path];        //  return from cache
        } else {                                                        //  doesn't exist in the cache yet
            const snap = await dbRef(path).get();                       //  get snapshot from db
            quickDirtyCacheByIdsWithCollisionsTODO[finalKey] = snap;    //  save snapshot to cache
            console.log(snap);
            return snap;                                                //  and return the new data
        }
    } else {                                                            //  TODO: query, too hard to cache, implement query caching
        return (await dbRef(path)).get();                               //  do a database hit
    }
}

async function cacheDump() {
    // TODO: implement actually good caching, write to the cache instead of dumping on write to database
    quickDirtyCacheByIdsWithCollisionsTODO = {};
}

async function getTasks(userID) {
    return dbGet({users: userID, tasks: undefined})
    .then(snap => snap.docs
        .map(doc => doc.id)
    ).catch(err => {
        console.error('Error getting documents', err);
    });
}

async function getInboxTasks(userID) {
    return dbGet({users: userID, tasks: ['project', '==', '']})
    .then(snap => snap.docs
        .filter(doc => !doc.isComplete)
        .map(doc => doc.id)
    ).catch(err => {
        console.error('Error getting documents', err);
    });
}

async function getDSTasks(userID) {
    let dsTime = new Date(); // TODO: merge with next line?
    dsTime.setHours(dsTime.getHours() + 24);
    return dbGet({users: userID, tasks: ['due', '<=', dsTime]})
    .then(snap => snap.docs
        .filter(doc => !doc.isComplete)
        .map(doc => doc.id)
    ).catch(console.error);
}

async function getInboxandDS(userID) {
    let ibt = await getInboxTasks(userID);
    let dst = await getDSTasks(userID);
    let dstWithoutIbt = dst.filter(x => ibt.indexOf(x) < 0);
    return [ibt, dstWithoutIbt]
}

async function getTaskInformation(userID, taskID) {
    return (await dbGet({users: userID, tasks: taskID})).data();
}

async function getProjectsandTags(userID) {
    // NOTE: no longer console.error when  !project/tag.exists
    let projectIdByName = {};
    let projectNameById = {};
    await dbGet({users: userID, projects: undefined})
        .then(snap => snap.docs.forEach(proj => {
            dbGet({users: userID, projects: proj.id})
                .then(proj => {
                    if (proj.exists) {
                        projectNameById[proj.id] = proj.data().name;
                        projectIdByName[proj.data().name] = proj.id;
                    }
                })
        }))
        .catch(console.error);

    let tagIdByName = {};
    let tagNameById = {};
    await dbGet({users: userID, tags: undefined})
        .then(snap => snap.docs.forEach(tag => {
            dbGet({users: userID, tags: tag.id})
                .then(tag => {
                    if (tag.exists) {
                        tagNameById[tag.id] = tag.data().name;
                        tagIdByName[tag.data().name] = tag.id;
                    }
                })
        }))
        .catch(console.error);

    return [[projectNameById, projectIdByName], [tagNameById, tagIdByName]];
}

async function modifyTask(userID, taskID, updateQuery) {
    // TODO: untested
    dbGet({users: userID, tasks: taskID})
        .then((doc) => { // TODO: create a doc exists? wrapper
            if (doc.exists !== true)
                throw "excuse me wth, why are you getting me to modify something that does not exist???? *hacker noises*";
        });

    (await dbRef({users: userID, tasks: taskID}))
        .update(updateQuery)
        .catch(console.error);
}

async function newTask(userID, nameParam, descParam, deferParam, dueParam, isFlaggedParam, isFloatingParam, projectParam, tagsParam, tz) { //TODO: task order calculation
    await dbRef({users: userID, tasks: undefined}).add({
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

async function newTag(userID, tagName) {
    return (await dbRef({users: userID, tags: undefined}).add({name: tagName})).id
}

async function completeTask(userID, taskID) {
    await dbGet({users: userID, tasks: taskID})
        .then(doc => {
            if (doc.exists !== true) {
                throw "Document not found. Please don't try to set documents that don't exist.";
            }
        });
    await dbRef({users: userID, tasks: taskID}).update({
            isComplete: true
        });
}

async function deleteTask(userID, taskID) {
    (await dbRef({users: userID, tasks: taskID})).delete()
        .then(() => {console.log("Task successfully deleted!")})
        .catch(console.error);
}

async function deleteProject(userID, projectID) {
    (await dbRef({users: userID, projects: projectID})).delete()
        .then(() => {console.log("Project successfully deleted!")})
        .catch(console.error);
}

async function deleteTag(userID, tagID) {
    (await dbRef({users: userID, tags: tagID})).delete()
        .then(() => {console.log("Tag successfully deleted!")})
        .catch(console.error);
}

async function getProjectStructure(userID, projectID) {
    // TODO: refactor, untested
    let children = [];

    await dbGet({users:userID, projects:projectID, children:undefined}).then(snapshot => {
        snapshot.docs.forEach(async doc => {                 //  for each child
            if (doc.data().type === "task") { // TODO combine these if statements
                let order = (await dbGet({users:userID, tasks:(doc.data().childrenID)}).map(snap => snap.order)); //  get the order of the task
                children.push({type: "task", content: doc.data().childrenID, sortOrder: order});   //  push its ID to the array
            } else if (doc.data().type === "project") {    //      if the child is a project
                // push the children of this project---same structure as the return obj of this func
                let order = (await dbGet({users:userID, projects:(doc.data().childrenID)}).map(snap => snap.order));//.collection("users").doc(userID).collection("projects").doc(doc.data().childrenID).get()).data().order; //  get the order of the task
                children.push({type: "project", content: (await getProjectStructure(userID, doc.data().childrenID)), sortOrder: order});
            }
        });
        //  NOTE: returns with `id` prop to preserve id of og project
    }).catch(console.error);
    children.sort((a,b) => a.sortOrder-b.sortOrder); //  sort by ascending order of order, TODO: we should prob use https://firebase.google.com/docs/reference/js/firebase.firestore.Query#order-by
    return { id: projectID, children: children };
}
