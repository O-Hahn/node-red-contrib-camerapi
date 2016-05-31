import picamera
import sys
import os
import time

# Get parameters
filename = sys.argv[1]
filePath = sys.argv[2]
fileFormat = sys.argv[3]
resolutionX = sys.argv[4]
resolutionY = sys.argv[5]

# Set the filefqn
filefqn = filePath + filename + "." + fileFormat

# Change to the operating folder
locDir = os.path.abspath(sys.argv[0]) + "/lib/face/" 
os.chdir(locDir)

# Open the File to be stored
picfile = open(filefqn, 'wb')

# Define the camera
if fileFormat == "png":
    with picamera.PiCamera() as camera:
        camera.resolution = (int(resolutionX), int(resolutionY))
        camera.capture(stream, format='png')
        # Camera warm-up time
        time.sleep(2)
        camera.capture(picfile)
else:
    with picamera.PiCamera() as camera:
        camera.resolution = (int(resolutionX), int(resolutionY))
        camera.capture(stream, format='jpeg')
        # Camera warm-up time
        time.sleep(2)
        camera.capture(picfile)

# flush the buffer
picfile.close()