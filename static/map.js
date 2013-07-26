// JS specifically for the query page.

sentimentalApp.controller('MapUIController', function MapUIController($scope, $location) {
	// Controller that manages linking the map and URL arguments to the
	// current query. It has no querying logic itself. That is left up to
	// QueryController which is also
	// instantiated in query.html.

	// (disabled) On first load, read in URL arguments and load those into the query.
	// angular.extend($scope.watched, $location.search());

	$scope.map = init_gmap(document.getElementById("map-canvas"));
        $scope.data = [];
        $scope.distances = [];

        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: 'test_data/test_data.json',
            success: function (data) {
                $scope.$apply(function() {
                    $scope.data = data;
                });
            }});

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
                recalcData();
            };
        };

        recalcData = function () {
            var distances = [];

            var pleasantness = ($scope.pleasantness / 100.0) * 2 - 1;
            var aptitude = ($scope.aptitude / 100.0) * 2 - 1;
            var attention = ($scope.attention / 100.0) * 2 - 1;
            var sensitivity = ($scope.sensitivity / 100.0) * 2 - 1;

            for (var i = 0; i < $scope.data.length; i++) {
                var review_emotion = $scope.data[i];
                var distance = $scope.compute_distance(review_emotion,
                                                       {pleasantness: pleasantness,
                                                        aptitude: aptitude,
                                                        attention: attention,
                                                        sensitivity: sensitivity});
                distances.push({location: new google.maps.LatLng(review_emotion['lat'], review_emotion['lng']),
                                weight: Math.floor((Math.exp(1.1 * 1.0 / distance)))});
            }

            $scope.distances = distances;
        };

        redrawMap = function () {
            console.log($scope.distances);
            $scope.map.heatmap.setData($scope.distances);
            // $scope.map.heatmapData.clear();
            // for (var i = 0; i < $scope.distances.length; i++)
            //     $scope.map.heatmapData.push($scope.distances[i]);
        };

        $scope.pleasantness = 50;
        $scope.attention = 50;
        $scope.sensitivity = 50;
        $scope.aptitude = 50;
        $scope.$watch('pleasantness', colorFader($('#pleasantness'), [143, 236, 106], [50, 150, 50]));
        $scope.$watch('attention', colorFader($('#attention'), [253, 255, 115], [255, 92, 0]));
        $scope.$watch('sensitivity', colorFader($('#sensitivity'), [153, 120, 215], [20, 53, 173]));
        $scope.$watch('aptitude', colorFader($('#aptitude'), [100, 125, 125], [25, 15, 100]));

        $scope.$watch('data', recalcData);
        $scope.$watch('distances', redrawMap);

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

	    $scope.distance = 0; //$scope.compute_distance({'pleasantness': 50, 'attention': 50, 'sensitivity': 50, 'aptitude': 50});
	};

        $scope.compute_distance = function(input1, input2) {
		return Math.sqrt(
			Math.pow(input1.pleasantness - input2.pleasantness, 2) +
			Math.pow(input1.attention - input2.attention, 2) +
			Math.pow(input1.sensitivity - input2.sensitivity, 2) +
			Math.pow(input1.aptitude - input2.aptitude, 2)
		);
	};
});
