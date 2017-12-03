var TriangleRecognizer = {

/** 
 * Geometric Triangle Recognizer for validation of Triangular sketches.
 * @param {Object} sketch object.
 */ 
validate: function(sketch, SamplingDist) {
	// set proximity threshold value
	proximityThreshold = 5*SamplingDist;

	var corners = ShortStraw.run(sketch);
	console.log("Triangle Validation: Corners")
	console.log(corners);

	// Recognizing basic triangles drawn in 1, 2 or 3 strokes
	switch(sketch.strokes.length) {
		case 1:
			return this.isSingleStrokeTriangle(sketch, corners);
		case 2:
			return this.isTwoStrokeTriangle(sketch, corners);
		case 3:
			return this.isThreeStrokeTriangle(sketch, corners);
		default:
			return false
	}
},


isSingleStrokeTriangle: function(sketch, corners) {
	var result = false;

	// validate the corner count
	if (corners[0].length != 4)	return false;

	// check proximity of starting and end point
	result = this.proximityCheck(sketch.strokes[0].points[corners[0][0]], sketch.strokes[0].points[corners[0][ (corners[0].length -1) ]], proximityThreshold);

	console.log("isSingleStrokeTriangle : " + result);
	return result;
},

isTwoStrokeTriangle: function(sketch, corners) {
	var result = false;

	// validate the corner count
	if (corners[0].length + corners[1].length != 5)	return false;

	// check proximity of starting and end points of the two strokes
	var possibilityA = 	this.proximityCheck(sketch.strokes[0].points[corners[0][0]], 
											sketch.strokes[1].points[corners[1][0]], 
											proximityThreshold) &&
						this.proximityCheck(sketch.strokes[0].points[corners[0][ (corners[0].length -1) ]], 
											sketch.strokes[1].points[corners[1][ (corners[1].length -1) ]], 
											proximityThreshold) ;

	var possibilityB = 	this.proximityCheck(sketch.strokes[0].points[corners[0][0]], 
											sketch.strokes[1].points[corners[1][ (corners[1].length -1) ]], 
											proximityThreshold) &&
						this.proximityCheck(sketch.strokes[0].points[corners[0][ (corners[0].length -1) ]], 
											sketch.strokes[1].points[corners[1][ 0 ]], 
											proximityThreshold) ;

	result = possibilityA || possibilityB;

	console.log("isTwoStrokeTriangle : " + result);
	return result;
},

isThreeStrokeTriangle: function(sketch, corners) {
	var result = false;

	// validate the corner count
	if (corners[0].length + corners[1].length + corners[2].length != 6)	return false;

	var start0 = sketch.strokes[0].points[corners[0][0]];
	var end0 = sketch.strokes[0].points[corners[0][1]];
	var start1 = sketch.strokes[1].points[corners[1][0]];
	var end1 = sketch.strokes[1].points[corners[1][1]];
	var start2 = sketch.strokes[2].points[corners[2][0]];
	var end2 = sketch.strokes[2].points[corners[2][1]];

	// All possible combinations of a 3 stroke triangle
	var possibilityA = this.proximityCheck(end0, start1) && this.proximityCheck(end1, start2) && this.proximityCheck(end2, start0);
	var possibilityB = this.proximityCheck(end0, start1) && this.proximityCheck(end1, end2) && this.proximityCheck(start2, start0);
	var possibilityC = this.proximityCheck(end0, end1) && this.proximityCheck(start1, start2) && this.proximityCheck(end2, start0);
	var possibilityD = this.proximityCheck(end0, end1) && this.proximityCheck(start1, end2) && this.proximityCheck(start2, start0);
	var possibilityE = this.proximityCheck(start0, start1) && this.proximityCheck(end1, start2) && this.proximityCheck(end2, end0);
	var possibilityF = this.proximityCheck(start0, start1) && this.proximityCheck(end1, end2) && this.proximityCheck(start2, end0);
	var possibilityG = this.proximityCheck(start0, end1) && this.proximityCheck(start1, start2) && this.proximityCheck(end2, end0);
	var possibilityH = this.proximityCheck(start0, end1) && this.proximityCheck(start1, end2) && this.proximityCheck(start2, end0);

	// check proximity of starting and end point
	result = possibilityA || possibilityB || possibilityC || possibilityD || possibilityE || possibilityF || possibilityG || possibilityH;

	console.log("isThreeStrokeTriangle : " + result);
	return result;
},

proximityCheck: function(corner1, corner2, threshold) {
	var dist = Math.sqrt(Math.pow((corner1.y - corner2.y),2) + Math.pow((corner1.x - corner2.x),2));
	if (!threshold)	threshold = proximityThreshold;
	return(dist <= threshold) ? true : false;
},

proximityThreshold: 0,

};