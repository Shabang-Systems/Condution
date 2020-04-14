// dbRef, dbGet from CacheManager.js via app.html

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
