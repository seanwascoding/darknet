const express = require('express')
const socketserver = require('ws')
const child_process = require('child_process')
const process = require('process')
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
        if (message.toString() == "true")
            ws.send('turn on')
        // TO DO (child_hood => camera)

        else if (message.toString() == "false")
            ws.send("turn off")
        else
            ws.send('invalid control')
    })

    // close
    ws.on('close', () => {
        console.log('client close')
        ws.send('working to close')
    })
})

// Yolov8
function cam(){
    let process = child_process.spawn('python',[
        "./cam/cam.py"
    ])

    process.stdout.on('data',(data)=>{
        console.log(data)
        if(data == 'true'){
            // drive
            
        }
    })

    process.stderr.on('data', (data)=>{
        console.error(data)
    })
}