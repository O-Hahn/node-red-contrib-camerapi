import picamera
import sys
import os
import time

# Get parameters
fileName = sys.argv[1]
filePath = sys.argv[2]
fileFormat = sys.argv[3]
resolutionX = sys.argv[4]
resolutionY = sys.argv[5]

# Set the filefqn
if fileFormat == 'jpeg':
    fileFormat = 'jpg'    
filefqn = filePath + fileName + "." + fileFormat

# Change to the operating folder
locDir,locName = os.path.split(os.path.abspath(sys.argv[0]))
os.chdir(locDir)

# Open the File to be stored
picfile = open(filefqn, 'wb')

# Define the camera
if fileFormat == "jpg":
    with picamera.PiCamera() as camera:
        camera.resolution = (int(resolutionX), int(resolutionY))
        camera.hflip = True
        camera.vflip = True
        camera.capture(picfile, format='jpeg')
else:
    with picamera.PiCamera() as camera:
        camera.resolution = (int(resolutionX), int(resolutionY))
        camera.hflip = True
        camera.vflip = True
        camera.capture(picfile, format=fileFormat)

# flush the buffer
picfile.close()