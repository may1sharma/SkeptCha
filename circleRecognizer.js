var circleRecognizer = {
    
/** 
 * Geometric circle Recognizer for validation of circular sketches.
 * @param {Object} sketch object.
 */ 
    
validateCircle: function(sketch, SamplingDist){
    
    // set proximity threshold value
	proximityThreshold = 5*SamplingDist;
    
    var corners = iStraw.run(sketch);
	console.log("Circle Validation: Corners")
	console.log(corners);
    
    if (corners.length > 2){
        return false
    }
    
/** 
 * Circle conditions from PaleoSketch paper:
 * 1- The stroke must have passed the closed shape test from pre-recognition.
 * 2- The stroke’s NDDE value must be high. This value tends to be less relevant for small ellipses, so this condition is ignored if the major axis does not meet certain length requirements.
 * 3- To verify that a stroke is better fit with a circle rather than an ellipse, we find the major axis to minor axis length ratio, which after subtracted from 1.0, must me less than some value
 * 4- Feature area error verification
 */     
    var satisfyConditions = this.condition1(sketch,corners) && this.condition2(sketch,corners) && this.condition3(sketch,corners) && this.condition4(sketch,corners)
    
    if (satisfyConditions){
        return true
    }
    else{
        return false
    }
} 
    
condition1: function(sketch,corners)    
    
}