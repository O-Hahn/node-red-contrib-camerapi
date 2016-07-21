# imports
import io
import array
import cv2
import sys
import numpy
import os
import json
from test.test_support import temp_cwd

# Get parameters
fileName = sys.argv[1]
filePath = sys.argv[2]
fileFormat = sys.argv[3]
detect = sys.argv[4]
minFaceX = int(sys.argv[5])
minFaceY = int(sys.argv[6])
mode = sys.argv[7]

# Change to the operating folder
locDir, locName = os.path.split(os.path.abspath(sys.argv[0])) 
os.chdir(locDir)

onlyFileName, onlyFileExt = os.path.splitext(fileName)

# Get the file
if fileFormat == 'jpeg': 
    fileFormat = 'jpg'

image = cv2.imread(filePath + fileName)

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
dict = {}
l = []

# Set the amount of detected faces
item = {'facecount': len(faces)}
dict.update(item)


# Draw a rectangle around every found face or split the face into several files
i=0
for (x,y,w,h) in faces:
    i = i + 1
    if mode == "1":
        face = image[y:y+h,x:x+w]
        tempfqn = filePath + onlyFileName + '_face_' + str(i) + '.' + fileFormat
        cv2.imwrite(tempfqn, face)
        l.append({'filefqn':tempfqn, 'filename':onlyFileName+'_face_'+str(i)+'.'+fileFormat, 'filepath':filePath, 'fileformat':fileFormat,'startX':x, 'startY':y, 'toX':x+w, 'toY': y+h})
        # item = {'face'+str(i): {'filefqn':tempfqn, 'filename':fileName+str(i), 'filepath':filePath, 'fileformat':fileFormat,'startX':x, 'startY':y, 'toX':x+w, 'toY': y+h}}
        # dict.update(item)
    else:
        cv2.rectangle(image,(x,y),(x+w,y+h),(255,0,0),2)
        l.append({'startX':x, 'startY':y, 'toX':x+w, 'toY': y+h})
        #item = {'face'+str(i): {'startX':x, 'startY':y, 'toX':x+w, 'toY': y+h}}
        #dict.update(item)

# Save the modified rectangle image with the detected faces
if mode == "0" and i > 0:
    tempfqn = filePath + onlyFileName +'_faces.' + fileFormat
    cv2.imwrite(tempfqn, image)
    l.append({'facepic': {'filefqn':tempfqn, 'filename':onlyFileName+'_faces.'+fileFormat, 'filepath':filePath, 'fileformat':fileFormat}})
    #item = {'facepic': {'filefqn':tempfqn, 'filename':fileName+'0', 'filepath':filePath, 'fileformat':fileFormat}}
    #dict.update(item)

# save into JSON
item = {'faces':l}
dict.update(item)

# Print out the faces
print(json.dumps(dict))