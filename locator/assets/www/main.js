var getLocation = function() {
	// this function is run if the getCurrentPosition is successful:
    var success = function(here) {
    	document.getElementById("location").innerHTML = "Latitude: " +
    		here.coords.latitude + "<br>Longitude: " + here.coords.longitude;
    };
    // this function is run if getCurrentPosition fails:
    var failure = function() {
    	document.getElementById("location").innerHTML = "Couldn't determine your location";
    };
    // attempt to get the current position:
    navigator.geolocation.getCurrentPosition(success, failure);
};
