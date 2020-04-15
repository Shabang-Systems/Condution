const util = {
    compare: (lhs, cmp, rhs) => {
        switch (cmp) {
            case "<":
                return lhs < rhs;
            case ">":
                return lhs > rhs;
            case "<=":
                return lhs <= rhs;
            case ">=":
                return lhs >= rhs;
            case "==":
                return lhs == rhs;
            case "!=":
                return lhs != rhs;
            case "has":
                return lhs.hasOwnProperty(rhs);
            case "!has":
                return !lhs.hasOwnProperty(rhs);
            default:
                throw new TypeError("Unkown comparator " + cmp);
        }
    },
    all: (requirements) => (doc) => {
        const dat = doc.data();
        for (let [lhs, cmp, rhs] of requirements)
            if (!util.compare(dat[lhs], cmp, rhs))
                return false;
        return true;
    },
    any: (requirements) => (doc) => {
        const dat = doc.data();
        for (let [lhs, cmp, rhs] of requirements)
            if (util.compare(dat[lhs], cmp, rhs))
                return true;
        return false;
    },
    atLeast: (requirements, threshold) => (doc) => {
        const dat = doc.data();
        let counter = 0;
        for (let [lhs, cmp, rhs] of requirements)
            if (util.compare(dat[lhs], cmp, rhs)) {
                ++counter;
                if (counter >= threshold)
                    return true;
            }
        return false;
    },
    atMost: (requirements, threshold) => (doc) => {
        const dat = doc.data();
        let counter = 0;
        for (let [lhs, cmp, rhs] of requirements)
            if (util.compare(dat[lhs], cmp, rhs)) {
                ++counter;
                if (counter > threshold)
                    return false;
            }
        return true;
    }
}

async function getTasks(userID) {
    return cRef("users", userID, "tasks").get()
    .then(snap => snap.docs
        .map(doc => doc.id)
    ).catch(err => {
        console.error('Error getting documents', err);
    });
}

async function getInboxTasks(userID) {
    let inboxDocs = await cRef(
        "users", userID,
        "tasks",
            ['project', '==', ''],
            ['isComplete', "==", false])
        .get()
        .then(snap => snap.docs)
        .catch(err => {
            console.error('Error getting documents', err);
        });
    inboxDocs.sort((a,b) => a.data().order - b.data().order);   // TODO: use firebase native ordering
    return inboxDocs.map(doc => doc.id);
}

async function getDSTasks(userID) {
    let dsTime = new Date(); // TODO: merge with next line?
    dsTime.setHours(dsTime.getHours() + 24);
    return cRef("users", userID,
        "tasks",
            ['due', '<=', dsTime],
            ['isComplete', "==", false])
        .get()
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
    return (await cRef("users", userID, "tasks", taskID).get()).data();
}

async function getTopLevelProjects(userID) {
    let projectIdByName = {};
    let projectNameById = {};

    let snap = (await cRef('users', userID, "projects",
        ["top_level", "==", true])
        .get())

    snap.docs.forEach(proj => {
        if (proj.exists) {
            projectNameById[proj.id] = proj.data().name;
            projectIdByName[proj.data().name] = proj.id;
        }
    });
    return [projectNameById, projectIdByName];
}

async function getProjectsandTags(userID) {
    // NOTE: no longer console.error when  !project/tag.exists
    let projectIdByName = {};
    let projectNameById = {};
    await cRef("users", userID, "projects").get()   // TODO: combine database hits
        .then(snap => snap.docs.forEach(proj => {
            if (proj.exists) {
                projectNameById[proj.id] = proj.data().name;
                projectIdByName[proj.data().name] = proj.id;
            }
        }))
        .catch(console.error);

    let tagIdByName = {};
    let tagNameById = {};
    await cRef("users", userID, "tags").get()
        .then(snap => snap.docs.forEach(tag => {
            if (tag.exists) {
                tagNameById[tag.id] = tag.data().name;
                tagIdByName[tag.data().name] = tag.id;
            }
        }))
        .catch(console.error);

    return [[projectNameById, projectIdByName], [tagNameById, tagIdByName]];
}

async function modifyTask(userID, taskID, updateQuery) {
    cRef("users", userID, "tasks", taskID).get()
        .then((doc) => { // TODO: create a doc exists? wrapper
            if (doc.exists !== true)
                throw "excuse me wth, why are you getting me to modify something that does not exist???? *hacker noises*";
        });

    //console.log(taskID, updateQuery);
    await cRef("users", userID, "tasks", taskID)
        .update(updateQuery)
        .catch(console.error);
}

async function newTask(userID, taskObj) {
//, nameParam, descParam, deferParam, dueParam, isFlaggedParam, isFloatingParam, projectParam, tagsParam, tz
    // Set order param. Either return the latest item in index or
    if (taskObj.project === "") {
        let ibtL = (await getInboxTasks(userID)).length;
        taskObj.order = ibtL;
    } else {
        let projL = (await getProjectStructure(userID, taskObj.project)).children.length
        taskObj.order = projL;
    }

    return (await cRef("users", userID, "tasks").add(taskObj)).id;
}

async function newTag(userID, tagName) {
    return cRef("users", userID, "tags").add({name: tagName}).id;
}

async function completeTask(userID, taskID) {
    await cRef("users", userID, "tasks", taskID).get()
        .then(doc => {
            if (doc.exists !== true) {
                throw "Document not found. Please don't try to set documents that don't exist.";
            }
        });
    await cRef("users", userID, "tasks", taskID).update({
            isComplete: true
        });
}

async function deleteTask(userID, taskID) {
    await cRef("users", userID, "tasks", taskID).delete()
        .then(() => {console.log("Task successfully deleted!")})
        .catch(console.error);
}

async function deleteProject(userID, projectID) {
    await cRef("users", userID, "projects", projectID).delete()
        .then(() => {console.log("Project successfully deleted!")})
        .catch(console.error);
}

async function deleteTag(userID, tagID) {
    await cRef("users", userID, "tags", tagID).delete()
        .then(() => {console.log("Tag successfully deleted!")})
        .catch(console.error);
}

async function getProjectStructure(userID, projectID) {
    let children = [];

    await cRef("users", userID, "projects", projectID, "children").get()
        .then(snapshot => {snapshot.docs
                .forEach(async doc => {                 //  for each child
            if (doc.data().type === "task") { // TODO combine these if statements
                let order = (await cRef("users", userID, "tasks", doc.data().childrenID).get()).data().order;//.collection("users").doc(userID).collection("tasks").doc(doc.data().childrenID).get()).data().order; //  get the order of the task // TODO: replace with cRef.get()
                children.push({type: "task", content: doc.data().childrenID, sortOrder: order});   //  push its ID to the array
            } else if (doc.data().type === "project") {    //      if the child is a project
                // push the children of this project---same structure as the return obj of this func
                let order = (await cRef("users", userID, "projects", (doc.data().childrenID)).get()).data().order;//.collection("users").doc(userID).collection("projects").doc(doc.data().childrenID).get()).data().order; //  get the order of theproject // TODO: replace with cRef.get()
                children.push({type: "project", content: (await getProjectStructure(userID, doc.data().childrenID)), sortOrder: order});
            }
        });
        //  NOTE: returns with `id` prop to preserve id of og project
    }).catch(console.error);
    children.sort((a,b) => a.sortOrder-b.sortOrder); //  sort by ascending order of order, TODO: we should prob use https://firebase.google.com/docs/reference/js/firebase.firestore.Query#order-by
    return { id: projectID, children: children };
}
