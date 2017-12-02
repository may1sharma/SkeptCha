// ####################
// ### INITIALIZERS ###
// ####################

/**
 * Initializes the body at start.
 */
function initViewer() {

	// initialize the sketch collection and current index
//	sketch = [];
//	currentIndex = 0;
//	hasReadBefore = false;

	// load files at file input
//	input = document.querySelector('input'); // access the <input> tag
//	input.addEventListener('change', loadFiles);

	// get the canvas and its context
	viewCanvas = document.getElementById('viewCanvas');
	if (viewCanvas.getContext) {
		viewContext = viewCanvas.getContext('2d');
	}

//	// initially disable all other buttons (until data is finally loaded later)
//	disableInputTagStates(true);
    var localSketch = readJson('sampleSketch.json')
    console.log(localSketch)
    displaySketch(localSketch[0],strokeColor)
}

function readJson(fileName) {
       var contents;
       var xhttp = new XMLHttpRequest();
       xhttp.onreadystatechange = function() {
          if (this.readyState === 4 && this.status === 200) {
             contents = JSON.parse(this.response);
        }
       };
       xhttp.open("GET", fileName, false);
       xhttp.send();
       return contents;
    }    

///**
// * Loads the file or files from the file open dialog window.
// * @param {Object} event The loading files event.
// */
//function loadFiles(event) {
//				var localSketches = JSON.parse(text);
//	
//				// add the sketch to the general collection of contents 
//				for (var j = 0; j < localSketches.length; j++) {
//					var localSketch = localSketches[j];
//					sketches.push(localSketch);
//				}
//	
//				// check if file-reading has been done before after lodaing the files
//				if (!hasReadBefore) {
//					// 1. get the first sketch
//					// 2. display the first sketch
//					// 3. indicate that file reading has been done
//					var first = localSketches[0];
//					displaySketch(first, strokeColor);
//
//					// enable the read-before flag
//					hasReadBefore = true;
//				}
//
//				//
//				numReads++;
//	
//				if (numReads === numFiles) {
//					// enable all the buttons
//					if (sketches.length > 1) {
//						disableInputTagStates(false);
//						document.getElementById("backButton").disabled = true;;
//					}
//					else {
//						disableInputTagStates(true);
//					}
//
//					//
//					currentIndex = 0;
//					updateIndexDisplay(currentIndex, sketches.length - 1);
//	
//					//
//					document.getElementById("sketchDataUploadsButton").value = "";
//				}
//	
//			};
//		})(file);
//	
//		// read the current file
//		reader.readAsText(file);
//	}
//
//}
//


// ##########################
// ### CONTENT DISPLAYERS ###
// ##########################

/**
 * Displays the sketch to the canvas.
 * @param {Object} sketch - The input sketch.
 * @param {String} color - The sketch's stroke colors.
 */
function displaySketch(sketch, color) {
    console.log(sketch.strokes)
	//
	var originalColor = this.strokeColor;					// save original color
	strokeColor = color;								// change color
	viewContext.fillStyle = color;

	//
	viewCanvas.width = sketch.canvasWidth;
	viewCanvas.height = sketch.canvasHeight;

	// iterate through each stroke
	var strokes = sketch.strokes;
	for (var i = 0; i < strokes.length; i++) {
		var points = strokes[i].points;

		// iterate through each point in the stroke
		for (var j = 0; j < points.length - 1; j++) {

			var currPoint = points[j];
			var nextPoint = points[j + 1];
			drawLineSegment(viewContext, currPoint.x, currPoint.y, nextPoint.x, nextPoint.y, strokeColor, strokeSize);
		}
	}
	strokeColor = originalColor;						// revert color
	viewContext.fillStyle = strokeColor;
}

/**
 * Draw a line segment between two points on the display canvas.
 * @param {Object} context - The display context.
 * @param {Number} x0 - The first x-coordinate.
 * @param {Number} y0 - The first y-coordinate.
 * @param {Number} x1 - The second x-coordinate.
 * @param {Number} y1 - The second y-coordinate,
 * @param {String} color - The stroke color.
 * @param {Number} size - The stroke size.
 */
function drawLineSegment(context, x0, y0, x1, y1, color, size) {
	
	// select a fill style
	context.strokeStyle = color;

	// draw a filled line
	context.beginPath();

	// move to the old previous position
	context.moveTo(x0, y0);

	// draw a line to the current touch/pointer position
	context.lineTo(x1, y1);

	// set the line thickness and draw the line
	context.lineWidth = size;
	context.stroke();

	context.closePath();
}

/**
 * Displays the current sketch index and the total number ofsketches.
 * @param {Number} index - The current sketch index. 
 * @param {Number} total - The total number of sketches.
 */
function updateIndexDisplay(index, total) {
	document.getElementById("indexDisplay").innerHTML = "" + index + " / " + total;
}



// ######################
// ### HELPER METHODS ###
// ######################

/**
 * Displays the previous sketch.
 * @param {Object} canvas - The display canvas.
 * @param {Object} context - The display context. 
 */
function backButton(canvas, context) {
	// update the current index
	--currentIndex;
	updateIndexDisplay(currentIndex, sketches.length - 1);

	// disable the previous button if at the first sketch
	document.getElementById("nextButton").disabled = false;
	if (currentIndex === 0) {
		document.getElementById("backButton").disabled = true;
	}
	
	// clear the previous sketch and display the current sketch
	clearCanvas(canvas, context);
	displaySketch(sketches[currentIndex], strokeColor);
}

/**
 * Displays the next sketch.
 * @param {Object} canvas - The display canvas.
 * @param {Object} context - The display context. 
 */
function nextButton(canvas, context) {
	// update the current index
	++currentIndex;
	updateIndexDisplay(currentIndex, sketches.length - 1);

	// disable the next button if at the last sketch
	document.getElementById("backButton").disabled = false;
	if (currentIndex === sketches.length - 1) {
		document.getElementById("nextButton").disabled = true;
	}

	// clear the previous sketch and display the current sketch 
	clearCanvas(canvas, context);
	displaySketch(sketches[currentIndex], strokeColor);
}

/**
 * Displays the inputted index's sketch. 
 * @param {Object} canvas - The display canvas.
 * @param {Object} context - The display context.
 */
function jumpButton(canvas, context) {
	// get the input target index from the corresponding text box
	var targetIndex = document.getElementById("targetIndex").value;

	// check for range
  if (targetIndex < 0 || targetIndex > sketches.length) {
    alert("ALERT: You have entered an index value that is out of range.");
    return;
  }

	// check for valid parsing
  targetIndex = Number.parseInt(targetIndex);
  if (Number.isNaN(targetIndex) || typeof targetIndex !== 'number') {
    alert("ALERT: You have entered a non-numerical index value.");
  }

	// 1. clear the canvas
	// 2. set the inputted index as the current index
	// 3. display the new current sketch to the canvas
	// 4. update the displayed current index
  clearCanvas(canvas, context);
  currentIndex = targetIndex;
  displaySketch(sketches[currentIndex], "black");
  updateIndexDisplay(currentIndex, sketches.length - 1);
}



// ######################
// ### HELPER METHODS ###
// ######################

/**
 * Determines whether the input file is of type JSON.
 * @param {Object} file - The input file.
 * @return {Boolean} Whether the input file is of type JSON. 
 */
function validFileType(file) {

	// get the file extension
	var fileName = file.name;
	if (fileName.length <= 5) { return false; }
	var fileType = fileName.slice((fileName.length - 5) + 1, fileName.length);

	// compare the extension to the JSON extension
	if (fileType.toLowerCase() === "json") {
		return true;
	}

	return false;
}

/**
 * Handles the disable states of the interface buttons.
 * @param {Boolean} disable - Indicates whether to disable the interface buttons or not.
 */
function disableInputTagStates(disable) {
	// retrieve all buttons with the "buttonlook" class
	var buttonElements = document.querySelectorAll(".buttonlook");
	
	// individually set the disable state of each button
	for (var i = 0; i < buttonElements.length; i++) {
		buttonElements[i].disabled = disable;
	}
}

/**
 * Clears the canvas of strokes.
 * @param {Object} canvas  - The display canvas.
 * @param {Object} context - The display context. 
 */
function clearCanvas(canvas, context) {
  // clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
}



// ##########
// # FIELDS #
// ##########

//  Accesses the canvas and its information.
var viewCanvas;
var viewContext;

// Keeps track of the sketches and index of the currently-viewed sketch. 
var sketches;
var currentIndex;

// Stores the stroke visual details.
var strokeSize = 3;
var strokeColor = "black";

// Flag for whether a file has been read yet after initial loading.
// If true, then the currently-read file is the first file being read.
// So get the first file's first sketch to load into display canvas. 
var hasReadBefore;

// Keeps track of the number of file reads after loading and number of files.
// If the number of reads match the number of files, then the reading is done. 
var numReads;
var numFiles;