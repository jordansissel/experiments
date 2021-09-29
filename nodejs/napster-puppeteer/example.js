const puppeteer = require('puppeteer');
const express = require("express");
const url = require("url");
const https = require("https");
const WebSocket = require("ws");

const { secrets } = require("./secrets");
const { stringify } = require('querystring');

async function httpsrequest(url, options) {
    return new Promise((resolve, reject) => {
        console.log(url.toString())
        https.request(url, options, (response) => {
            console.log("Got response", response.statusMessage)
            var body = '';
            // XXX: HTTP response code erro checking?

            response.on("error", (error) => reject(error))
            response.on("data", (chunk) => { body += chunk })
            response.on("close", () => { resolve([response, body]) })
        }).end()
    })
}

class NapsterAPI {
    constructor(api_key, api_secret) {
        this.api_key = api_key
        this.api_secret = api_secret
    }

    async auth(user, password) {
        // Login to napster w/ user+pass and get an access token needed for future API calls
        const loginurl = new URL("https://api.napster.com/oauth/token")

        loginurl.search = new url.URLSearchParams({
            username: user,
            password: password,
            grant_type: "password"
        }).toString()

        // API call has user:pass as the API Key and API Secret
        loginurl.username = this.api_key
        loginurl.password = this.api_secret

        const [response, body] = await httpsrequest(loginurl, { method: "POST" })
        const result = JSON.parse(body)
        return result
    }
}

(async () => {
    const napsterapi = new NapsterAPI(secrets.API_KEY, secrets.API_SECRET)

    const auth = await napsterapi.auth(secrets.user, secrets.password);
    const token = auth.access_token;

    console.log("Auth token: " + token);

    const player = express();
    const wss = new WebSocket.Server({ noServer: true });
    wss.on('connection', (ws) => {
        // New websocket client.
        ws.on('message', (message) => {
            const m = JSON.parse(message)
            console.log("Got message", m)
        })

        ws.send(JSON.stringify({
            auth: {
                accessToken: auth.access_token,
                refreshToken: auth.refresh_token,
                api_key: secrets.API_KEY
            }
        }))
    })

    player.use(express.static('public'))

    const playerHttpServer = player.listen("3000", "localhost", async () => {
        console.log("Listening...")
    })

    // Setup websocket handling.
    playerHttpServer.on('upgrade', (request, socket, head) => {
        const { pathname } = new URL(request.url, `http://${request.headers.host}`);

        if (pathname == "/ws") {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request, socket);
            });
        } else {
            socket.write('HTTP/1.1 405 Method not allowed\r\n\r\n');
            socket.destroy();
            return;
        }
    });


    // Need to use chrome, not the default chromium.
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        args: [
            // Allow autoplay on media. This allows JavaScript to start playing audio without UI interaction
            // See also: https://developer.chrome.com/blog/autoplay/
            '--autoplay-policy=no-user-gesture-required'
        ]
    })

    browser.on('disconnected', () => {
        playerHttpServer.close()
    })

    const page = await browser.newPage();
    await page.goto('http://localhost:3000');

    page.on("close", () => {
        browser.close()
        playerHttpServer.close()
    })
    // page.on('load', console.log("Loaded!!"))

    // await browser.close();
})();