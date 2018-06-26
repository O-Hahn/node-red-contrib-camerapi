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
rotation = sys.argv[6]
hflip = sys.argv[7]
vflip = sys.argv[8]
brightness = int(sys.argv[9])
contrast = int(sys.argv[10])
sharpness = int(sys.argv[11])
imageeffect = sys.argv[12]
exposuremode = sys.argv[13]
iso = int(sys.argv[14])
agcwait = float(sys.argv[15])
quality = int(sys.argv[16])
led = True if int(sys.argv[17]) == 1 else False
awb = sys.argv[18]

# consider jpeg
if fileFormat == "jpg":
    i_format = "jpeg"
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
if fileFormat == "jpeg":
    fileFormat = "jpg"   
filefqn = filePath + fileName

# Change to the operating folder
locDir,locName = os.path.split(os.path.abspath(sys.argv[0]))
os.chdir(locDir)

# Open the File to be stored
picfile = open(filefqn, "wb")

# take the photo
with picamera.PiCamera() as camera:
        camera.resolution = (int(resolutionX), int(resolutionY))
        camera.rotation = rotation
        camera.hflip = hflip
        camera.vflip = vflip
        camera.brightness = brightness
        camera.sharpness = sharpness
        camera.contrast = contrast
        camera.image_effect = imageeffect
        camera.exposure_mode = exposuremode
        camera.iso = iso
        camera.led = led
        camera.awb_mode = awb
        
        time.sleep(agcwait)
        
        if i_format == "jpeg":
            camera.capture(picfile, i_format, quality=quality)
        else:
            camera.capture(picfile, i_format)
            

# flush the buffer
picfile.close()
