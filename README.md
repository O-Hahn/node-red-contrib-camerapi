# node-red-contrib-camerapi
A <a href="http://nodered.org" target="_new">Node-RED</a> node to take photos on a Raspberry Pi. This node will only work on an Raspberry Pi with a Raspberry Pi Camera and also utilizes the <a href="http://opencv.org" target="_new">OpenCV</a> Framework to detect faces.


Install
-------

Run the following command in the root directory of your Node-RED install or home directory (usually ~/.node-red) and will also install needed libraries.

        npm install node-red-contrib-camerapi

### Additionally you have to install on the Raspberry Pi 

The detect node also utilizes the <b>OpenCV Framework</b> to give some additional capabilities to the photo processing (detect photo). Therefore you have to install it on your Raspberry Pi. 
Take a look at this <a href="http://www.pyimagesearch.com/2015/07/27/installing-opencv-3-0-for-both-python-2-7-and-python-3-on-your-raspberry-pi-2/" target="_new">tutorial</a> to see how to install.

Don't forget to enable the Raspberry Pi Camera in raspi-config. 

Usage
-----

Provides some nodes to take a photo, capture faces and delete them.


### TakePhoto

This node is to take a photo in a given format directly from the Raspberry Pi Camera. The image of the photo is stored into the file-system and <b>msg.payload</b> will give you the path and the filename including extension to the photo.

### DetectFaces

If you choose the Face-Detection (based on OpenCV Framework) - you will also get in msg.facescount the number of detected faces and a JSON with the necessary information to the detected face (x,y,x+w,y+h) and if in filemode the name, path and format of the file with the face cut from the image. 

### DeletePhoto

Will delete a taken photo from the given path with or without the extracted faces. 

