# -*- coding: utf-8 -*-
import cv2  
import sys
import threading

# argv
signal = sys.argv[1]
    
# create windom
def windom_create():
    while signal:
        # 讀取影像幀
        ret, frame = camera.read()
        
        if not ret:
            print("無法讀取影像幀")
            break

        # 在這裡可以對影像進行處理或顯示
        cv2.imshow("Camera", frame)

        # 保存每一帧图像，覆盖之前的图像文件
        filename = "frame.jpg"
        cv2.imwrite(filename, frame)

        # 按下 'q' 鍵退出迴圈
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("camera break")
            break

# read from node write
def read_messge():
    # # 讀取來自 Node.js 的訊息
    for line in sys.stdin:
        message = line.strip()
        print("接收到來自 Node.js 的訊息：{}".format(message))
        global signal
        if message == "false":
            signal = False
            print("signal work break")
            break
    print("work break")

# open cam
def open_camera(camera_index):
    # 使用GStreamer的nvarguscamerasrc元件來打開CSI攝像頭
    pipeline = cv2.VideoCapture('nvarguscamerasrc sensor-id={} ! video/x-raw(memory:NVMM), width=(int)640, height=(int)480, format=(string)NV12, framerate=(fraction)30/1 ! nvvidconv ! video/x-raw, format=(string)BGRx ! videoconvert ! video/x-raw, format=(string)BGR ! appsink'.format(camera_index), cv2.CAP_GSTREAMER)

    if not pipeline.isOpened():
        print("無法打開CSI攝像頭{}".format(camera_index))
        return None

    return pipeline


# 設定要使用的CSI攝像頭索引
camera_index = 0

# 打開CSI攝像頭
camera = open_camera(camera_index)
if camera is None:
    exit()

# 建立並啟動執行緒
camera_thread = threading.Thread(target=windom_create)
nodejs_thread = threading.Thread(target=read_messge)
camera_thread.start()
nodejs_thread.start()

# 等待執行緒結束
while True:
    camera_thread.join()
    if signal == False:
        break
nodejs_thread.join()

# 釋放資源
camera.release()
cv2.destroyAllWindows()