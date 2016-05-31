# node-red-contrib-camerapi
A <a href="http://nodered.org" target="_new">Node-RED</a> node to take photos on a Raspberry Pi. This node will only work on an Raspberry Pi with a Raspberry Pi Camera and also utilizes the <a href="http://opencv.org" target="_new">OpenCV</a> Framework to detect faces.


Install
-------

Run the following command in the root directory of your Node-RED install or home directory (usually ~/.node-red) and will also install needed libraries.

        npm install node-red-contrib-camerapi

### Additionally you have to install on the Raspberry Pi 

This Node also utilizes the OpenCV Framework to give some additional capabilities to the photo processing. Therefore you have to install it on your Raspberry Pi. Take a look at this tutorial to see how to install.

Don't forget to enable the Raspberry Pi Camera in raspi-config. 

Usage
-----

Provides some nodes to take a photo, capture faces and delete them.


### TakePhoto

This node is to take a photo in a given format directly from the Raspberry Pi Camera. The image of the photo is stored into the file-system and msg.payload will give you the path and the filename including extension to the photo.

### DetectFaces
If you choose the Face-Detection - you will also get in msg.facescount the number of detected faces. 
To implement all nodes with only one configuration setting - there is a config node implemented for the GrovePi Board. It contains internal values - and has only a name. 

### DeletePhoto

