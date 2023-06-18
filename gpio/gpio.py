import Jetson.GPIO as GPIO
import time
import sys

# mode state
signal = sys.argv[1]

# 
led_1=7
led_2=11
led_3=12
# 
led_4=13
led_5=15
led_6=16   # broken 
led_7=18
# 
led_8=22
led_9=29
led_10=31

# init gpio
def init():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(led_1, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(led_2, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(led_3, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(led_4, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(led_5, GPIO.OUT, initial=GPIO.LOW)
    # GPIO.setup(led_6, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(led_7, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(led_8, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(led_9, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(led_10, GPIO.OUT, initial=GPIO.LOW)

# less_car
def no_car():
    # close
    GPIO.output(led_2, GPIO.LOW)
    GPIO.output(led_3, GPIO.LOW)
    GPIO.output(led_3, GPIO.LOW)

    # yellow
    GPIO.output(led_1, GPIO.HIGH)
    time.sleep(1)
    GPIO.output(led_1, GPIO.LOW)
    time.sleep(1)

# middle
def middle_car():
    # green
    GPIO.output(led_4, GPIO.HIGH)
    time.sleep(5)
    # yellow
    GPIO.output(led_4, GPIO.LOW)
    GPIO.output(led_5, GPIO.HIGH)
    time.sleep(1)
    # red
    GPIO.output(led_5, GPIO.LOW)
    GPIO.output(led_7, GPIO.HIGH)
    time.sleep(5)
    GPIO.output(led_7, GPIO.LOW)

# many
def many_car():
    # green
    GPIO.output(led_8, GPIO.HIGH)
    time.sleep(10)
    # yellow
    GPIO.output(led_8, GPIO.LOW)
    GPIO.output(led_9, GPIO.HIGH)
    time.sleep(1)
    # red
    GPIO.output(led_9, GPIO.LOW)
    GPIO.output(led_10, GPIO.HIGH)
    time.sleep(10)
    GPIO.output(led_10, GPIO.LOW)

# main
def main(signal):
    try:
        if signal=='1':
            while True:
                no_car()
        elif signal=='2':
            while True:
                middle_car()
        elif signal=='3':
            while True:
                many_car()
        elif signal=='4':
            print("turn off")
    except KeyboardInterrupt:
        init()
        GPIO.cleanup()

# start
if __name__=='__main__':
    signal = sys.argv[1]
    print(signal)
    init()
    main(signal)