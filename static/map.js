// JS specifically for the query page.

sentimentalApp.controller('MapUIController', function MapUIController($scope, $location) {
	// Controller that manages linking the map and URL arguments to the
	// current query. It has no querying logic itself. That is left up to
	// QueryController which is also
	// instantiated in query.html.

	// (disabled) On first load, read in URL arguments and load those into the query.
	// angular.extend($scope.watched, $location.search());

	$scope.map = init_gmap(document.getElementById("map-canvas"));
	// Setup map marker bindings.
	$scope.queryMarker = null;
	$scope.resultMarkers = [];
	$scope.$watch('watched', function(newVal, oldVal) {
		// var locationTokens = newVal.latLng.split(",");
		// $scope.replaceMarker(new google.maps.LatLng(locationTokens[0], locationTokens[1]));
	});
	// Setup click behavior.
	google.maps.event.addListener($scope.map.map, 'click', function(event) {
		// Since this callback isn't fired from within angularjs, we have to
		// make changes in $apply so it knows to propigate changes.
		$scope.$apply(function() {
			$scope.watched.latLng = event.latLng.lat() + "," + event.latLng.lng();
			$scope.map.map.panTo(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()));
		});
	});

	$scope.refreshMap = function() {
		var pleasantness = $( "#pleasantness" ).slider( "value" ),
		attention = $( "#attention" ).slider( "value" ),
		sensitivity = $( "#sensitivity" ).slider( "value" ),
		aptitude = $( "#aptitude" ).slider( "value" );

		$scope.pleasantness = pleasantness;
		$scope.attention = attention;
		$scope.sensitivity = sensitivity;
		$scope.aptitude = aptitude;

		$scope.distance = $scope.compute_distance({'pleasantness': 50, 'attention': 50, 'sensitivity': 50, 'aptitude': 50});
	};

	$scope.compute_distance = function(input_dictionary) {
		return Math.sqrt(
			Math.pow(input_dictionary.pleasantness - $scope.pleasantness, 2) +
			Math.pow(input_dictionary.attention - $scope.attention, 2) +
			Math.pow(input_dictionary.sensitivity - $scope.sensitivity, 2) +
			Math.pow(input_dictionary.aptitude - $scope.aptitude, 2)
		)
	};
});