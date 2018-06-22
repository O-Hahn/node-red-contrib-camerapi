# node-red-contrib-camerapi
A <a href="http://nodered.org" target="_new">Node-RED</a> node to take photos on a Raspberry Pi. This node will only work on an Raspberry Pi with a Raspberry Pi Camera enabled.

## Installation

Run the following command in the root directory of your Node-RED install or home directory (usually ~/.node-red) and will also install needed libraries.

```sh
        npm install node-red-contrib-camerapi
```

### Additionally you have to install on the Raspberry Pi 

First you have to install a Raspberry Pi Camera physically and don't forget to enable the Camera in raspi-config. See <a href="https://projects.raspberrypi.org/en/projects/getting-started-with-picamera" target="_new">Pi Camera setup</a>. Also check if you have installed the picamera module for python. 
```sh
        sudo apt-get update
        sudo apt-get install python-picamera python3-picamera
```

If you are using the default path during the fileoption set - the path /home/pi/Pictures will be used.

### Runtime information
This node is tested on RASPBIAN, Nodejs V6.x LTS and NPM 3.x on Node-Red 0.18. 

## Usage

### TakePhoto

This node is to take a photo in a given format directly from the Raspberry Pi Camera. Using the Filemode the image of the photo is stored into the file-system and <b>msg.payload</b> will give you the path and the filename including extension to the photo. In Buffermode the image will reside as a buffer in <b>msg.payload</b>. 
For the possible parameters see documentation under <a href="http://picamera.readthedocs.io/en/release-1.13/index.html" target="_new"> picamera parameter settings</a>.