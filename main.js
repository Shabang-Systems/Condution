const { app, BrowserWindow } = require('electron')

function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({
        'width': 800,
        'height': 600,
        'minWidth': 600,
        'minHeight': 400,
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
