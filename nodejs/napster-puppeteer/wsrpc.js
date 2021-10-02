
// DIY rpc system over websockets. There's other solutions out there that you could use.
// Sometimes I roll my own stuff for fun or exploration for these weird hobby projects.
const wsrpc = {
    async setup(ws) {
        const callbacks = {}

        // New websocket client.
        ws.on('message', (message) => {
            const payload = JSON.parse(message)
            console.log("Got message")
            console.log(payload)

            // If there's a message_id field, this message in response to a request we made
            // So let's find the callback for that message_id and invoke it.
            if (payload.message_id in callbacks) {
                const {callback, kind} = callbacks[payload.message_id]

                // { message_id: "...", "<kind>": { message... } }
                callback(payload[kind])
            } else {
                console.log("No callback for websocket rpc: " + message)
            }
        })

    },

    async send(ws, kind, message, callback) {
        return new Promise((resolve, reject) => {
            const payload = {
                message_id: "id-" + Math.random() + Date.now()
            }
            payload[kind] = message
            ws.send(JSON.stringify(payload))

            console.log("Sending")
            console.log(payload)

            if (callback !== undefined) {
                console.log("Expecting response from message:", payload)
                callbacks[payload.message_id] = (message) => {
                    resolve()
                }
            }
        })
    }
}

exports.wsrpc = wsrpc