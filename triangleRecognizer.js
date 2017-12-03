var TriangleRecognizer = {

/** 
 * Geometric Triangle Recognizer for validation of Triangular sketches.
 * @param {Object} sketch object.
 */ 
validate: function(sketch) {
	var corners = ShortStraw.run(sketch);
	console.log(corners);
}

}