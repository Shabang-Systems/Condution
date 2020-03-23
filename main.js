const { app, BrowserWindow } = require('electron')

function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({
        'width': 1000,
        'height': 700,
        'minWidth': 900,
        'minHeight': 600,
        'maxWidth': 1200,
        'maxHeight': 800,
        'fullscreen': false,
        'title': "Conduction",
        'webPreferences': {
            'nodeIntegration': true
        },
        'titleBarStyle': 'hiddenInset'
    })
    win.on('page-title-updated', function(e) {
        e.preventDefault()
    });

    // and load the index.html of the app.
    win.loadFile('index.html')
}

app.name = 'Condution';
app.whenReady().then(createWindow)
