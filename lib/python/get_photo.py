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
brightness = sys.argv[8]
contrast = sys.argv[9]
sharpness = sys.argv[10]
image_effect = sys.argv[11]

# consider jpeg
if fileFormat == "jpg":
    i_format = 'jpeg'
else: 
    i_format = fileFormat

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
filefqn = filePath + fileName

# Change to the operating folder
locDir,locName = os.path.split(os.path.abspath(sys.argv[0]))
os.chdir(locDir)

# Open the File to be stored
picfile = open(filefqn, 'wb')

# take the photo
with picamera.PiCamera() as camera:
        camera.resolution = (int(resolutionX), int(resolutionY))
        camera.hflip = hflip
        camera.vflip = vflip
        camera.brightness = brightness
        camera.sharpness = sharpness
        camera.contrast = contrast
        camera.image_effect = image_effect
        camera.capture(picfile, i_format)

# flush the buffer
picfile.close()