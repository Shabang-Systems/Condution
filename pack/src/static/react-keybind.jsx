/**
 * Shortcut Enhancer
 *
 * Provides a default HOC and Context
 *
 * @format
 */

import * as React from "react"

/**
 * Default tags to ignore shortcuts when focused
 */
const ignoreForTagNames = ["input", "pre", "span", "textarea"]

/**
 * Shortcut Context to provide and consume global shortcuts
 */
const defaultState = {
    shortcuts: []
}
const ShortcutContext = React.createContext(defaultState)
export const ShortcutConsumer = ShortcutContext.Consumer

// Shortcut Provider
export class ShortcutProvider extends React.PureComponent {
    holdDurations = {}
    holdListeners = {}
    holdTimer = 0
    keysDown = []
    listeners = {}
    previousKeys = []
    sequenceListeners = {}
    shortcuts = []

    state = {
	shortcuts: []
    }

    /**
     * Route known keys to their proper exectued counterpart
     *
     * Mappings:
     *  - opt, option = alt
     *  - control = ctrl
     *  - cmd, command = meta
     */
    static transformKeys = keys => {
	return keys.map(rawKeys => {
	    // force keys to be a string (we might have a number)
	    const splitKeys = `${rawKeys}`.split("+")
	    const transformedKeys = splitKeys.map(key => {
		const keyEvent = key.toLowerCase()
		switch (keyEvent) {
		    case "opt":
		    case "option":
			return "alt"
		    case "control":
			return "ctrl"
		    case "cmd":
		    case "command":
			return "meta"
		    default:
			return keyEvent
		}
	    })
	    return transformedKeys.join("+")
	})
    }

    /**
     * Mount the single event listener
     */
    componentDidMount() {
	window.addEventListener("keydown", this.keyDown)
	window.addEventListener("keyup", this.keyUp)
	window.addEventListener("blur", this.windowBlur)
    }

    componentWillUnmount() {
	window.removeEventListener("keydown", this.keyDown)
	window.removeEventListener("keyup", this.keyUp)
	window.removeEventListener("blur", this.windowBlur)
    }

    /**
     * Create an interval timer to check the duration of held keypresses
     */
    createTimer = callback => {
	this.holdInterval = window.setInterval(() => {
	    callback()
	    this.holdTimer += 100
	}, 100)
    }

    /**
     * Handle "keydown" events and run the appropriate registered method
     */
    keyDown = e => {
	const {
	    ignoreKeys = [],
	    ignoreTagNames,
	    preventDefault = true
	} = this.props
	const target = e.target
	// ignore listening when certain elements are focused
	const ignore = ignoreTagNames
	    ? [...ignoreTagNames.map(tag => tag.toLowerCase()), ...ignoreForTagNames]
	    : ignoreForTagNames
	// The currently pressed key
	const key = e.key?.toLowerCase()

	// ensure that we're not focused on an element such as an <input />
	if (
	    key &&
	    ignore.indexOf(target.tagName.toLowerCase()) < 0 &&
	    this.keysDown.indexOf(key) < 0
	    && !(e.srcElement.contentEditable === "true")
	) {
	    const keysDown = []
	    const modKeys = []
	    if (
		(key === "control" || e.ctrlKey === true) &&
		ignoreKeys.indexOf("ctrl") < 0
	    ) {
		if (this.keysDown.indexOf("ctrl") < 0) keysDown.push("ctrl")
		if (key === "control") modKeys.push(key)
	    }
	    if (
		(key === "alt" || e.altKey === true) &&
		ignoreKeys.indexOf("alt") < 0
	    ) {
		if (this.keysDown.indexOf("alt") < 0) keysDown.push("alt")
		if (key === "alt") modKeys.push(key)
	    }
	    if (
		(key === "meta" || e.metaKey === true) &&
		ignoreKeys.indexOf("meta") < 0 &&
		ignoreKeys.indexOf("cmd") < 0
	    ) {
		if (this.keysDown.indexOf("meta") < 0) keysDown.push("meta")
		if (key === "meta") modKeys.push(key)
	    }
	    if (
		(key === "shift" || e.shiftKey === true) &&
		ignoreKeys.indexOf("shift") < 0
	    ) {
		if (this.keysDown.indexOf("shift") < 0) keysDown.push("shift")
		if (key === "shift") modKeys.push(key)
	    }

	    if ([...ignoreKeys, ...modKeys].indexOf(key) < 0) {
		keysDown.push(key)
	    }

	    this.keysDown = [...this.keysDown, ...keysDown]

	    const keyPress = this.keysDown.join("+")
	    if (this.listeners[keyPress]) {
		// automatically preventDefault on the key
		if (preventDefault) {
		    e.preventDefault()
		}
		this.listeners[keyPress].forEach(method => method(e))
	    }

	    // create an interval to check the duration every 100ms
	    this.resetTimer()
	    this.createTimer(() => {
		keysDown.forEach(key => {
		    if (this.holdTimer >= this.holdDurations[key]) {
			// we're paseed the duration - execute and reset the timer check
			this.holdListeners[keyPress](e)
			this.resetTimer()
		    }
		})
	    })

	    // check if we fulfilled a sequence
	    if (this.sequenceTimer !== undefined) {
		window.clearTimeout(this.sequenceTimer)
	    }

	    // Track previously pressed keys
	    this.previousKeys.push(...keysDown)

	    const sequenceKeys = this.previousKeys.join(",")
	    if (this.sequenceListeners[sequenceKeys] !== undefined) {
		this.sequenceListeners[sequenceKeys](e)
		if (this.sequenceTimer) {
		    window.clearTimeout(this.sequenceTimer)
		    this.sequenceTimer = undefined
		    this.previousKeys = []
		}
	    }

	    // we have 2s to keep sequencing keys otherwise we'll reset the previous array
	    this.sequenceTimer = window.setTimeout(() => {
		this.previousKeys = []
		this.sequenceTimer = undefined
	    }, 2000)
	}
    }

    /**
     * Unset the previously pressed keys
     */
    keyUp = e => {
	const keysUp = []
	const key = e.key?.toLowerCase()

	if (key === "control" || e.ctrlKey === true) {
	    keysUp.push("ctrl")
	}
	if (key === "alt" || e.altKey === true) {
	    keysUp.push("alt")
	}
	if (key === "meta" || e.metaKey === true) {
	    keysUp.push("meta")
	}
	if (key === "shift" || e.shiftKey === true) {
	    keysUp.push("shift")
	}

	const specialKeys = ["control", "alt", "meta", "shift"]
	if (specialKeys.indexOf(key) < 0) {
	    keysUp.push(key)
	}

	this.keysDown = this.keysDown.filter(key => keysUp.indexOf(key) < 0)

	this.resetTimer()
    }

    /**
     * On blur of the window, we unset keyDown because the keyUp event happens outside of the window focus
     */
    windowBlur = e => {
	this.keysDown = []

	this.resetTimer()
    }

    /**
     * Register a new shortcut for the application
     *
     * Set a holdDuration to execute the shortcut only after the set keys have been pressed for the
     * configured duration.
     */
    registerShortcut = (method, keys = [], title, description, holdDuration) => {
	const nextShortcuts = [...this.shortcuts]

	// do we need to hold this shortcut?
	const hold = holdDuration !== undefined
	const duration = holdDuration !== undefined ? holdDuration : 0
	const transformedKeys = ShortcutProvider.transformKeys(keys)

	// create new shortcut
	const shortcut = {
	    //id: Date.now().toString(36),
	    id: Math.random().toString(36).substr(2, 9),
	    description,
	    hold,
	    holdDuration: duration,
	    keys: transformedKeys,
	    method,
	    sequence: false,
	    title
	}
	// add it to the list of shortcuts
	nextShortcuts.push(shortcut)

	// create a listener for each key
	transformedKeys.forEach(key => {
	    if (hold) {
		this.holdDurations[key] = duration
		this.holdListeners[key] = method
	    } else {
		if (!this.listeners[key]) {
		    this.listeners[key] = []
		}

		this.listeners[key] = [...this.listeners[key], method]
	    }
	})

	this.shortcuts = nextShortcuts

	this.setState({
	    shortcuts: nextShortcuts
	})
    }

    /**
     * Register a shortcut that listens for a sequence of keys to be pressed
     *
     * Unlike the registerShortcut method, the array of keys represents the keys that need to be
     * pressed in the configured order
     */
    registerSequenceShortcut = (method, keys = [], title, description) => {
	const nextShortcuts = [...this.shortcuts]

	// create new shortcut
	const shortcut = {
	    id: Date.now().toString(36),
	    description,
	    hold: false,
	    holdDuration: 0,
	    keys,
	    method,
	    sequence: true,
	    title
	}

	// check if we already have existing keys for the new keys being passed
	let exists = false
	const keyEvent = keys.join(",").toLowerCase()
	Object.keys(this.sequenceListeners).forEach(existingKey => {
	    exists = exists || keyEvent === existingKey
	})

	if (!exists) {
	    nextShortcuts.push(shortcut)

	    // create a listener for each key
	    this.sequenceListeners[keyEvent] = method

	    this.shortcuts = nextShortcuts

	    this.setState({
		shortcuts: nextShortcuts
	    })
	}
    }

    /**
     * Reset the keypress timer
     */
    resetTimer = () => {
	if (this.holdInterval !== undefined) {
	    window.clearInterval(this.holdInterval)
	    this.holdInterval = undefined
	    this.holdTimer = 0
	}
    }

    /**
     * Programatically trigger a shortcut using a key sequence
     *
     * Note: This ignores any ignored keys meaning this method is useful for bypassing otherwise
     * disabled shortcuts.
     */
    triggerShortcut = key => {
	const transformedKeys = ShortcutProvider.transformKeys([key])
	const transformKey = transformedKeys.pop()
	if (transformKey && this.listeners[transformKey]) {
	    this.listeners[transformKey].forEach(method => method())
	}
    }

    /**
     * Remove a shortcut from the application
     */
    unregisterShortcut = (keys, sequence = false) => {
	const transformedKeys = ShortcutProvider.transformKeys(keys)
	if (!sequence) {
	    transformedKeys.forEach(key => {
		if (this.listeners[key]) {
		    this.listeners[key].pop()

		    if (this.listeners[key].length === 0) {
			delete this.listeners[key]
		    }
		}
		delete this.holdListeners[key]
		delete this.holdDurations[key]
	    })
	} else {
	    const keyEvent = transformedKeys.join(",")
	    delete this.sequenceListeners[keyEvent]
	}

	// Delete the shortcut
	const nextShortcuts = this.shortcuts.filter(({ keys: shortcutKeys }) => {
	    let match = true
	    shortcutKeys.forEach(shortcutKey => {
		match = match && transformedKeys.indexOf(shortcutKey) >= 0
	    })
	    return !match
	})

	this.shortcuts = nextShortcuts

	this.setState({
	    shortcuts: nextShortcuts
	})
    }

    /**
     * Render
     */
    render() {
	const { shortcuts } = this.state
	const { children } = this.props
	const providerProps = {
	    registerSequenceShortcut: this.registerSequenceShortcut,
	    registerShortcut: this.registerShortcut,
	    shortcuts,
	    triggerShortcut: this.triggerShortcut,
	    unregisterShortcut: this.unregisterShortcut
	}

	return (
	    <ShortcutContext.Provider value={providerProps}>
		{children}
	    </ShortcutContext.Provider>
	)
    }
}

/**
 * Default withShortcut HOC
 *
 * Wraps any child component with the ShortcutConsumer to pass on enhancer functionality
 */
export const withShortcut = Child =>
    class WithShortcut extends React.Component {
	render() {
	    return (
		<ShortcutConsumer>
		    {shortcutProps => <Child {...this.props} shortcut={shortcutProps} />}
		</ShortcutConsumer>
	    )
	}
    }

