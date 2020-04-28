const { app, BrowserWindow, systemPreferences, nativeTheme } = require('electron')

function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({
        'width': 950,
        'height': 650,
        'minWidth': 950,
        'minHeight': 650,
        'fullscreen': false,
        'title': "Condution",
        'webPreferences': {
            'nodeIntegration': true
        },
        'titleBarStyle': 'hiddenInset',
        'show': false,
    })

    if(nativeTheme.shouldUseDarkColors) {
        win.setBackgroundColor("#161616");
    } else {
        win.setBackgroundColor("#f4f4f4");
    }

    win.on('page-title-updated', function(e) {
        e.preventDefault()
    });

    win.removeMenu();
    // and load the main of the app.
    win.loadFile('app.html')
    win.once('ready-to-show', function() {
        win.show()
    });
}


app.name = 'Condution';
app.whenReady().then(createWindow)
