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
 *	- Olaf Hahn
 **/


module.exports = function(RED) {
	"use strict";

	var settings = RED.settings;
	var events = require("events");
	var exec = require("child_process").exec;
	var isUtf8 = require("is-utf8");
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
		this.rotation = config.rotation;
		this.fliph = config.fliph;
		this.flipv = config.flipv;
		this.sharpness = config.sharpness;
		this.brightness = config.brightness;
		this.contrast = config.contrast;
		this.imageeffect = config.imageeffect;
		this.exposuremode = config.exposuremode;
		this.iso = config.iso;
		this.agcwait = config.agcwait;
		this.quality = config.quality;
		this.led = config.led;
		this.awb = config.awb;
		this.name =  config.name;
		this.activeProcesses = {};

		var node = this;

		// if there is an new input
		node.on("input", function(msg) {

			var fsextra = require("fs-extra");
			var fs = require("fs");
			var uuidv4 = require("uuid/v4");
			var uuid = uuidv4();
			var os = require("os");
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
			var imageeffect;
			var agcwait;
			var quality;
			var led;
			var awb;
			var rotation;
			var exposuremode;
			var iso;

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
				// Buffered mode (old Buffermode)
				filename = "pic_" + uuid + ".jpg";
				fileformat = "jpeg";
				filepath = homedir + "/";
				filefqn = filepath + filename;
				if (RED.settings.verbose) { node.log("camerapi takephoto:" + filefqn); }
				console.log("CameraPi (log): Tempfile - " + filefqn);

				cl += " " + filename + " " + filepath + " " + fileformat;
			} else if (filemode == "2") {
				// Auto file name mode (old Generate)
				filename = "pic_" + uuid + ".jpg";
				fileformat = "jpeg";
				filepath = defdir;
				filefqn = filepath + filename;
				if (RED.settings.verbose) { node.log("camerapi takephoto:" + filefqn); }
				console.log("CameraPi (log): Generate - " + filefqn);

				cl += " " + filename + " " + filepath + " " + fileformat;
			} else {
				 // Specific FileName
				 if ((msg.filename) && (msg.filename.trim() !== "")) {
						filename = msg.filename;
				} else {
					if (node.filename) {
						filename = node.filename;
					} else {
						filename = "pic_" + uuid + ".jpg";
					}
				}
				cl += " " + filename;

				if (node.filedefpath == "1" ) {
					filepath = defdir;
				} else {
					if ((msg.filepath) && (msg.filepath.trim() !== "")) {
						filepath = msg.filepath;
					} else {
						if (node.filepath) {
							filepath = node.filepath;
						} else {
							filepath = defdir;
						}
					}
				}
				cl += " " + filepath;

				if ((msg.fileformat) && (msg.fileformat.trim() !== "")) {
					fileformat = msg.fileformat;
				} else {
					if (node.fileformat) {
						fileformat = node.fileformat;
					} else {
						fileformat = "jpeg";
					}
				}
				cl += " " + fileformat;
				if (RED.settings.verbose) { node.log("camerapi takephoto:" + filefqn); }
			}

			// Resolution of the image
			if ((msg.resolution) && (msg.resolution !== "")) {
				resolution = msg.resolution;
			} else {
				if (node.resolution) {
					resolution = node.resolution;
				} else {
					resolution = "10";	
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
			} else if (resolution == "5") {
				cl += " 1280 720";
			} else if (resolution == "6") {
				cl += " 1640 922";
			} else if (resolution == "7") {
				cl += " 1640 1232";
			} else if (resolution == "8" ) {
				cl += " 1920 1080";
			} else if (resolution == "9") {
				cl += " 2592 1944";
			} else {
				cl += " 3280 2464";
			}

			// rotation
			if ((msg.rotation) && (msg.rotation !== "")) {
				rotation = msg.rotation;
				} else {
					if (node.rotation) {
						rotation = node.rotation;
					} else {
						rotation = "0";	
					}
				}
			cl += " " + rotation;

			// hflip and vflip
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
					brightness = "50";	
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

			// imageeffect
			if ((msg.imageeffect) && (msg.imageeffect !== "")) {
				imageeffect = msg.imageeffect;
			} else {
				if (node.imageeffect) {
					imageeffect = node.imageeffect;
				} else {
					imageeffect = "none";	
				}
			}
			cl += " " + imageeffect;

			// exposure-mode
			if ((msg.exposuremode) && (msg.exposuremode !== "")) {
				exposuremode = msg.exposuremode;
				} else {
					if (node.exposuremode) {
						exposuremode = node.exposuremode;
					} else {
						exposuremode = "auto";					
					}
				}
			cl += " " + exposuremode;

			// iso
			if ((msg.iso) && (msg.iso !== "")) {
				iso = msg.iso;
			} else {
				if (node.iso) {
					iso = node.iso;
				} else {
					iso = "0";					
				}
			}
			cl += " " + iso;

			// agcwait
			if ((msg.agcwait) && (msg.agcwait !== "")) {
				agcwait = msg.agcwait;
			} else {
				if (node.agcwait) {
					agcwait = node.agcwait;
				} else {
					agcwait = 1.0;					
				}
			}
			cl += " " + agcwait;
			
			// jpeg quality
			if ((msg.quality) && (msg.quality !== "")) {
				quality = msg.quality;
			} else {
				if (node.quality) {
					quality = node.quality;
				} else {
					quality = 80;					
				}
			}
			cl += " " + quality;
			
			// led on/off
			if ((msg.led) && (msg.led !== "")) {
				led = msg.led;
			} else {
				if (node.led) {
					led = node.led;
				} else {
					led = 0;					
				}
			}
			cl += " " + led;

			// awb
			if ((msg.awb) && (msg.awb != "")) {
				awb = msg.awb;
			} else {
				if (node.awb) {
					awb = node.awb;
				} else {
					awb = "auto";
				}
			}
			cl += " " + awb;

			if (RED.settings.verbose) { node.log(cl); }

			filefqn = filepath + filename;

			var child = exec(cl, {encoding: "binary", maxBuffer:10000000}, function (error, stdout, stderr) {
				var retval = new Buffer(stdout,"binary");
				try {
					if (isUtf8(retval)) { retval = retval.toString(); }
				} catch(e) {
					node.log(RED._("exec.badstdout"));
				}

				// check error
				var msg2 = {payload:stderr};
				var msg3 = null;
				//console.log("[exec] stdout: " + stdout);
				//console.log("[exec] stderr: " + stderr);
				if (error !== null) {
					msg3 = {payload:error};
					console.error("CameraPi (err): " + error);
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
						  if (err) return console.error("CameraPi (err): " + err);
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

			child.on("error",function(){});

			node.activeProcesses[child.pid] = child;

		});

		// CameraPi-TakePhoto has a close
		// New function signature function(removed, done) included in Node-Red 0.17
		node.on("close", function(removed, done) {
			if (removed) {
				// This node has been deleted
				node.closing = true;
			}
			else {
				// This node is being restarted
			}
			done();
		});
	}
	RED.nodes.registerType("camerapi-takephoto",CameraPiTakePhotoNode);
}
