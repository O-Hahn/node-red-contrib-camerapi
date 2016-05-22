/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * Authors:
 *    - Olaf Hahn
 *    - Lars Probst
 *    - Ansgar Schmidt
 **/


module.exports = function(RED) {
    "use strict";
    
    var settings = RED.settings;
    var events = require("events");
    var exec = require('child_process').exec;
    var isUtf8 = require('is-utf8');
    var bufMaxSize = 32768;  // Max serial buffer size, for inputs...

    // CameraPI Take Photo Node
    function CameraPiTakePhotoNode(config) {
    	// Create this node
        RED.nodes.createNode(this,config);
        
        // set parameters and save locally 
		this.filename =  config.filename;
		this.fileformat = config.fileformat;
		this.resolution =  config.resolution;
		this.detectfaces = config.detectfaces;
		this.facesize =  config.facesize;
		this.name =  config.name;
		this.activeProcesses = {};

		var node = this;
		
        // if there is an new input
		node.on('input', function(msg) {
			
         	var fs = require("fs-extra");
         	var uuid = require('node-uuid').v4();
        	var imagebuffer = require('stream').Readable;
            var cl = "python /home/pi/Git/face/face_webcam.py";
            var detect;
            var resolution;
            var facesize;
            var fileformat;
            var filename;
            var filepath;

         	node.status({fill:"green",shape:"dot",text:"node-red:common.status.connected"});

         	if ((msg.filename) && (msg.filename.trim() !== "")) {
         			filename = msg.filename;
        	} else {
        		if (node.filename) {
             		filename = node.filename;
        		} else {
             		filename = "pic_" + uuid;
        		}
        	}
 			cl += " "+filename;

         	if ((msg.filepath) && (msg.filepath.trim() !== "")) {
     			filepath = msg.filepath;
         	} else {
         		if (node.filepath) {
         			filepath = node.filepath;
         		} else {
         			filepath = "/home/pi/faces";
         		}
         	}
 			cl += " "+filepath;
     		
         	if ((msg.fileformat) && (msg.fileformat.trim() !== "")) {
     			fileformat = msg.fileformat;
         	} else {
         		if (node.fileformat) {
         			fileformat = node.fileformat;
         		} else {
         			fileformat = "jpg";
         		}
         	}
 			cl += " "+fileformat;
         	
         	if ((msg.resolution) && (msg.resolution !== "")) {
         		resolution = msg.resolution; 
         		} else {
         			if (node.resolution) {
                 		resolution = node.resolution;	        			
         			} else {
                 		resolution = "1";	        			         					
         			}
            	}
         	if (resolution == "1") {
             	cl += " 320 240"; 
         	} else if (resolution == "2" ) {
             	cl += " 640 480";          		
         	} else if (resolution == "3" ) {
             	cl += " 800 600";          		
         	} else  {
             	cl += " 1024 768";          		
         	}

         	if ((msg.detectfaces) && (msg.detectfaces !== "")) {
         		detect = msg.detectfaces;
         	} else {
         		if (node.detectfaces) {
             		detect = node.detectfaces;
         		} else {
             		detect = "0";
         		}
         	}
     		cl += " " + detect;

         	if ((msg.facesize) && (msg.facesize !== "")) {
         		facesize = msg.facesize; 
         	} else {
         		if (node.facesize) {
             		facesize = node.facesize;	        			         			
         		} else {
             		facesize = "1";	      
             		}
         	}
         	if (facesize == "1") {
             	cl += " 15 20"; 
         	} else if (resolution == "2" ) {
             	cl += " 20 25";          		
         	} else  {
             	cl += " 25 30";          		
         	}
         	
            if (RED.settings.verbose) { node.log(cl); }
            
            var child = exec(cl, {encoding: 'binary', maxBuffer:10000000}, function (error, stdout, stderr) {
                var retval = new Buffer(stdout,"binary");
                try {
                    if (isUtf8(retval)) { retval = retval.toString(); }
                } catch(e) {
                    node.log(RED._("exec.badstdout"));
                }
                
                if (detect == "1") {
                    if (RED.settings.verbose) { node.log(retval); }
                	//msg.facecount = parseInt(retval);
                	msg.facecount = 5;
                }
                
                // check error 
                var msg2 = {payload:stderr};
                var msg3 = null;
                //console.log('[exec] stdout: ' + stdout);
                //console.log('[exec] stderr: ' + stderr);
                if (error !== null) {
                    msg3 = {payload:error};
                    //console.log('[exec] error: ' + error);
                    msg.payload = "";
                    msg.filename = "";
                    msg.faces = [];
                } else {
                    msg.payload = filepath+filename+"."+fileformat;
                    msg.filename = filename+"."+fileformat;
                    msg.faces = [];
                    if (detect == "1") {
                    	for (var i = 1; i <= msg.facecount; i++) {
                    		msg.faces.push(filepath+filename+i.toString()+"."+fileformat);
                    	}
                    }                	
                }
                
                node.status({});
                node.send(msg);
                delete node.activeProcesses[child.pid];
            });
            
            child.on('error',function(){});
            
            node.activeProcesses[child.pid] = child;
         	
        });
            
        // SpeakerPi has a close 
        node.on('close', function(done) {
        	node.closing = true;
            done();
        });	
    }
	RED.nodes.registerType("camerapi-takephoto",CameraPiTakePhotoNode);
}
