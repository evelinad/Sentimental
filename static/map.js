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

        colorFader = function (elem, startColor, endColor) {
            return function (newValue, oldValue) {
                var sliderValue = (newValue / 100.0); //* 2 - 1;
                var sliderIntensity = Math.abs(sliderValue);
                var r, g, b;
                // if (sliderValue <= 0) {
                //     r = startColor[0];
                //     g = startColor[1];
                //     b = startColor[2];
                // } else {
                //     r = endColor[0];
                //     g = endColor[1];
                //     b = endColor[2];
                // }
                // r = Math.floor(sliderIntensity * r + (1 - sliderIntensity) * 255);
                // g = Math.floor(sliderIntensity * g + (1 - sliderIntensity) * 255);
                // b = Math.floor(sliderIntensity * b + (1 - sliderIntensity) * 255);
                r = Math.floor(sliderIntensity * endColor[0] +
                               (1 - sliderIntensity) * startColor[0]);
                g = Math.floor(sliderIntensity * endColor[1] +
                               (1 - sliderIntensity) * startColor[1]);
                b = Math.floor(sliderIntensity * endColor[2] +
                               (1 - sliderIntensity) * startColor[2]);
                elem.css("background-color", "rgb(" + r + "," + g + "," + b + ")");
            };
        };


        $scope.pleasantness = 0;
        $scope.attention = 0;
        $scope.sensitivity = 0;
        $scope.aptitude = 0;
        $scope.$watch('pleasantness', colorFader($('#pleasantness'), [20, 20, 20], [143, 236, 106]));
        $scope.$watch('attention', colorFader($('#attention'), [253, 255, 115], [255, 92, 0]));
        $scope.$watch('sensitivity', colorFader($('#sensitivity'), [103, 73, 215], [20, 53, 173]));
        $scope.$watch('aptitude', colorFader($('#aptitude'), [255, 255, 255], [255, 142, 00]));

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
	};
});