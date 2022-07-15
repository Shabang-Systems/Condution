function keybindHandler(that, keybinds) { // holy hell why did i make it this way this sucks so bad oml

    const { shortcut } = (that.props? that.props : that)
    const keybindWrapper = (action, bindings, title, desc, crossPlatform=true, global=false)  => {
	const { shortcut } = (that.props? that.props : that)
	for (const i in bindings) {
	    if (bindings[i].length == 1) {
		// bind normal
		shortcut.registerShortcut(action, bindings[i], title, desc)
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
	if (!!keybinds[i]) continue; // this is erroring for some reason?
	if (!!keybinds[i][4]) {
	    for (const ii in keybinds[i][1]) {
		for (const iii in keybinds[i][1][ii]) {
		    if (keybinds[i][1][ii][iii].includes("ctrl")) {
			ctrlNeedsMigrate.push(clone(keybinds[i]))
		    }
		    if (keybinds[i][1][ii][iii].includes("cmd")) {
			cmdNeedsMigrate.push(clone(keybinds[i]))
		    }
		}
	    }
	}
    }

    for (const i in ctrlNeedsMigrate) {
	for (const ii in ctrlNeedsMigrate[i][1]) {
	    for (const iii in ctrlNeedsMigrate[i][1][ii]) {
		if (ctrlNeedsMigrate[i][1][ii][iii].includes("ctrl")) {
		    ctrlNeedsMigrate[i][1][ii][iii] = ctrlNeedsMigrate[i][1][ii][iii].replace("ctrl", "cmd")
		}
	    }
	}
    }


    for (const i in cmdNeedsMigrate) {
	for (const ii in cmdNeedsMigrate[i][1]) {
	    for (const iii in cmdNeedsMigrate[i][1][ii]) {
		if (cmdNeedsMigrate[i][1][ii][iii].includes("cmd")) {
		    cmdNeedsMigrate[i][1][ii][iii] = cmdNeedsMigrate[i][1][ii][iii].replace("cmd", "ctrl")
		}
	    }
	}
    }

    keybinds = keybinds.concat(ctrlNeedsMigrate)
    keybinds = keybinds.concat(cmdNeedsMigrate)


    for (const i in keybinds) {
	keybindWrapper(...keybinds[i])
    }

    let toUnbind = []
    for (const i in keybinds) {
	if (!!keybinds[i][5] == false) { // if not global
	    toUnbind.push(...keybinds[i][1])
	}
    }

    that.setState({
	keybinds: toUnbind
    })
}

export default keybindHandler
