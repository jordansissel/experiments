const url = require("url")
const { secrets } = require("./secrets")
const { app, BrowserWindow } = require('electron')
const { parse } = require('path')
const path = require('path')

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.loadFile('src/index.html')
    // win.loadURL('http://localhost/?code=asdfb')

    const { session: { webRequest } } = win.webContents


    // Electron doesn't support multiple onBeforeRequest.
    // https://github.com/electron/electron/issues/18301
    webRequest.onBeforeRequest((details, callback) => {
        // Filter to block facebook and other tracking stuff we honestly don't
        // need for the Napster SDK to function.
        // These domains will be accessed when doing the OAuth2 steps.
        if (details.url.match(/facebook|amazon/)) {
            console.log("Blocking URL: " + details.url)
            callback({ cancel: true })
            return
        }

        console.log("Loading URL: " + details.url)

        if (details.url.match(/^http:\/\/localhost\/\?code=/)) {
            callback({ cancel: true })

            console.log("Found auth code: " + details.url)
            const parsed = new URL(details.url)
            const code = parsed.searchParams.get('code')

            const https = require("https")

            const requrl = new URL(url.format({
                protocol: "https",
                hostname: "api.rhapsody.com",
                port: 443,
                pathname: "/oauth/access_token",
                query: {
                    client_id: secrets.API_KEY,
                    client_secret: secrets.API_SECRET,
                    response_type: "code",
                    code: code,
                    redirect_uri: "http://localhost",
                    grant_type: "authorization_code"

                }
            }))
            console.log(requrl.toString())
            req = https.request(requrl, { method: "POST" }, (res) => {
                res.on('data', (chunk) => {
                    console.log("BODY: " + chunk);
                })
                res.on("close", () => {
                    console.log("Got auth response");
                    console.log(res.headers)
                })
            }).end()
        } else {
            // Have to explicitly callback w/ cancel:false to allow the request.
            callback({
                cancel: false,
            })
        }

    });
}

app.whenReady().then(() => {
    // XXX: Login?
    // curl -v -X POST -u "{api_key}:{api_secret}" -d "username=user@domain.com&password=secret&grant_type=password" "https://api.napster.com/oauth/token"

    console.log("Starting up...")
    createWindow()

    // for macOS, per Electron's docs.
    app.on('activate', function () { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
    // For non-macOS
    app.on('window-all-closed', function () { if (process.platform !== 'darwin') app.quit() })
})

