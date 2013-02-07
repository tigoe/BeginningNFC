var getLocation = function() {
	// this function is run if the getCurrentPosition is successful:
    var success = function(here) {
    	app.update("location", here.coords);
    };
    // this function is run if getCurrentPosition fails:
    var failure = function() {
        app.update("location", null)
    };
    // attempt to get the current position:
    navigator.geolocation.getCurrentPosition(success, failure);
};
