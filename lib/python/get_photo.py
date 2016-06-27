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
hflip = sys.argv[6]
vflip = sys.argv[7]

# Set vflip and hflip if needed
if sys.argv[6] == "1":
    hflip = True
else:
    hflip = False
if sys.argv[7] == "1":
    vflip = True
else:
    vflip = False
    
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
        camera.hflip = hflip
        camera.vflip = vflip
        camera.capture(picfile, format='jpeg')
else:
    with picamera.PiCamera() as camera:
        camera.resolution = (int(resolutionX), int(resolutionY))
        camera.hflip = hflip
        camera.vflip = vflip
        camera.capture(picfile, format=fileFormat)

# flush the buffer
picfile.close()