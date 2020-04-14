
async function getTasks(userID) {
    return dbGet({users: userID, tasks: undefined}) // TODO: replace with cRef.get()
    .then(snap => snap.docs
        .map(doc => doc.id)
    ).catch(err => {
        console.error('Error getting documents', err);
    });
}

async function getInboxTasks(userID) {
    let inboxDocs = await dbGet({users: userID, tasks: [['project', '==', ''], ['isComplete', "==", false]]}) // TODO: replace with cRef.get()
        .then(snap => snap.docs
    ).catch(err => {
        console.error('Error getting documents', err);
    });
    inboxDocs.sort((a,b) => a.data().order - b.data().order);
    return inboxDocs.map(doc => doc.id);
}

async function getDSTasks(userID) {
    let dsTime = new Date(); // TODO: merge with next line?
    dsTime.setHours(dsTime.getHours() + 24);
    return dbGet({users: userID, tasks: [['due', '<=', dsTime], ['isComplete', "==", false]]}) // TODO: replace with cRef.get()
    .then(snap => snap.docs
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
    return (await dbGet({users: userID, tasks: taskID})).data(); // TODO: replace with cRef.get()
}

async function getProjectsandTags(userID) {
    // NOTE: no longer console.error when  !project/tag.exists
    let projectIdByName = {};
    let projectNameById = {};
    await dbGet({users: userID, projects: undefined}) // TODO: replace with cRef.get()
        .then(snap => snap.docs.forEach(proj => {
            dbGet({users: userID, projects: proj.id}) // TODO: replace with cRef.get()
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
    await dbGet({users: userID, tags: undefined}) // TODO: replace with cRef.get()
        .then(snap => snap.docs.forEach(tag => {
            dbGet({users: userID, tags: tag.id}) // TODO: replace with cRef.get()
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
    dbGet({users: userID, tasks: taskID}) // TODO: replace with cRef.get()
        .then((doc) => { // TODO: create a doc exists? wrapper
            if (doc.exists !== true)
                throw "excuse me wth, why are you getting me to modify something that does not exist???? *hacker noises*";
        });

    (await dbRef({users: userID, tasks: taskID})) // TODO: replace with cRef
        .update(updateQuery)
        .catch(console.error);
}

async function newTask(userID, taskObj) { //TODO: task order calculation
//, nameParam, descParam, deferParam, dueParam, isFlaggedParam, isFloatingParam, projectParam, tagsParam, tz
    // Set order param. Either return the latest item in index or
    if (taskObj.project === "") {
        let ibtL = (await getInboxTasks(userID)).length;
        taskObj.order = ibtL;
    } else {
        let projL = (await getProjectStructure(userID, taskObj.project)).children.length
        taskObj.order = projL;
    }

    return (await dbRef({users: userID, tasks: undefined}).add(taskObj)).id; // TODO: replace with cRef
}

async function newTag(userID, tagName) {
    return (await dbRef({users: userID, tags: undefined}).add({name: tagName})).id; // TODO: replace with cRef
}

async function completeTask(userID, taskID) {
    await dbGet({users: userID, tasks: taskID}) // TODO: replace with cRef.get()
        .then(doc => {
            if (doc.exists !== true) {
                throw "Document not found. Please don't try to set documents that don't exist.";
            }
        });
    await dbRef({users: userID, tasks: taskID}).update({ // TODO: replace with cRef
            isComplete: true
        });
}

async function deleteTask(userID, taskID) {
    (await dbRef({users: userID, tasks: taskID})).delete() // TODO: replace with cRef
        .then(() => {console.log("Task successfully deleted!")})
        .catch(console.error);
}

async function deleteProject(userID, projectID) {
    (await dbRef({users: userID, projects: projectID})).delete() // TODO: replace with cRef
        .then(() => {console.log("Project successfully deleted!")})
        .catch(console.error);
}

async function deleteTag(userID, tagID) {
    (await dbRef({users: userID, tags: tagID})).delete() // TODO: replace with cRef
        .then(() => {console.log("Tag successfully deleted!")})
        .catch(console.error);
}

async function getProjectStructure(userID, projectID) {
    let children = [];

    await dbGet({users:userID, projects:projectID, children:undefined}).then(snapshot => { // TODO: replace with cRef.get()
        snapshot.docs.forEach(async doc => {                 //  for each child
            if (doc.data().type === "task") { // TODO combine these if statements
                let order = (await dbGet({users:userID, tasks:(doc.data().childrenID)})).data().order;//.collection("users").doc(userID).collection("tasks").doc(doc.data().childrenID).get()).data().order; //  get the order of the task // TODO: replace with cRef.get()
                children.push({type: "task", content: doc.data().childrenID, sortOrder: order});   //  push its ID to the array
            } else if (doc.data().type === "project") {    //      if the child is a project
                // push the children of this project---same structure as the return obj of this func
                let order = (await dbGet({users:userID, projects:(doc.data().childrenID)})).data().order;//.collection("users").doc(userID).collection("projects").doc(doc.data().childrenID).get()).data().order; //  get the order of theproject // TODO: replace with cRef.get()
                children.push({type: "project", content: (await getProjectStructure(userID, doc.data().childrenID)), sortOrder: order});
            }
        });
        //  NOTE: returns with `id` prop to preserve id of og project
    }).catch(console.error);
    children.sort((a,b) => a.sortOrder-b.sortOrder); //  sort by ascending order of order, TODO: we should prob use https://firebase.google.com/docs/reference/js/firebase.firestore.Query#order-by
    return { id: projectID, children: children };
}
