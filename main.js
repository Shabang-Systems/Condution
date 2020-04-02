const { app, BrowserWindow } = require('electron')

function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({
        'width': 950,
        'height': 650,
        'minWidth': 950,
        'minHeight': 650,
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
    win.loadFile('app.html')
}

app.name = 'Condution';
app.whenReady().then(createWindow)
