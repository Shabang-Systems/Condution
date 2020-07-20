let cRef = require("./DBManager").cRef;

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
            let dat = doc.data();
            if (dat.defer) dat.defer = dat.defer.seconds;
            if (dat.due) dat.due = dat.due.seconds;
            for (let [lhs, cmp, rhs] of requirements)
                if (!util.select.compare(dat[lhs], cmp, rhs))
                    return false;
            return true;
        },
        any: (...requirements) => (doc) => {
            let dat = doc.data();
            if (dat.defer) dat.defer = dat.defer.seconds;
            if (dat.due) dat.due = dat.due.seconds;

            for (let [lhs, cmp, rhs] of requirements)
                if (util.select.compare(dat[lhs], cmp, rhs))
                    return true;
            return false;
        },
        atLeast: (threshold, ...requirements) => (doc) => {
            let dat = doc.data();
            if (dat.defer) dat.defer = dat.defer.seconds;
            if (dat.due) dat.due = dat.due.seconds;
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
            let dat = doc.data();
            if (dat.defer) dat.defer = dat.defer.seconds;
            if (dat.due) dat.due = dat.due.seconds;
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

async function getDSTasks(userID, available, wrt) {
    let dsTime = wrt ? wrt : new Date(); // TODO: merge with next line?
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

async function dueTasks(userID, available, wrt) {
    let dsTime = wrt ? wrt : new Date(); // TODO: merge with next line?
    dsTime.setHours(23,59,59,999);
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

async function getDSRow(userID, avaliable) {
    let ibt = await getInboxTasks(userID);
    let d = new Date();
    let dsTasks = [];
    let prev = [];
    for (let i=0; i<=7; i++) {
        let content = (await dueTasks(userID, avaliable, d))
        let cache = content;
        dsTasks.push(content.filter(x => !prev.includes(x)));
        prev = cache;
        d.setDate(d.getDate() + 1)
    }
    return dsTasks.map(dst => dst.filter(x => ibt.indexOf(x) < 0));
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
                pInfobyID[pstp.id] = {name: pstp.data().name, query: pstp.data().query, avail: pstp.data().avail, tord: pstp.data().tord};
                pInfobyName[pstp.data().name] = {id: pstp.id, query: pstp.data().query, avail: pstp.data().avail, tord: pstp.data().tord};
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

    // Perspectives cannot have empty defer dates
    // But! We could set no defer to defer today.
    if (!taskObj.defer) {
        taskObj.defer = new Date();
    }

    let taskID = (await cRef("users", userID, "tasks").add(taskObj)).id;

    return taskID;
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

    let pid = (await cRef("users", userID, "projects").add(projObj)).id;
    return pid;
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
    return { id: projectID, children: children, is_sequential: project.data().is_sequential, sortOrder: project.data().order, parentProj: project.data().parent};
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
            if (child) {
                if (child.type === "project") {
                    Object.assign(bstat, (await recursivelyGetBlocks(userID, child.content.id)));
                    bstat[child.content.id] = true;
                } else if (child.type === "task") {
                    bstat[child.content] = true;
                }
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

async function getCompletedTasks(userID) {
    let completedTasks = await getTasksWithQuery(userID, util.select.all(["isComplete", "==", true]));
    let taskItems = await Promise.all(completedTasks.map(async function(t){return await getTaskInformation(userID, t)}));
    return completedTasks.sort(function(b,a) {
        let taskA = taskItems[completedTasks.indexOf(a)];
        let taskB = taskItems[completedTasks.indexOf(b)];
        return ((
            (taskA.completeDate) ?
                (taskA.completeDate.seconds) :
                1
        )-(
            (taskB.completeDate) ?
                (taskB).completeDate.seconds :
                1
        ));
    });
}

async function onBoard(userID, tz, username) {
    // Inbox, in reverse cronological order
    await newTask(userID, {
            name: `Hey ${username}, 🙌 welcome to Condution! 🙌 `,
            desc: "Yaay!",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: "",
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await newTask(userID, {
            name: "⬅ Click this box to complete a task!",
            desc: "Nice!",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: "",
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await newTask(userID, {
            name: "Click here 🎯 to edit a task.",
            desc: "The Flag 🚩 toggle flags a task, the Globe 🌎 toggle toggles fixed and floating timezone, the dateboxes ▶️ ⏹ picks defer and due dates, the project 📋 field picks projects, the tag 🏷 field picks tags, and, most importantly, yours truly 👀 is the awesome description box!",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: "",
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );

    let cdyrslf = await newProject(userID, {name: "Condution Yourself", top_level: true, is_sequential: false});
    let npd = await newProject(userID, {name: "Due, Due-Soon, Defer", top_level: true, is_sequential: false});
    let od = new Date();
    let ds = new Date();
    od.setHours(od.getHours() - 24);
    ds.setHours(ds.getHours() + 20);
    let odid = await newTask(userID, {
            name: "Oh no! I am overdue! 😓",
            desc: "With Condution, you will never have another one of me again. (At least we hope.)",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: npd,
            tags: [],
            timezone: tz,
            due: od,
            repeat: {rule: "none"},
        }
    );
    let dsID = await newTask(userID, {
            name: "Aha, 🤨 I am due soon!",
            desc: "The lovely orange color will change red when I become due.",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: npd,
            tags: [],
            timezone: tz,
            due: ds,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, odid, npd);
    await associateTask(userID, dsID, npd);
    ds.setHours(ds.getHours() + 2);
    let checkoutID = await newTask(userID, {
            name: `👀 Check out the menu and tap 'Condution Yourself'`,
            desc: "Because, why woulden't you?",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: "",
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    let nice = await newTask(userID, {
            name: `Nice! 😉 This is a lovely project!`,
            desc: "",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: cdyrslf,
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, nice, cdyrslf);
    let sequential = await newTask(userID, {
            name: `Tap the three vertical dots ↗`,
            desc: "That will make the project sequential!",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: cdyrslf,
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, sequential, cdyrslf);
    let blocked = await newTask(userID, {
            name: "In a sequential project, I will be grey.",
            desc: "We are blocked in that case.",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: cdyrslf,
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, blocked, cdyrslf);
    let click = await newTask(userID, {
            name: "Only the top action ☝️  in sequential projects is available",
            desc: "That one is not blocked.",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: cdyrslf,
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, click, cdyrslf);
    let pspDir = await newTask(userID, {
            name: "Excellent. 😄 Now tap the 'Aftercare' Perspective in the Menu!",
            desc: "Amazing Physics Going On...",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: cdyrslf,
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, pspDir, cdyrslf);
    let pspsp = await newProject(userID, {name: "Perspective Tasks", top_level: true, is_sequential: false});
    let tags = await Promise.all([newTag(userID, "Aftercare"), newTag(userID, "Productivity"), newTag(userID, "Low Energy"), newTag(userID, "Unimportant")]);
    let specific = await newTask(userID, {
            name: "After you are done, tap 'Come hang out' in the menu!",
            desc: "",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: pspsp,
            tags: [tags[2], tags[3]],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, specific, pspsp);
    let sp = await newTask(userID, {
            name: "Tap the pencil ✏️ icon to see what I'm filtering! ⤴",
            desc: "",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: pspsp,
            tags: [tags[0]],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, sp, pspsp);
    await newPerspective(userID, {name: "Aftercare", query: "([#Aftercare]) ([#Low Energy #Unimportant])"});
    let promotion = await newProject(userID, {name: "Come hang out!", top_level: true, is_sequential: false});
    let online = await newTask(userID, {
            name: "Get Condution Everywhere! 🌎: condution.shabang.cf",
            desc: "",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: promotion,
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, online, promotion);
    let dis = await newTask(userID, {
            name: "Catch us on Discord! 💬: discord.gg/QgxUCyj",
            desc: "",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: promotion,
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, dis, promotion);
    let patreon = await newTask(userID, {
        name: "Support Condution! 🎗: patreon.comcondution",
            desc: "",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: promotion,
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, patreon, promotion);
    let yiipee = await newTask(userID, {
        name: "From all of us at #!/Shabang + Condution Project, enjoy!",
            desc: "Yiipee!",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: promotion,
            tags: [],
            timezone: tz,
            repeat: {rule: "none"},
        }
    );
    await associateTask(userID, yiipee, promotion);
}

module.exports = {util, getTasks, getTasksWithQuery, getInboxTasks, getDSTasks, getInboxandDS, removeParamFromTask, getTopLevelProjects, getProjectsandTags, getPerspectives, modifyProject, modifyTask, modifyPerspective, newProject, newPerspective, newTag, newTask, completeTask, dissociateTask, associateTask, associateProject, dissociateProject, deleteTask, deletePerspective, deleteProject, getProjectStructure, getItemAvailability, getTaskInformation, getDSRow, deleteTag, getCompletedTasks, onBoard};

