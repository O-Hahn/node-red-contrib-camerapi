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
        this.filemode = config.filemode;
		this.filename =  config.filename;
		this.filedefpath = config.filedefpath;
		this.filepath = config.filepath;
		this.fileformat = config.fileformat;
		this.resolution =  config.resolution;
		this.fliph = config.fliph;
		this.flipv = config.flipv;
		this.sharpness = config.sharpness;
		this.brightness = config.brightness;
		this.contrast = config.contrast;
		this.image_mode = config.image_mode;
		this.name =  config.name;
		this.activeProcesses = {};

		var node = this;
		
        // if there is an new input
		node.on('input', function(msg) {
		
         	var fsextra = require("fs-extra");
         	var fs = require("fs");
         	var uuidv4 = require('uuid/v4');
			var uuid = uuidv4();
			var os = require('os');
         	var localdir = __dirname;
			var homedir = os.homedir();
         	var defdir = homedir + "/Pictures/";
            var cl = "python " + localdir + "/lib/python/get_photo.py";
            var resolution;
            var fileformat;
            var filename;
            var filepath;
            var filemode;
            var filefqn;
            var fliph, flipv;
			var sharpness;
			var brightness;
			var contrast;
			var image_mode;

         	node.status({fill:"green",shape:"dot",text:"connected"});

         	// Check the given filemode
         	if((msg.filemode) && (msg.filemode !== "")) {
         		filemode = msg.filemode;
         	} else {
         		if (node.filemode) {
         			filemode = node.filemode;
         		} else {
         			filemode = "1";
         		}
         	}
         		
         	if (filemode == "0") {
				// Buffermode
         		filename = "pic_" + uuid + '.jpg';
         		fileformat = "jpeg";
         		filepath = homedir + "/";
         		filefqn = filepath + filename;
                if (RED.settings.verbose) { node.log("camerapi takephoto:"+filefqn); }
         		console.log("CameraPi (log): Tempfile - " + filefqn);

                cl += " " + filename + " " + filepath + " " + fileformat;
         	} else if (filemode == "2") {
				// Generate
         		filename = "pic_" + uuid + '.jpg';
         		fileformat = "jpeg";
         		filepath = defdir;
         		filefqn = filepath + filename;
                if (RED.settings.verbose) { node.log("camerapi takephoto:"+filefqn); }
         		console.log("CameraPi (log): Generate - " + filefqn);

                cl += " " + filename + " " + filepath + " " + fileformat;
			 }  else {
	             if ((msg.filename) && (msg.filename.trim() !== "")) {
	         			filename = msg.filename;
	        	} else {
	        		if (node.filename) {
	             		filename = node.filename;
	        		} else {
	             		filename = "pic_" + uuid + '.jpg';
	        		}
	        	}
	 			cl += " "+filename;
	
	         	if ((msg.filepath) && (msg.filepath.trim() !== "")) {
	     			filepath = msg.filepath;
	         	} else {
	         		if (node.filepath) {
	         			filepath = node.filepath;
	         		} else {
	         			filepath = defdir;
	         		}
	         	}
	 			cl += " "+filepath;
	     		
	         	if ((msg.fileformat) && (msg.fileformat.trim() !== "")) {
	     			fileformat = msg.fileformat;
	         	} else {
	         		if (node.fileformat) {
	         			fileformat = node.fileformat;
	         		} else {
	         			fileformat = "jpeg";
	         		}
	         	}
	 			cl += " "+fileformat;         		
         	}
         	
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
         	} else if (resolution == "4" ) {
             	cl += " 1024 768";          		
         	} else if (resolution == "5" ) {
             	cl += " 1920 1080";          		
         	} else  {
             	cl += " 2592 1944";          		
         	}

         	if ((msg.fliph) && (msg.fliph !== "")) {
         		fliph = msg.fliph; 
         		} else {
         			if (node.fliph) {
                 		fliph = node.fliph;	        			
         			} else {
                 		fliph = "1";	        			         					
         			}
            	}
         	if ((msg.flipv) && (msg.flipv !== "")) {
         		flipv = msg.flipv; 
         		} else {
         			if (node.flipv) {
                 		flipv = node.flipv;	        			
         			} else {
                 		flipv= "1";	        			         					
         			}
            	}
         	cl += " " + fliph + " " + flipv;

			// brightness
         	if ((msg.brightness) && (msg.brightness !== "")) {
         		brightness = msg.brightness; 
         		} else {
         			if (node.brightness) {
                 		brightness = node.brightness;	        			
         			} else {
                 		brightness = "0";	        			         					
         			}
            	}
			cl += " " + brightness;          		

			// contrast
         	if ((msg.contrast) && (msg.contrast !== "")) {
         		contrast = msg.contrast; 
         		} else {
         			if (node.contrast) {
                 		contrast = node.contrast;	        			
         			} else {
                 		contrast = "0";	        			         					
         			}
            	}
			cl += " " + contrast;          		

			// sharpness
         	if ((msg.sharpness) && (msg.sharpness !== "")) {
         		sharpness = msg.sharpness; 
         		} else {
         			if (node.sharpness) {
                 		sharpness = node.sharpness;	        			
         			} else {
                 		sharpness = "0";	        			         					
         			}
            	}
			cl += " " + sharpness;          		

			// image_mode
         	if ((msg.image_mode) && (msg.image_mode !== "")) {
         		image_mode = msg.image_mode; 
         		} else {
         			if (node.image_mode) {
                 		image_mode = node.image_mode;	        			
         			} else {
                 		image_mode = "none";	        			         					
         			}
            	}
			cl += " " + image_mode;          		

         	if (RED.settings.verbose) { node.log(cl); }
            
            filefqn = filepath + filename;

            var child = exec(cl, {encoding: 'binary', maxBuffer:10000000}, function (error, stdout, stderr) {
                var retval = new Buffer(stdout,"binary");
                try {
                    if (isUtf8(retval)) { retval = retval.toString(); }
                } catch(e) {
                    node.log(RED._("exec.badstdout"));
                }
                                
                // check error 
                var msg2 = {payload:stderr};
                var msg3 = null;
                //console.log('[exec] stdout: ' + stdout);
                //console.log('[exec] stderr: ' + stderr);
                if (error !== null) {
                    msg3 = {payload:error};
					console.error("CameraPi (err): "+ error);
                    msg.payload = "";
                    msg.filename = "";
                    msg.fileformat = "";
                    msg.filepath = "";
                } else {
                    msg.filename = filename;
                    msg.filepath = filepath;
                    msg.fileformat = fileformat;

                    // get the raw image into payload and delete tempfile on buffermode
                    if (filemode == "0") {
                    	// put the imagefile into payload
                    	msg.payload = fs.readFileSync(filefqn);

                    	// delete tempfile
               	   		fsextra.remove(filefqn, function(err) {
                   		  if (err) return console.error("CameraPi (err): "+ err);
                   		  console.log("CameraPi (log): " + filefqn + " remove success!")
                   		});	           				           			
                    } else {
                        msg.payload = filefqn;
						console.log("CameraPi (log): " + filefqn + " written with success!")
                    }
                }
                
                node.status({});
                node.send(msg);
                delete node.activeProcesses[child.pid];
            });
            
            child.on('error',function(){});
            
            node.activeProcesses[child.pid] = child;
         	
        });
            
        // CameraPi-TakePhoto has a close 
        node.on('close', function(done) {
        	node.closing = true;
            done();
        });	
    }
	RED.nodes.registerType("camerapi-takephoto",CameraPiTakePhotoNode);
}
