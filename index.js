const express = require('express')
const socketserver = require('ws')
const child_process = require('child_process')
const app = express()

// Server open
const PORT = 8080
const server = app.listen(PORT, () => console.log(`server on ${PORT}`))

// websocket
const wss = new socketserver.Server({ server })
wss.on('connection', (ws) => {
    // connection
    console.log('connection')
    ws.send('working to connection')

    // send message
    ws.on('message', (message) => {
        console.log('message:', message.toString())
        if (message.toString() == "true") {
            ws.send('turn on')
            //cam
            cam('true')
        }
        else if (message.toString() == "false") {
            ws.send("turn off")
            //
            cam('false')
        }
        else {
            ws.send('invalid control')
        }
    })

    // close
    ws.on('close', () => {
        console.log('client close')
        ws.send('working to close')
    })
})

// Yolov8
function cam(state) {
    let process_cam = child_process.spawn('python', [
        "./cam/cam.py", state
    ])

    process_cam.stdout.on('data', (data) => {
        console.log(data)
        // identify velocity
        if (data == 'true') {
            // drive
            gpio()
        }
        else if (data == 'false') {
            gpio()
        }
    })

    process_cam.stderr.on('data', (data) => {
        console.error(data)
    })
}

// GPIO
function gpio() {
    let process_gpio = child_process.spawn('sudo', [
        "./gpio/setGPIO.o",
    ])

    process_gpio.stdout.on('data', (data)=>{
        console.log(data)
    })

    process_gpio.stderr.on('data', (data)=>{
        console.log(data)
    })

}