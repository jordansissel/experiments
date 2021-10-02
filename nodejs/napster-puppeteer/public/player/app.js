'use strict'

if (typeof Napster === 'undefined') {
    $('body').html("There has been an error while loading Napster.js. Please check the console for errors.")
}

function openWebSocket() {
    const port = document.location.port || (document.location.protocol === "https:" ? "443" : "80")
    const wsurl = "ws://" + document.location.hostname + ":" + port + "/ws"
    return new WebSocket(wsurl)
}

const RPC = {
    async auth(message) {
        Napster.init({ consumerKey: message.api_key, isHTML5Compatible: true })

        Napster.player.on('error', (error) => {
            console.log("Napster error!", error.data)
        })

        Napster.player.on('playevent', (e) => {
            console.log(e.data);
        })


        Napster.player.on('ready', (e) => {
            Napster.member.set({
                accessToken: message.accessToken,
                refreshToken: message.refreshToken,
            })
        })
    },

    async search({ query, per_type_limit = 5, searchtype }) {
        const params = new URLSearchParams({
            query: query,
            per_type_limit: per_type_limit,
        })

        if (searchtype !== undefined) {
            params.append("type", type)
        }

        return new Promise((resolve, reject) => {
            Napster.api.get(false, "/search?" + params.toString(), (data) => {
                resolve(data)
            })
        })
    }
}

let ws = openWebSocket()

ws.onerror = (event) => {
    console.log("WebSocket error", event)

    // Bad idea?
    ws = openWebSocket()
}

ws.onopen = (event) => {
    ws.send(JSON.stringify({ foo: "bar" }))
}

ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    console.log("Received:", message)

    if ('auth' in message) {
        RPC.auth(message.auth).then(() => { 
            const payload = { 
                message_id: message.message_id 
            }
            ws.send(JSON.stringify(payload))
        })
    } else if ('search' in message) {
        RPC.search(message.search).then((results) => {
            const payload = { 
                message_id: message.message_id ,
                search: results
            }
            ws.send(JSON.stringify(payload))
        }).catch((error) => { console.log("Search failed", error) })
    } else {
        console.log("Unknown message: ", message)
    }
}