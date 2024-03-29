const puppeteer = require('puppeteer');
const express = require("express");
const url = require("url");
const https = require("https");
const WebSocket = require("ws");
const Mustache = require("mustache");
const EventEmitter = require("events");

const { secrets } = require("./secrets");
const { wsrpc } = require("./wsrpc")

console.log("WSRPC", wsrpc)

async function httpsrequest(url, options) {
    return new Promise((resolve, reject) => {
        console.log("httpsrequest(" + url.toString() + ")")
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
        if (response.statusCode != 200) {
            throw 'Login to Napster failed: ' + response.statusMessage + ' -- ' + body
        }
        const result = JSON.parse(body)

        this.access_token = result.access_token
        this.refresh_token = result.refresh_token
        return result
    }

    async search(query, options={}) {
        // http://api.napster.com/v2.2/search?apikey=YTkxZTRhNzAtODdlNy00ZjMzLTg0MWItOTc0NmZmNjU4Yzk4&query=weezer&type=artist
        const searchurl = new URL("https://api.napster.com/v2.2/search")
        searchurl.search = new url.URLSearchParams({
            apikey: this.api_key,
            query: query,
            per_type_limit: 5,
        }).toString()

        const [response, body] = await httpsrequest(searchurl, { 
            method: "GET",
            headers: {
                "Authorization": "Bearer " + this.access_token,
                "Accept": "application/json"
            }
         })

        if (response.statusCode != 200) {
            throw 'Search query failed: ' + response.statusMessage + ' -- ' + body
        }
        return JSON.parse(body)
    }
}

(async () => {
    // Login on startup...
    // XXX: Store and refresh with any available refreshToken when possible.
    const napsterapi = new NapsterAPI(secrets.API_KEY, secrets.API_SECRET)
    const auth = await napsterapi.auth(secrets.user, secrets.password);
    const token = auth.access_token;

    console.log("Auth token: " + token);

    // Websocket interface between 
    // * the Napster music player running in Chrome/puppeteer
    // * and, the controller http api
    const wss = new WebSocket.Server({ noServer: true });
    const events = new EventEmitter()

    wss.on('connection', (ws) => {
        wsrpc.setup(ws)

        wsrpc.send(ws, "auth", {
            accessToken: auth.access_token,
            refreshToken: auth.refresh_token,
            api_key: secrets.API_KEY
        })

        events.on('play', (args) => {
            wsrpc.send(ws, "play", args)
        })
    })

    const player = express();
    player.use(express.static('public/player'))

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
        // I think headless is required for DRM audio playback
        headless: false,

        // Disable the viewport restrictions and try to act like a regular browser?
        defaultViewport: null,

        // Use Chrome, not the built-in chromium. This is necessarry to get DRM audio playback
        executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",

        args: [
            // Allow autoplay on media. This allows JavaScript to start playing audio without UI interaction
            // See also: https://developer.chrome.com/blog/autoplay/
            '--autoplay-policy=no-user-gesture-required'
        ]
    })

    const page = await browser.newPage();
    await page.goto('http://localhost:3000');

    // Now let's do the server part which will let me control Napster from my phone.
    const controller = express();
    controller.use(express.static('public/controller'))
    const controllerHttpServer = controller.listen("3001", "0.0.0.0", async () => {
        console.log("Listening controller...")
    })

    controller.get("/search.json", (request, response) => {
        console.log("/search: ", request.query)
        napsterapi.search(request.query["query"]).then((results) => {
            response.append("Content-Type", "application/json")
            response.send(JSON.stringify(results))
        })
    })

    controller.get("/search", (request, response) => {
        console.log("/search: ", request.query)
        napsterapi.search(request.query["query"]).then((results) => {
            response.append("Content-Type", "text/html")

            // XXX: Make order dynamic? Based on data.search.order
            console.log(results.search.albums)
            response.send(
                Mustache.render(`
                    <ol>
                        {{#artists}}
                        <li class="entry"> 
                            <img src="https://api.napster.com/imageserver/v2/artists/{{ id }}/images/356x237.jpg"> 
                            <div class="name"> {{ name }} </div>
                            <div class="kind"> (artist) </div>
                        </li>
                        {{/artists}}
                    </ol>
                    <ol>
                        {{#albums}}
                        <li class="entry" onclick="play('{{ id }}')">
                            <img src="https://api.napster.com/imageserver/v2/albums/{{ id }}/images/356x237.jpg"> 
                            <div class="name"> {{ name }} </div>
                            <div class="kind"> (album by {{ artistName }}) </div>
                        </li>
                        {{/albums}}
                    </ol>
                `, results.search.data)
            )
        })
    })

    controller.get("/play/:id", (request, response) => {
        console.log("/play ", request.params.id)
        events.emit("play", { id: request.params.id })
    })

    page.on("close", () => {
        browser.close()
        playerHttpServer.close()
        controllerHttpServer.close()
    })

    browser.on('disconnected', () => {
        playerHttpServer.close()
        controllerHttpServer.close()
        browser.close()
    })

    // For debugging, launch the controller app as well.
    const controllerPage = await browser.newPage();
    await controllerPage.goto('http://localhost:3001');
    controllerPage.on("close", () => {
        browser.close()
        playerHttpServer.close()
        controllerHttpServer.close()
    })
})();