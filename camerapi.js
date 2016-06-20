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
		this.name =  config.name;
		this.activeProcesses = {};

		var node = this;
		
        // if there is an new input
		node.on('input', function(msg) {
		
         	var fsextra = require("fs-extra");
         	var fs = require("fs");
         	var uuid = require('node-uuid').v4();
         	var localdir = __dirname;
         	var defdir = '/home/pi/images';
            var cl = "python " + localdir + "/lib/python/get_photo.py";
            var resolution;
            var fileformat;
            var filename;
            var filepath;
            var filemode;
            var filefqn;

         	node.status({fill:"green",shape:"dot",text:"node-red:common.status.connected"});

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
         		filename = "pic_" + uuid;
         		fileformat = "jpg";
         		filepath = defdir + "/";
         		filefqn = filepath + filename + "." + fileformat;
                if (RED.settings.verbose) { node.log("camerapi takephoto:"+filefqn); }
         		console.log("CameraPi (log): Tempfile - " + filefqn);

                cl += " " + filename + " " + filepath + " " + fileformat;
         	} else {
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
	         			filepath = defdir + "/images/";
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
         	} else  {
             	cl += " 1024 768";          		
         	}

            if (RED.settings.verbose) { node.log(cl); }
            
            filefqn = filepath + filename + "." + fileformat;

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
                    //console.log('[exec] error: ' + error);
                    msg.payload = "";
                    msg.filename = "";
                    msg.fileformat = "";
                    msg.filepath = "";
                } else {
                    msg.filename = filename;
                    msg.filepath = filepath;
                    msg.fileformat = fileformat;

                    // get the raw image into payload and delete tempfile
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

	// CameraPI Detect Node
    function CameraPiDetectNode(config) {
    	// Create this node
        RED.nodes.createNode(this,config);
        
        // set parameters and save locally 
        this.filemode = config.filemode;
		this.filename =  config.filename;
		this.filedefpath = config.filedefpath;
		this.filepath = config.filepath;
		this.fileformat = config.fileformat;
		this.detect = config.detect;
		this.framesize =  config.framesize;
		this.extract = config.extract;
		this.occurance = config.occurance;
	    this.repeat = config.repeat;
		this.name =  config.name;
		this.activeProcesses = {};

		var node = this;
		
        // if there is an new input
		node.on('input', function(msg) {
			
         	var fsextra = require("fs-extra");
         	var fs = require("fs");
         	var localdir = __dirname;
         	var defdir = '/home/pi/images';
            var cl = "python " + localdir + "/lib/python/face_detect.py";
         	var uuid = require('node-uuid').v4();
         	var filemode;
            var filename;
            var filepath;
            var fileformat;
            var filefqn;
            var detect;
            var framesize;
            var extract;

         	node.status({fill:"green",shape:"dot",text:"node-red:common.status.connected"});

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
         		filename = "pic_" + uuid;
         		fileformat = "jpg";
         		filepath = defdir + "/";
         		filefqn = filepath + filename + "." + fileformat;

         		if (RED.settings.verbose) { node.log("camerapi detect:"+filefqn); }
         		console.log("CameraPi (log): Tempfile - " + filefqn);

                // put the raw image into a tempfile if running in buffer mode
            	fs.writeFileSync(filefqn, msg.payload);

         		cl += " " + filename + " " + filepath + " " + fileformat;
         	} else {
             	
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
             			if (detect == "1") {
                 			filepath = defdir + "/faces/";
             			} else {
                 			filepath = defdir + "/objects/";
             			}
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
         	}

     		filefqn = filepath + filename + "." + fileformat;

         	if ((msg.detect) && (msg.detect !== "")) {
         		detect = msg.detect;
         	} else {
         		if (node.detect) {
             		detect = node.detect;
         		} else {
             		detect = "1";
         		}
         	}
     		cl += " " + detect;

         	if ((msg.framesize) && (msg.framesize !== "")) {
         		framesize = msg.framesize; 
         	} else {
         		if (node.framesize) {
             		framesize = node.framesize;	        			         			
         		} else {
             		framesize = "1";	      
             		}
         	}
         	if (framesize == "1") {
             	cl += " 15 20"; 
         	} else if (framesize == "2" ) {
             	cl += " 20 25";          		
         	} else  {
             	cl += " 25 30";          		
         	}

         	if ((msg.extract) && (msg.extract !== "")) {
         		extract = msg.extract; 
         	} else {
         		if (node.extract) {
             		extract = node.extract;	        			         			
         		} else {
             		extract = "0";	      
             		}
         	}
     		cl += " " + extract;

            if (RED.settings.verbose) { node.log(cl); }
            
            var child = exec(cl, {encoding: 'binary', maxBuffer:10000000}, function (error, stdout, stderr) {
                var retjson = {};
            	var retval = new Buffer(stdout,"binary");
                try {
                    if (isUtf8(retval)) { retval = retval.toString(); }
                } catch(e) {
                    node.log(RED._("exec.badstdout"));
                }

                // console.log('camerapi-detect:'+retval);

                msg.faces = [];

                // check error 
                var msg2 = {payload:stderr};
                var msg3 = null;
                //console.log('[exec] stdout: ' + stdout);
                //console.log('[exec] stderr: ' + stderr);
                if (error !== null) {
                    msg3 = {payload:error};
                    //console.log('[exec] error: ' + error);
                    msg.payload = 0;
                    // msg.filename = "";
                    // msg.filepath = "";
                    // msg.fileformat = "";
                } else {
                    if (detect == "1") {
                        if (RED.settings.verbose) { node.log('camerapi-detect:'+retval); }
                        
                        retjson = JSON.parse(retval);
                        console.log('camerapi-detect:' + retjson);
                        msg.facecount = retjson.facecount;
                        msg.payload = retjson.facecount;
                    	msg.faces = retjson.faces;
                    }                	

                    if (filemode == "0") {
                    	// delete tempfile
               	   		fsextra.remove(filefqn, function(err) {
                   		  if (err) return console.error("CameraPi (err): "+ err);
                   		  console.log("CameraPi (log): " +  filefqn + " remove success!")
                   		});	           				           			
                    } else {
                        msg.payload = filefqn;
                    }
                }
                
                node.status({});
                node.send(msg);
                delete node.activeProcesses[child.pid];
            });
            
            child.on('error',function(){});
            
            node.activeProcesses[child.pid] = child;
         	
        });
            
        // CameraPi-Detect has a close 
        node.on('close', function(done) {
        	node.closing = true;
            done();
        });	
    }
	RED.nodes.registerType("camerapi-detect",CameraPiDetectNode);
	
	// CameraPI Store Node
    function CameraPiStoreNode(config) {
    	// Create this node
        RED.nodes.createNode(this,config);
        
        // set parameters and save locally 
        this.filemode = config.filemode;
		this.filename =  config.filename;
		this.filedefpath = config.filedefpath;
		this.filepath = config.filepath;
		this.fileformat = config.fileformat;
		this.region = config.region;
		this.tandantId = config.tendantId;
		this.userId = config.userId;
		this.userName = config.userName;
		this.password = config.password;
		this.contianer = config.container;
		this.name =  config.name;
		this.activeProcesses = {};

		var node = this;
		
        // if there is an new input
		node.on('input', function(msg) {
			
            var pkgcloud = require('pkgcloud-bluemix-objectstorage');
         	var fsextra = require("fs-extra");
         	var fs = require("fs");
         	var localdir = __dirname;
         	var defdir = '/home/pi/images';
         	var uuid = require('node-uuid').v4();
         	
         	var filemode;
            var filename;
            var filepath;
            var fileformat;
            var filefqn;           
            var container;
 
         	node.status({fill:"green",shape:"dot",text:"node-red:common.status.connected"});

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
         		filename = "pic_" + uuid;
         		fileformat = "jpg";
         		filepath = defdir + "/";
         		filefqn = filepath + filename + "." + fileformat;

         		if (RED.settings.verbose) { node.log("camerapi detect:"+filefqn); }
         		console.log("CameraPi (log): Tempfile - " + filefqn);

                // put the raw image into a tempfile if running in buffer mode
            	fs.writeFileSync(filefqn, msg.payload);
         	} else {
             	
     			if ((msg.filename) && (msg.filename.trim() !== "")) {
    	     			filename = msg.filename;
    	    	} else {
    	    		if (node.filename) {
    	         		filename = node.filename;
    	    		} else {
    	         		filename = "pic_" + uuid;
    	    		}
    	    	}
    	
    			if ((msg.filepath) && (msg.filepath.trim() !== "")) {
         			filepath = msg.filepath;
             	} else {
             		if (node.filepath) {
             			filepath = node.filepath;
             		} else {
             			if (detect == "1") {
                 			filepath = defdir + "/faces/";
             			} else {
                 			filepath = defdir + "/objects/";
             			}
             		}
             	}
     	 		     		
             	if ((msg.fileformat) && (msg.fileformat.trim() !== "")) {
         			fileformat = msg.fileformat;
             	} else {
             		if (node.fileformat) {
             			fileformat = node.fileformat;
             		} else {
             			fileformat = "jpg";
             		}
             	}
         	}

     		filefqn = filepath + filename + "." + fileformat;

            if (RED.settings.verbose) { node.log("camerapi - store: " + filefqn); }

         // Create a config object
             var config = {};

         // Specify Openstack as the provider
             config.provider = "openstack";

         // Authentication url
             config.authUrl = 'https://identity.open.softlayer.com/';
             config.region= 'dallas';

         // Use the service catalog
             config.useServiceCatalog = true;

         // true for applications running inside Bluemix, otherwise false
             config.useInternal = false;

         // projectId as provided in your Service Credentials
             config.tenantId = node.tendantId;

         // userId as provided in your Service Credentials
             config.userId = node.userId;

         // username as provided in your Service Credentials
             config.username = node.userName;

         // password as provided in your Service Credentials
             config.password = node.password;

         // This is part which is NOT in original pkgcloud. This is how it works with newest version of bluemix and pkgcloud at 22.12.2015. 
         //In reality, anything you put in this config.auth will be send in body to server, so if you need change anything to make it work, you can. PS : Yes, these are the same credentials as you put to config before. 
         //I do not fill this automatically to make it transparent.

             config.auth = {
                 tenantId: node.tendantId, //projectId
                 passwordCredentials: {
                     userId: node.userId, //userId
                     password: node.password //password
                 }
             };

             console.log("config: " + JSON.stringify(config));

         // Create a pkgcloud storage client
             var storageClient = pkgcloud.storage.createClient(config);

         // Authenticate to OpenStack
              storageClient.auth(function (error) {
                 if (error) {
                     console.error("storageClient.auth() : error creating storage client: ", error);
                 }
                 else {
                     // Print the identity object which contains your Keystone token.
                     console.log("storageClient.auth() : created storage client: " + JSON.stringify(storageClient._identity));
                 }

             });
              
              storageClient.getContainer(node.container, function(err, container) {
            	  if (err) {
                      console.error("getContainer() : error accessing container: ", error);           		  
            	  } else {
                      console.log("getContainer() : container : " + node.container);           		              		  
            	  }
              });
              
              // get Filesize
              var stats = fs.statSync(filefqn);
              var fileSizeInBytes = stats["size"];

              // Options for Upload
              var options = {
            		    // required options
            		    container: container, // this can be either the name or an instance of container
            		    remote: filename+"."+fileformat, // name of the new file
            		    contentType: 'application/image', // optional mime type for the file, will attempt to auto-detect based on remote name
            		    size: fileSizeInBytes // size of the file
            		};
                          
              // Upload File
              var readStream = fs.createReadStream(filefqn);
              var writeStream = client.upload({
                container: contianer,
                remote: filename+"."+fileformat
              });

              writeStream.on('error', function(err) {
                // handle your error case
              });

              writeStream.on('success', function(file) {
                  // Delete if temp file given
                  if (filemode == "0") {
                  	// delete tempfile
             	   		fsextra.remove(filefqn, function(err) {
                 		  if (err) return console.error("CameraPi Store (err): "+ err);
                 		  console.log("CameraPi Store (log): " +  filefqn + " remove success!")
                 		});	           				           			
                  } else {
                      msg.payload = filefqn;
                  }
              });

              readStream.pipe(writeStream);              

		});
            
        // CameraPi-Detect has a close 
        node.on('close', function(done) {
        	node.closing = true;
            done();
        });	
    }
	RED.nodes.registerType("camerapi-store",CameraPiStoreNode);
}
