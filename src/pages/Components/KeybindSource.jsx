import { Preferences } from '@capacitor/preferences';
const deriveSource = async () => {
    let defaults = {
	"Global": {
	    "Go back": [["b"]],
	    "Go forwards": [["f"]],
	    "Logout": [['‎']],
	    'New perspective': [['‎']],
	    'Add to inbox': [['i'], ['cmd+i'], ['ctrl+enter']],
	},
	"Upcoming": {
	    'Open item': [['o']], 
	    'Navigate down': [['j'], ['ArrowDown']], 
	    'Navigate up': [['k'], ['ArrowUp']], 
	    'Jump field up': [['shift+k'], ['shift+ArrowUp']], 
	    'Jump field down': [['shift+j'], ['shift+ArrowDown']], 
	    'Complete item': [['Enter'], ["x"]],
	    'Complete task': [['c+t']],
	    'Edit task': [['e+t']], 
	    'Show timeline': [['s+t']], 
	},
	"Completed": {
	    'Navigate down': [['j'], ['ArrowDown']], 
	    'Navigate up': [['k'], ['ArrowUp']], 
	    'Open item': [['o']],
	    'Complete item': [['Enter'], ["x"]],
	    'Complete task': [['c+t']],
	    'Edit task': [['e+t']],
	    "Fetch more": [['shift+f+m'], ['s+m']]
	},
	"Calendar": {
	    'Next month': [['l'], ['ArrowRight']], 
	    'Previous month': [['h'], ['ArrowLeft']], 
	}, 
	"Perspectives": {
	    'Navigate down': [['j'], ['ArrowDown']], 
	    'Navigate up': [['k'], ['ArrowUp']], 
	    'Complete item': [['Enter'], ["x"]],
	    'Complete task': [['c+t']],
	    'Open item': [['e+t'], ['o']],
	    'Edit perspective': [['e+p']],
	    'Edit name': [['e+n']],
	    'Delete perspective': [['‎']], 
	},
	"Projects": {
	    'Create new project': [['n+p']], 
	    'Create new task': [['n+t']], 
	    'Toggle project complete': [['c+p']], 
	    'Delete project': [['‎']], 
	    'Navigate down': [['j'], ['ArrowDown']], 
	    'Navigate up': [['k'], ['ArrowUp']],
	    'Open item': [['o']], 
	    'Edit task': [['e+t']], 
	    'Complete item': [['Enter'], ["x"]], 
	    'Complete Task': [['c+t']], 
	    'Edit name': [['e+n']],
	},
	"Settings": {
	    'Settings': [["cmd+,"]],
	}
    };

    let kbs = await Preferences.get({ key: 'keybinds' });
    kbs = JSON.parse(kbs.value);
    console.log(kbs)
    if (kbs == null) {
	kbs = defaults;
	await Preferences.set({ key: 'keybinds', value: JSON.stringify(defaults) });
    }
    // await Preferences.set({ key: 'keybinds', value: JSON.stringify(defaults) });
    return kbs
}

const keybindSource = deriveSource()

export default keybindSource;
