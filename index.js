const express = require('express')
const socketserver = require('ws')
const Child_process = require('child_process')
const fs = require('fs');
const readline = require('readline');
const app = express()

//* Server open
const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => console.log(`server on ${PORT}`))

//* websocket
let detect_state = false
var temp = 0
var temp_2 = 1000
const wss = new socketserver.Server({ server })
wss.on('connection', (ws) => {
    //! connection
    console.log('connection')
    // ws.send('working to connection')

    //! send message
    ws.on('message', (message) => {
        console.log('message:', message.toString())

        //! turn on cam
        if (message.toString() == "true") {
            //cam
            detect_state = true
            ws.send("1")
        }
        //! turn off cam
        else if (message.toString() == "false") {
            detect_state = false
            ws.send("2")
        }
        else if (message.toString() == "monitor") {
            if (detect_state == true) {
                detect_cam()
                const timer = setInterval(() => {
                    if (detect_state == false) {
                        clearInterval(timer)
                        detect_state = true
                        closeCamera()
                        console.log("camera close")
                        ws.send("camera close")
                    }
                    else {
                        // read image to send
                        photoData = fs.readFileSync('./results/test_00000123.jpg');
                        ws.send(photoData)

                        // read object num
                        try {
                            content = fs.readFileSync('./results/log.txt', 'utf8');
                            ws.send(content)

                            if (content == "0") {
                                temp = 1
                            }
                            else if (content == "1") {
                                temp = 2
                            }
                            else {
                                temp = 3
                            }

                            //
                            if (temp != temp_2) {
                                try {
                                    process_gpio.kill()
                                } catch (error) {
                                    console.error('An error occurred:', error);
                                }
                                temp_2 = temp
                                gpio(temp_2)
                            }

                        } catch (error) {
                            console.error('read error', error);
                        }
                    }
                }, 4000)
            }
            else {
                console.log("state:", detect_state)
                ws.send("system close")
            }
        }
        else if (message.toString() == "leave page") {
            detect_state = false
            ws.send("leaving page")
        }
        else if (message.toString() == "mode1") {
            try {
                process_gpio.kill()
            } catch (error) {
                console.error('An error occurred:', error);
            }
            gpio(1)
            ws.send("1")
        }
        else if (message.toString() == "mode2") {
            try {
                process_gpio.kill()
            } catch (error) {
                console.error('An error occurred:', error);
            }
            gpio(2)
            ws.send("2")
        }
        else if (message.toString() == "mode3") {
            try {
                process_gpio.kill()
            } catch (error) {
                console.error('An error occurred:', error);
            }
            gpio(3)
            ws.send("3")
        }
        else if (message.toString() == "mode4") {
            try {
                process_gpio.kill()
            } catch (error) {
                console.error('An error occurred:', error);
            }
            gpio(4)
            ws.send("4")
        }
        else {
            ws.send('invalid control')
        }
    })

    //! close
    ws.on('close', () => {
        console.log('client close')
        ws.send('working to close')
    })
})


// GPIO
let process_gpio
function gpio(state) {
    process.chdir(currentWorkingDirectory);
    process_gpio = Child_process.spawn('python', [
        "./gpio/gpio.py", state
    ])

    process_gpio.stdout.on('data', (data) => {
        console.log(data.toString())
    })

    process_gpio.stderr.on('data', (data) => {
        console.log(data.toString())
    })

    process.chdir('./yolo-tiny/darknet');
}

// detect
let process_detect
const currentWorkingDirectory = process.cwd(); // save current directory
function detect_cam() {
    process.chdir(currentWorkingDirectory);
    process.chdir('./yolo-tiny/darknet'); // exchange to target directory
    process_detect = Child_process.spawn('sudo', [
        './darknet',
        'detector',
        'demo',
        'cfg/coco.data',
        'cfg/yolov3-tiny.cfg',
        'yolov3-tiny.weights',
        '-c',
        '1'
    ], { stdio: 'inherit' });

    process_detect.on('exit', () => {
        console.log(`Child process exited`);
        // console.log(temp)
        // console.log(temp_2)
        process.chdir(currentWorkingDirectory);
    });

}

// close cam
function closeCamera() {
    const { exec } = require('child_process');

    const command = 'sudo fuser -k /dev/video1';

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`error：${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`device close：${stderr}`);
            return;
        }
        console.log(`extra：${stdout}`);
    });
}

// tx2_cam
// let process_cam
// function cam(signal) {
//     process_cam = Child_process.spawn('/home/nvidia/.pyenv/shims/python', [
//         "./cam/cam.py", signal
//     ])

//     process_cam.stdout.on('data', (data) => {
//         console.log(data.toString())
//         // identify velocity
//         if (data == 'true') {
//             //? state
//             gpio(0)
//         }
//         else if (data == 'false') {
//             //? state
//             gpio(1)
//         }
//     })

//     process_cam.stderr.on('data', (data) => {
//         console.error(data)
//     })

// }