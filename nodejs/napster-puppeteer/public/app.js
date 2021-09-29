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
    auth(message) {
        console.log("Got auth message")
        Napster.init({ consumerKey: message.api_key, isHTML5Compatible: true })

        Napster.player.on('ready', (e) => {
            Napster.member.set({
                accessToken: message.accessToken,
                refreshToken: message.refreshToken,
            })
            // Napster.player.auth();
            // Napster.api.get(false, '/tracks/top', ({ tracks }) => {
            //     console.log(tracks[0]);
            //     Napster.player.clearQueue();
            //     Napster.player.play(tracks[0].id.charAt(0).toUpperCase() + tracks[0].id.slice(1));

            // })
        })

        Napster.player.on('error', (error) => {
            console.log("Napster error!", error.data)
        })

        Napster.player.on('playevent', (e) => {
            console.log(e.data);
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
        RPC.auth(message.auth)
    } else {
        console.log("Unknown message: ", message)
    }
}