const { app, BrowserWindow } = require('electron')

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
        //'frame': false,
        //'transparent': true, TODO: MacOS fix
    })
    win.on('page-title-updated', function(e) {
        e.preventDefault()
    });

    win.removeMenu();
    // and load the index.html of the app.
    win.loadFile('auth.html')
}

app.name = 'Condution';
app.whenReady().then(createWindow)
