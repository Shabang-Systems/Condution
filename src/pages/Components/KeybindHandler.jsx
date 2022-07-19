function keybindHandler(that, keybinds) { // holy hell why did i make it this way this sucks so bad oml

    const { shortcut } = (that.props? that.props : that)
    const keybindWrapper = (action, bindings, title, desc, crossPlatform=true, global=false)  => {
	const { shortcut } = (that.props? that.props : that)
	for (const i in bindings) {
	    if (bindings[i].length == 1) {
		// bind normal
		shortcut.registerShortcut(action, bindings[i], title, desc + "&" + (that.menu? "&" : "") + window.location.pathname)
		//console.log(that.props && that.props.id, "right here baby")
	    } else {
		// bind sequence
		shortcut.registerSequenceShortcut(action, bindings[i], title, desc)
	    }
	}
    }

    let ctrlNeedsMigrate = []
    let cmdNeedsMigrate = []
    const clone = (items) => items.map(item => Array.isArray(item) ? clone(item) : item);
    for (const i in keybinds) {
	// TODO idk why i had this..
	//console.log("adsf", !!keybinds[i][4])
	//if (i != 4 && i != 5 && !!keybinds[i]) {
	//    console.log("erroring!", keybinds[i])
	//    continue; // this is erroring for some reason?
	//}
	//console.log("here??")
	if (!!keybinds[i][4]) {
	    for (const ii in keybinds[i][1]) {
		for (const iii in keybinds[i][1][ii]) {
		    if (!keybinds[i][1][ii][iii]) console.log("erroring!", keybinds[i][1][ii][iii])

		    if (!keybinds[i][1][ii][iii].includes) {
			//console.log("no includes??", keybinds[i][1][ii][iii], keybinds)
			continue;
		    }

		    if (keybinds[i][1][ii][iii] && keybinds[i][1][ii][iii].includes("ctrl")) {
			ctrlNeedsMigrate.push(clone(keybinds[i]))
		    }
		    if (keybinds[i][1][ii][iii] && keybinds[i][1][ii][iii].includes("cmd")) {
			cmdNeedsMigrate.push(clone(keybinds[i]))
		    }
		}
	    }
	}
    }

    // TODO this migrate duplicates all keybinds, not just the ones that need to be migrated

    for (const i in ctrlNeedsMigrate) {
	for (const ii in ctrlNeedsMigrate[i][1]) {
	    for (const iii in ctrlNeedsMigrate[i][1][ii]) {
		if (ctrlNeedsMigrate[i][1][ii][iii] && ctrlNeedsMigrate[i][1][ii][iii].includes("ctrl")) {
		    ctrlNeedsMigrate[i][1][ii][iii] = ctrlNeedsMigrate[i][1][ii][iii].replace("ctrl", "cmd")
		}
	    }
	}
    }


    for (const i in cmdNeedsMigrate) {
	for (const ii in cmdNeedsMigrate[i][1]) {
	    for (const iii in cmdNeedsMigrate[i][1][ii]) {
		if (cmdNeedsMigrate[i][1][ii][iii] && cmdNeedsMigrate[i][1][ii][iii].includes("cmd")) {
		    cmdNeedsMigrate[i][1][ii][iii] = cmdNeedsMigrate[i][1][ii][iii].replace("cmd", "ctrl")
		}
	    }
	}
    }

    keybinds = keybinds.concat(ctrlNeedsMigrate)
    keybinds = keybinds.concat(cmdNeedsMigrate)
    //console.log(ctrlNeedsMigrate, cmdNeedsMigrate, "here")


    for (const i in keybinds) {
	keybindWrapper(...keybinds[i])
    }

    let toUnbind = []
    for (const i in keybinds) {
	if (!!keybinds[i][5] == false) { // if not global
	    toUnbind.push(...keybinds[i][1])
	}
    }

    if (that.props) {
	that.setState({
	    keybinds: toUnbind
	})
    }
    //console.log(toUnbind)
    return toUnbind
}

export default keybindHandler
