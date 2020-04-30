let cRef = require("./DBManager");

const util = {
    select: {
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
                    return lhs.includes(rhs);
                case "!has":
                    return !lhs.includes(rhs);
                default:
                    throw new TypeError("Unkown comparator " + cmp);
            }
        },
        all: (...requirements) => (doc) => {
            const dat = doc.data();
            for (let [lhs, cmp, rhs] of requirements)
                if (!util.select.compare(dat[lhs], cmp, rhs))
                    return false;
            return true;
        },
        any: (...requirements) => (doc) => {
            const dat = doc.data();
            for (let [lhs, cmp, rhs] of requirements)
                if (util.select.compare(dat[lhs], cmp, rhs))
                    return true;
            return false;
        },
        atLeast: (threshold, ...requirements) => (doc) => {
            const dat = doc.data();
            let counter = 0;
            for (let [lhs, cmp, rhs] of requirements)
                if (util.select.compare(dat[lhs], cmp, rhs)) {
                    ++counter;
                    if (counter >= threshold)
                        return true;
                }
            return false;
        },
        atMost: (threshold, ...requirements) => (doc) => {
            const dat = doc.data();
            let counter = 0;
            for (let [lhs, cmp, rhs] of requirements)
                if (util.select.compare(dat[lhs], cmp, rhs)) {
                    ++counter;
                    if (counter > threshold)
                        return false;
                }
            return true;
        }
    },
    debug: {
        log: (arg) => {
            console.log(arg);
            return arg;
        },
        trace: (arg) => {
            console.trace(arg);
            return arg;
        }
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

async function getTasksWithQuery(userID, query) {
    let taskDocs = await cRef("users", userID, "tasks")
        .get()
        .then(snap => snap.docs
            .filter(query)
        ).catch(err => {
            console.error('Error getting documents', err);
        });
    return taskDocs.map(doc => doc.id);
}

async function getInboxTasks(userID) {
    let inboxDocs = await cRef(
        "users", userID,
        "tasks")
        //['project', '==', ''],
        //['isComplete', "==", false])
        .get()
        .then(snap => snap.docs
            .filter(util.select.all(['project', '==', ''], ['isComplete', '==', false]))
            .sort((a,b) => a.data().order - b.data().order)
        ).catch(err => {
            console.error('Error getting documents', err);
        });
    return inboxDocs.map(doc => doc.id);
}

async function getDSTasks(userID, available) {
    let dsTime = new Date(); // TODO: merge with next line?
    dsTime.setHours(dsTime.getHours() + 24);
    //let available = await getItemAvailability(userID);
    let dsDocs = await cRef("users", userID,
        "tasks")
            //['due', '<=', dsTime],
            //['isComplete', "==", false])
        .get()
        .then(snap => snap.docs
            .filter(doc =>
                (doc.data().due ? (doc.data().due.seconds <= (dsTime.getTime()/1000)) : false) && // has a due date and is ds
                (doc.data().defer ? (doc.data().defer.seconds < ((new Date()).getTime())/1000) : true) && // has a defer and is not defered or has no defer date
                (doc.data().isComplete === false) && // is not completed
                (available[doc.id]) // aaaand is available
            )
            .sort((a,b) => a.data().due.seconds - b.data().due.seconds)
    ).catch(console.error);
    return dsDocs.map(doc => doc.id);
}

async function getInboxandDS(userID, avalibility) {
    let ibt = await getInboxTasks(userID);
    let dst = await getDSTasks(userID, avalibility);
    let dstWithoutIbt = dst.filter(x => ibt.indexOf(x) < 0);
    return [ibt, dstWithoutIbt]
}

async function getTaskInformation(userID, taskID) {
    return (await cRef("users", userID, "tasks").get()
        .then(snap => snap.docs
            .filter(doc => doc.id === taskID))
    )[0].data();
}

async function removeParamFromTask(userID, taskID, paramName) {
    let ti = await getTaskInformation(userID, taskID);
    delete ti[paramName];
    await cRef("users", userID, "tasks", taskID)
        .set(ti)
        .catch(console.error);
}

async function getTopLevelProjects(userID) {
    let projectIdByName = {};
    let projectNameById = {};
    let projectsSorted = []; 

    let snap = (await cRef('users', userID, "projects")
        .get())

    snap.docs.forEach(proj => {
        if (proj.exists && proj.data().top_level === true) {
            projectNameById[proj.id] = proj.data().name;
            projectIdByName[proj.data().name] = proj.id;
            let projElem = {};
            projElem.id = proj.id;
            projElem.name = proj.data().name;
            projElem.sortOrder = proj.data().order;
            projectsSorted.push(projElem);
        }
    });

    projectsSorted.sort((a,b) => a.sortOrder-b.sortOrder);
    return [projectNameById, projectIdByName, projectsSorted];
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

async function getPerspectives(userID) {
    let pInfobyName = {};
    let pInfobyID = {}
    let ps = [];
    await cRef("users", userID, "perspectives").get()   // TODO: combine database hits
        .then(snap => snap.docs.forEach(pstp => {
            if (pstp.exists) {
                pInfobyID[pstp.id] = {name: pstp.data().name, query: pstp.data().query};
                pInfobyName[pstp.data().name] = {id: pstp.id, query: pstp.data().query};
                ps.push({id: pstp.id, ...pstp.data()});
            }
        }))
        .catch(console.error);

    ps.sort((a,b) => a.order-b.order);

    return [pInfobyID, pInfobyName, ps];
}

async function modifyProject(userID, projectID, updateQuery) {
    await cRef("users", userID, "projects", projectID)
        .update(updateQuery)
        .catch(console.error);
}

async function modifyTask(userID, taskID, updateQuery) {
    await cRef("users", userID, "tasks", taskID)
        .update(updateQuery)
        .catch(console.error);
}

async function modifyPerspective(userID, taskID, updateQuery) {
    await cRef("users", userID, "perspectives", taskID)
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
        let projL = (await getProjectStructure(userID, taskObj.project)).children.length;
        taskObj.order = projL;
    }

    return (await cRef("users", userID, "tasks").add(taskObj)).id;
}

async function newProject(userID, projObj, parentProj) {
//, nameParam, descParam, deferParam, dueParam, isFlaggedParam, isFloatingParam, projectParam, tagsParam, tz
    // Set order param. Either return the latest item in index or
    let projL;
    // Util func to get size of ob
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    if (parentProj) {
        projL = (await getProjectStructure(userID, parentProj)).children.length;
        projObj.parent = parentProj;
    } else {
        projL = Object.size((await getTopLevelProjects(userID))[0]);
        projObj.parent = "";
    }
    projObj.order = projL;
    projObj.children = {};

    return (await cRef("users", userID, "projects").add(projObj)).id;
}

async function newPerspective(userID, pstObj) {
    return (await cRef("users", userID, "perspectives").add({order: (await getPerspectives(userID))[2].length, ...pstObj})).id;
}

async function newTag(userID, tagName) {
    return (await cRef("users", userID, "tags").add({name: tagName})).id;
}

async function completeTask(userID, taskID) {
    await cRef("users", userID, "tasks", taskID).update({
        isComplete: true
    });
}

async function dissociateTask(userID, taskID, projectID) {
    let originalChildren = await cRef("users", userID, "projects").get().then(util.dump)
        .then(snapshot => snapshot.docs.filter(x => x.id === projectID)).then(util.dump).then(t => t[0].data().children);

    delete originalChildren[taskID];
    await cRef("users", userID, "projects", projectID)
        .update({children: originalChildren});
}

async function associateTask(userID, taskID, projectID) {
    let originalChildren = await cRef("users", userID, "projects").get()
        .then(snapshot => snapshot.docs.filter(x => x.id === projectID)[0] //.filter(doc => doc.id === taskID)
        .data().children);

    originalChildren[taskID] = "task";
    await cRef("users", userID, "projects", projectID)
        .update({children: originalChildren});
}

async function associateProject(userID, assosProjID, projectID) {
    let originalChildren = await cRef("users", userID, "projects").get()
        .then(snapshot => snapshot.docs.filter(x => x.id === projectID)[0] //.filter(doc => doc.id === taskID)
        .data().children);

    originalChildren[assosProjID] = "project";
    await cRef("users", userID, "projects", projectID)
        .update({children: originalChildren});
}

async function dissociateProject(userID, assosProjID, projectID) {
    let originalChildren = await cRef("users", userID, "projects").get().then(util.dump)
        .then(snapshot => snapshot.docs.filter(x => x.id === projectID)).then(util.dump).then(t => t[0].data().children);

    delete originalChildren[assosProjID];
    await cRef("users", userID, "projects", projectID)
        .update({children: originalChildren});
}

async function deleteTask(userID, taskID, willDissociateTask = true) {
    let taskData = await cRef("users", userID, "tasks").get()
        .then(snap => snap.docs.filter(doc => doc.id === taskID)[0].data()); // Fetch task data

    if (taskData.project!== "" && willDissociateTask) {
        await dissociateTask(userID, taskID, taskData.project);
    }
    await cRef("users", userID, "tasks", taskID).delete()
        .catch(console.error);
}


async function deletePerspective(userID, perspectiveID) {
    await cRef("users", userID, "perspectives", perspectiveID).delete();
}

async function deleteProject(userID, projectID) {
    getProjectStructure(userID, projectID).then(async function(struct) {
        for (let i of struct.children) {
            if (i.type === "project") deleteProject(userID, i.content.id)
            else modifyTask(userID, i.content, {project:""});
        }
        await cRef("users", userID, "projects", projectID).delete()
            .catch(console.error);
    });
}

async function deleteTag(userID, tagID) {
    await cRef("users", userID, "tags", tagID).delete()
        .catch(console.error);
}

async function getProjectStructure(userID, projectID, recursive=false) {
    let children = [];

    // absurdly hitting the cache with a very broad query so that the
    // cache will catch all projects and only hit the db once

    let project =  (await cRef("users", userID, "projects").get().then(snap => snap.docs)).filter(doc=>doc.id === projectID)[0];
    for (let [itemID, type] of Object.entries(project.data().children)) {
        if (type === "task") {  // TODO: combine if statements
            let task = await getTaskInformation(userID, itemID);
            if (!task.isComplete) {
                children.push({type: "task", content: itemID, sortOrder: task.order});
            }
        } else if (type === "project") {
            if (recursive) {
                let project = await getProjectStructure(userID, itemID);
                children.push({type: "project", content: project, is_sequential: project.is_sequential, sortOrder: project.sortOrder}); 
            } else {
                let project =  (await cRef("users", userID, "projects").get().then(snap => snap.docs)).filter(doc=>doc.id === itemID)[0];
                children.push({type: "project", content: {id: itemID}, is_sequential: project.data().is_sequential, sortOrder: project.data().order}); 
            }
        }
    }
    children.sort((a,b) => a.sortOrder-b.sortOrder); //  sort by ascending order of order, TODO: we should prob use https://firebase.google.com/docs/reference/js/firebase.firestore.Query#order-by
    return { id: projectID, children: children, is_sequential: project.data().is_sequential, sortOrder: project.data().order};
}

async function getItemAvailability(userID) {
    let t = new Date();
    let tlps = (await getTopLevelProjects(userID))[2];
    let blockstatus = {};
    let timea = new Date();
    async function recursivelyGetBlocks(userID, projectID) {
        let bstat = {};
        let project = (await cRef("users", userID, "projects").get().then(snap => snap.docs)).filter(doc=>doc.id === projectID)[0];
        let projStruct = (await getProjectStructure(userID, projectID));
        if (project.data().is_sequential) {
            let child = projStruct.children[0];
            if (child.type === "project") {
                Object.assign(bstat, (await recursivelyGetBlocks(userID, child.content.id)));
                bstat[child.content.id] = true;
            } else if (child.type === "task") {
                bstat[child.content] = true;
            }
        } else {
            let children = projStruct.children;
            await Promise.all(children.map(async function(child) {
                if (child.type === "project") {
                    Object.assign(bstat, (await recursivelyGetBlocks(userID, child.content.id)));
                    bstat[child.content.id] = true;
                } else if (child.type === "task") {
                    bstat[child.content] = true;
                }
            }));
        }
        return bstat;
    };
    await Promise.all(tlps.map(async function(p) {
        blockstatus[p.id] = true;
        let blocks = await recursivelyGetBlocks(userID, p.id);
        Object.assign(blockstatus, blocks);
    }));
    await (await getInboxTasks(userID)).forEach((id) => blockstatus[id] = true);
    return blockstatus;
}

module.exports = {util, getTasks, getTasksWithQuery, getInboxTasks, getDSTasks, getInboxandDS, removeParamFromTask, getTopLevelProjects, getProjectsandTags, getPerspectives, modifyProject, modifyTask, modifyPerspective, newProject, newPerspective, newTag, newTask, completeTask, dissociateTask, associateTask, associateProject, dissociateProject, deleteTask, deletePerspective, deleteProject, getProjectStructure, getItemAvailability, getTaskInformation};

