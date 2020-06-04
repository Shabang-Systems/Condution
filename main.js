const { app, BrowserWindow, systemPreferences, nativeTheme, ipcMain } = require('electron')
const { autoUpdater } = require("electron-updater");
autoUpdater.checkForUpdatesAndNotify();



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
    
    nativeTheme.addListener("updated", function() {
        if(nativeTheme.shouldUseDarkColors) {
            win.setBackgroundColor("#161616");
            win.webContents.send("systheme-dark", "hello")
        } else {
            win.setBackgroundColor("#f4f4f4");
            win.webContents.send("systheme-light", "hello")
        }
    });
    ipcMain.on('updatecheck', (event, arg) => {
        autoUpdater.checkForUpdatesAndNotify();
    })

    win.once('ready-to-show', function() {
        win.show()
    });
}


app.name = 'Condution';
app.whenReady().then(createWindow)
