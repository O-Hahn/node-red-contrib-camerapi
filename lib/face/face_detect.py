import io
import picamera
import cv2
import sys
import numpy
import os
import json
from test.test_support import temp_cwd

# Get parameters
filefqn = sys.argv[1]
filePath = sys.argv[2]
fileFormat = sys.argv[3]
detect = sys.argv[6]
minFaceX = sys.argv[7]
minFaceY = sys.argv[8]
extract = sys.argv[9]

# Change to the operating folder
locDir = os.path.abspath(sys.argv[0]) + "/lib/face/" 
os.chdir(locDir)

# Get the file
imgage = cv2.imread(filefqn)

# Load a cascade file for detecting faces
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")

# Load a cascade file for eye detection
#eye_cascade = cv2.CascadeClassifier('haarcascade_eye.xml')

# Convert to grayscale
gray = cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)

# Look for faces in the image
faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(minFaceX, minFaceY)
)

# Build an JSON Object for return
dir_f = {}

# Set the amount of detected faces
dir_f.update('facecount',faces)

# Draw a rectangle around every found face or split the face into several files
i=0
for (x,y,w,h) in faces:
    i = i + 1
    if exctract == "1":
        face = image[(x,y), (x+w,y+h)]
        tempfqn = filePath + filename + str(i) + '.' + fileFormat
        cv2.imwrite(tempfqn, face)
        dir_f.update(i,{'filefqn':tempfqn, 'filename':filename+str(i), 'fileformat':fileFormat,'startX':x, 'startY':y, 'toX':x+w, 'toY': y+h})
    else:
        cv2.rectangle(image,(x,y),(x+w,y+h),(255,0,0),2)
        dir_f.update(i,{'startX':x, 'startY':y, 'toX':x+w, 'toY': y+h})


# Save the modified rectangle image with the detected faces
if extract == "0":
    cv2.imwrite(filePath + filename + '.' + fileFormat, image)

# Print out the faces
print(json.dumps(dir_f))
