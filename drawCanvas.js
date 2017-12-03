// #######################
// ##### INITIALIZER #####
// #######################

/** 
 * Sets up the canvas and adds the canvas event handlers after the web page has loaded.
 */
function initDrawing() {
    // get the draw canvas element from the HTML document
    drawCanvas = document.getElementById('drawCanvas');

    // the browser supports the canvas tag => get the 2d drawing context for this canvas
    if (drawCanvas.getContext)
        drawContext = drawCanvas.getContext('2d');

    // get the draw canvas dimensions
    width = this.drawCanvas.width;
		height = this.drawCanvas.height;

    // auto-fill the dimensions input from the canvas' current dimensions
//    document.getElementById("widthInput").value = width;
//    document.getElementById("heightInput").value = height;

    // add the initial status message
//    document.getElementById("statusMessage").innerHTML = defaultStatusMessage;

    // valid context to draw on/with => add the respective event handlers
    if (drawContext) {
        // react to mouse events on the canvas, and mouseup on the entire document
        drawCanvas.addEventListener('mousedown', drawCanvas_mouseDown, false);
        drawCanvas.addEventListener('mousemove', drawCanvas_mouseMove, false);
        window.addEventListener('mouseup', drawCanvas_mouseUp, false);

        // react to touch events on the canvas
        drawCanvas.addEventListener('touchstart', drawCanvas_touchStart, false);
        drawCanvas.addEventListener('touchend', drawCanvas_touchEnd, false);
        drawCanvas.addEventListener('touchmove', drawCanvas_touchMove, false);
    }
}



// ###############################
// ##### BUTTON INTERACTIONS #####
// ###############################

/**
 * Clears the draw canvas and drawing data.
 * @param {Object} canavs - The draw canvas.
 * @param {Object} context - The draw context. 
 */
function clearButton(canvas, context) {
  // clear the canvas
  clearCanvas(canvas, context);

  // reset the draw canvas' points and strokes
  DrawCanvasData.points = [];
  DrawCanvasData.strokes = [];
}

/**
 * Undoes the most recent stroke on the draw canvas, if any.
 * @param {Object} canvas - The draw canvas.
 * @param {Object} context - The draw context.
 */
function undoButton(canvas, context) {
  // no recorded strokes => do nothing
  if (DrawCanvasData.strokes.length === 0) { return; }

  // remove the last stroke and clear the canvas
  DrawCanvasData.strokes.pop();
  
  // re-draw the remaining strokes
  redraw(canvas, context, DrawCanvasData.strokes, strokeColor, strokeSize);
}

/**
 * Resizes the canvas with user-defined values.
 * @param {Object} canvas - The draw canvas.
 * @param {Object} context - The draw context.
 */
function resizeButton(canvas, context) {
  // obtain the dimensionsfrom the respective text boxes
  var widthInput = document.getElementById("widthInput").value;
  var heightInput = document.getElementById("heightInput").value;

  // parse the dimensions into numerical values
  var width = Number.parseInt(widthInput);
  var height = Number.parseInt(heightInput);

  // validate the entered dimension values 
  if (Number.isNaN(width) || typeof width !== 'number' || width === 0) {
    alert("ERROR: Missing valid width size.");
    return;
  }
  if (Number.isNaN(height) || typeof height !== 'number' || height === 0) {
    alert("ERROR: Missing valid height size.");
    return;
  }

  // update the draw canvas' dimensions
  canvas.width = width;
  canvas.height = height;

  // redraw the strokes that were removed during canvas resizing
  redraw(canvas, context, DrawCanvasData.strokes, strokeColor, strokeSize);
}

/**
 * Saves the current sketch to the current collection of sketches.  
 * @param {Object} canvas - The draw canvas.
 */
function saveButton(canvas) {

  // get the sketch's strokes
  var sketch = {};
  var strokes = DrawCanvasData.strokes;
  
  // get the sketch's interpretation 
  var interpretation = document.getElementById("interpretationInput").value;
  if (interpretation === "") {
    interpretation = "none";
  }

  // get the sketch's domain(s) 
  var domainString = document.getElementById("domainInput").value;
  if (domainString === "") {
    domainString = "Sketch";
  }

  // parse the domains into an array
  var domainString = domainString.replace(/ /g, ''); // removes whitespace
  var domain = domainString.split(",");

  // get the sketch's dimensions
  var width = document.getElementById("widthInput").value;
  var height = document.getElementById("heightInput").value;
  width = Number.parseInt(canvas.width);
  height = Number.parseInt(canvas.height);
  
  // collect the current sketch
  collectSketch(strokes, width, height, interpretation, domain);

  // clear the canvas and current sketch data
  clearCanvas(drawCanvas, drawContext);
  DrawCanvasData.points = [];
  DrawCanvasData.strokes = [];

  // update the status message
  document.getElementById("statusMessage").innerHTML = sketchCountMessage + DrawCanvasData.sketches.length;
}

/**
 * Downloads the sketch data collection.
 */
function downloadButton() {
  //
  var saveLink = document.getElementById('saveLink');
  saveLink.innerHTML = "";

  // get the sketches
  var sketches = DrawCanvasData.sketches;

  if (DrawCanvasData.strokes.length > 0) {
    alert("ERROR: You have not recorded the current sketch.");
    return;
  }
  if (sketches.length === 0) {
    alert("ERROR: No sketches saved.");
    return;
  }

  // set up the save data (data-uri version)
  // var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sketches));
  // var a = document.createElement('a');
  // a.href = 'data:' + data;
  // a.download = 'data.json';
  // a.innerHTML = 'Download JSON Data';

  // set up the save data (blob version)
  var data = JSON.stringify(sketches); // compact output
  // var data = JSON.stringify(sketches, null, "\t"); // tabbed output
  var blob = new Blob([data], {type: "application/json"});
  var url  = URL.createObjectURL(blob);  
  var a = document.createElement('a');
  a.href = url;
  a.download = "data.json";
  a.innerHTML = "Download JSON Data";

  // save the data
  var saveLink = document.getElementById('saveLink');
  saveLink.appendChild(a);

  // reset the data
  DrawCanvasData.points = [];
  DrawCanvasData.strokes = [];
  DrawCanvasData.sketches = [];

  // reset the status message
  document.getElementById("statusMessage").innerHTML = defaultStatusMessage;
}



// ########################
// ##### GUI UPDATERS #####
// ########################

/**
 * Update the draw canvas with the latest point and line segment.
 * @param {Object} context - The draw context.
 * @param {Number} x - The x-coordinate.
 * @param {Number} y - The y-coordinate.
 */
function updateCanvas(context, x, y) {

  // lastX is not set => set lastX and lastY to the current position
  if (lastX === -1) {
    lastX = x;
    lastY = y;
  }

  // draw latest line segment
  drawLineSegment(context, lastX, lastY, x, y, strokeColor, strokeSize);

  // Update the last position to reference the current position
  lastX = x;
  lastY = y;
}

/**
 * Clear the canvas, and also the save link (if any).
 * @param {Object} canvas - The draw canvas.
 * @param {Object} context - The draw context. 
 */
function clearCanvas(canvas, context) {
  // clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // clear the save link, if any
  document.getElementById("saveLink").innerHTML = "";
}

/**
 * Draw a line segment between two points onto the draw canvas.
 * @param {Object} context - The draw context.
 * @param {Number} x0 - The first x-coordinate.
 * @param {Number} y0 - The first y-coordinate.
 * @param {Number} x1 - The second x-coordinate.
 * @param {Number} y1 - The second y-coordinate.
 * @param {String} color - The stroke color.
 * @param {Number} size - The stroke size.
 */
function drawLineSegment(context, x0, y0, x1, y1, color, size) {

  // set the stroke color
  context.strokeStyle = color;
  //ctx.strokeStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";

  // set the line "cap" style to round, so lines at different angles can join into each other
  //context.lineCap = "round"; (default is "butt")

  // begin the stroke path
  context.beginPath();

  // user drew dot => increment the position by one to make drawn dot visible
  if (x0 === x1 && y0 === y1) {
    x1++;
    y1++;
  }

  // move to the previous point position
  context.moveTo(x0, y0);

  // draw a line to the current point position
  context.lineTo(x1, y1);

  // set the line thickness and draw the line
  context.lineWidth = size;
  context.stroke();

  // end the stroke path
  context.closePath();
}

/**
 * Redraws the strokes back onto the draw canvas.
 * @param {Object} canvas - The draw canvas.
 * @param {Object} context - The draw context.
 * @param {Object[]} strokes - The array of sketch strokes.
 * @param {String} strokeColor - The stroke color.
 * @param {Number} strokeSize - The stroke size.
 */
function redraw(canvas, context, strokes, strokeColor, strokeSize) {
  // clear the canvas before re-drawing strokes
  clearCanvas(canvas, context);

  // redraw each stroke
  for (var i = 0; i < strokes.length; i++) {
    var points = strokes[i].points;

    // re-draw the line segments of the current stroke
    for (var j = 0; j < points.length - 1; j++) {
      var point0 = points[j];
      var point1 = points[j + 1];
      drawLineSegment(context, point0.x, point0.y, point1.x, point1.y, strokeColor, strokeSize);
    }
  }
}



// ################################
// ##### MOUSE EVENT HANDLERS #####
// ################################

/**
 * Keeps track of the mouse button being pressed, and draws a dot.
 */
function drawCanvas_mouseDown() {
  mouseDown = true;
  updateCanvas(drawContext, mouseX, mouseY);
  collectPoint(mouseX, mouseY);
}

/**
 * Keeps track of the mouse position, and draws a dot if the mouse button is currently ressed.
 * @param {Object} e - The mouse event.
 */
function drawCanvas_mouseMove(e) {
  // Update the mouse co-ordinates when moved
  getMousePos(e);

  // Draw a dot if the mouse button is currently being pressed
  if (mouseDown) {
      updateCanvas(drawContext, mouseX, mouseY);
      collectPoint(mouseX, mouseY);
  }
}

/**
 * Keep track of the mouse button being released.
 */
function drawCanvas_mouseUp() {

  // collect the stroke only if the mouse was already down, and disable the mouse tracking
  if (mouseDown) { collectStroke(); }
  mouseDown = false;

  // reset lastX and lastY to -1 to indicate that they are now invalid since mouse is up
  lastX = -1;
  lastY = -1;
}

/**
 * Set the current mouse position from the current mouse event.
 * @param {Object} e - The mouse event.
 */
function getMousePos(e) {
    if (!e)
        var e = event;

    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
 }



// ################################
// ##### TOUCH EVENT HANDLERS #####
// ################################

/**
 * Draw when touch start is detected.
 */
function drawCanvas_touchStart() {
    // update the touch coordinates
    getTouchPos();

    updateCanvas(drawContext, touchX, touchY);
    collectPoint(touchX, touchY);

    // prevent an additional mousedown event being triggered
    event.preventDefault();
}

/**
 * Draw when touch movement is detected, and prevent default scrolling.
 * @param {Object} e - The touch event.
 */
function drawCanvas_touchMove(e) {
    // update the touch co-ordinates
    getTouchPos(e);

    // during a touchmove event, unlike a mousemove event, there is no need to check if the touch is engaged,
    // since there will always be contact with the screen by definition.
    updateCanvas(drawContext, touchX, touchY);
    collectPoint(touchX, touchY);

    // prevent a scrolling action as a result of this touchmove triggering.
    event.preventDefault();
}

/**
 * Finish drawing when touch is completed.
 */
function drawCanvas_touchEnd() {
    // reset lastX and lastY to -1 to indicate that they are now invalid, since touch is completed
    lastX = -1;
    lastY = -1;

    collectStroke();
}

/**
 * Get the touch position relative to the top-left of the draw canvas.
 * Note: When getting the raw values of pageX and pageY below, it takes into account the scrolling on the page
 * but not the position relative to our target div. Therefore, adjust them using "target.offsetLeft" and
 * target.offsetTop" to get the correct values in relation to the top left of the canvas.
 * @param {Object} e - The touch event.
 */
function getTouchPos(e) {
  if (!e) {var e = event; }

  if(e.touches) {
    if (e.touches.length === 1) { // Only deal with one finger
      var touch = e.touches[0]; // Get the information for finger #1
      touchX = touch.pageX - touch.target.offsetLeft;
      touchY = touch.pageY - touch.target.offsetTop;
    }
  }
}



// ########################
// ##### DATA STORAGE #####
// ########################

/**
 * Collects the current point to add to the list.
 * @param {Number} x - The current point's x-coordinate.
 * @param {Number} y - The current point's y-coordinate.
 */
function collectPoint(x, y) {
  // create the current point and add to the point collection
  var time = Date.now();                  // create the time
  var id = generateUuidv4();
  var point = {x: x, y: y, time: time, id: id};   // create the point
  DrawCanvasData.points.push(point);      // add to point collection
}

/**
 * Collects the current stroke to the list.
 */
function collectStroke() {

  //
  if (DrawCanvasData.points.length === 0) {
    console.log("--- collecting zero-point stroke ---");
    // return;
  }

  var id = generateUuidv4();
  var time = DrawCanvasData.points[0].time;
  var stroke = {id: id, time: time, points: DrawCanvasData.points, };
  DrawCanvasData.strokes.push(stroke);
  DrawCanvasData.points = [];
}

/**
 * Collects the current sketch to add to the list.
 */
function collectSketch(strokes, width, height, interpretation, domain) {
  var id = generateUuidv4();

  // get the sketch's first time
  var firstTime = strokes[0].points[0].time;

  // create the sketch's shapes object
  var shape = {};
  shape.subElements = [];
  for (var i = 0; i < strokes.length; i++) {
    var stroke = strokes[i];
    shape.subElements.push(stroke.id);
  }
  shape.time = firstTime;
  shape.interpretation = interpretation;
  shape.confidence = "1.0";

  // id, time, domain, strokes, shapes
  var sketch = {};
  sketch.id = id;
  sketch.time = firstTime;
  sketch.domain = domain;
  sketch.canvasWidth = width;
  sketch.canvasHeight = height;
  sketch.strokes = strokes;
  sketch.shapes = [shape];

  //
  if (sketch.shapes === 0) {
    console.log("--- collecting zero-shape sketch ---");
    // return;
  }

  DrawCanvasData.sketches.push(sketch);
}

/**
 * Generates a new UUID (v4) value.
 * @return {Number} A new UUID (v4) value.
 */
function generateUuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Does nothing.
 * @param {Object} sketch - The input sketch.
 */
function doNothing(sketch) {
  for (var i = 0; i < sketch.strokes.length; i++) {
    var points = strokes[i].points;
    for (var j = 0; j < points.length; j++) {
      var point = points[j];
      // do stuff
    }
  }
}


// ##################
// ##### FIELDS #####
// ##################

// The draw canvas and context variables.
var drawCanvas;
var drawnContext;

// The mouse interaction variables.
var mouseX = 0;
var mouseY = 0;
var mouseDown;

// The touch interaction variables.
var touchX;
var touchY;

// Keep track of the old/last position when drawing a line
// We set it to -1 at the start to indicate that we don't have a good value for it yet
var lastX = -1;
var lastY = -1;

// The stroke size and color.
var strokeSize = 3;
var strokeColor = "black";

// Status messages
var defaultStatusMessage = "Please sketch your data now.";
var sketchCountMessage = "# of sketches saved: ";

// The data structure variables for storing the data collection session.
var DrawCanvasData = {
  points: [],
  strokes: [],
  sketches: [],
};