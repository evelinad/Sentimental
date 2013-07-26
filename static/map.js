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

    $scope.options = [
        [80, 80, 50, 50, "optimism"],
        [20, 80, 50, 50, "frustration"],
        [20, 20, 50, 50, "disapproval"],
        [80, 20, 50, 50, "frivolity"],
        [50, 50, 80, 80, "rivalry"],
        [50, 50, 20, 80, "submission"],
        [50, 50, 20, 20, "coercion"],
        [50 ,50, 80, 20, "contempt"],
        [50, 80, 80, 50, "aggressiveness"],
        [50, 20, 80, 50, "rejection"],
        [50, 20, 20, 50, "awe"],
        [50, 80, 20, 50, "anxiety"],
        [80, 50, 50, 80, "love"],
        [80, 50, 50, 20, "gloat"],
        [20, 50, 50, 20, "remorse"],
        [20, 50, 50, 80, "envy"]
    ];

    $scope.go = function (e1, e2, e3, e4, description){
        alert('test');
        $( "#pleasantness" ).slider( "value", e1 );
        $( "#attention" ).slider( "value", e2 );
        $( "#sensitivity" ).slider( "value", e3 );
        $( "#aptitude" ).slider( "value", e4 );
    };

    $scope.switchAxes = function (topAxis, rightAxis) {
        console.log('switchaxes');
        $scope.topAxis = topAxis;
        $scope.rightAxis = rightAxis;
    }

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
                    weight: Math.pow(3 * (Math.min(1e3, 1.0 / distance)), 4)});
            }

            $scope.distances = distances;
        };

        redrawMap = function () {
            console.log($scope.distances);
            $scope.map.heatmap.setData($scope.distances);
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

$(document).ready(function () {
    if ($(window).width() < 1500)
        $('body').addClass('too-narrow');
});

$(function() {
	$( ".slider" ).slider({
       orientation: "horizontal",
       value: 50,
       max: 100,
       change: update
   });

	function update() {
		$(".left-bar").click();
	};
});

$(document).ready(function() {
    context = $("#mainCanvas")[0].getContext("2d");
    context.fillStyle = "rgb(200,0,0)";  
    context.fillRect(10, 10, 55, 50);  

    context.fillStyle = "rgba(0, 0, 200, 0.5)";  
    context.fillRect(30, 30, 55, 50);
});


$(function($) {
    $('#control-expander').click(function () {
        $('#controls').slideToggle(500);
    });
    $(".knob").knob({
        change : function (value) {
            //console.log("change : " + value);
        },
        release : function (value) {
            //console.log(this.$.attr('value'));

            goWheel = function (attribute1, attribute2){
                $( attribute2 ).slider( "value", 50 + 50 * Math.cos(value / 180.0 * Math.PI ));
                $( attribute1 ).slider( "value", 50 + 50 * Math.sin(value / 180.0 * Math.PI ));
            };

            goWheel("#attention", "#pleasantness");
            // goWheel("#aptitude", "#sensitivity");
            // goWheel("#sensitivity", "#attention");
            // goWheel("#pleasantness", "#aptitude");
            console.log("release : " + value);
        },
        cancel : function () {
            console.log("cancel : ", this);
        },
        draw : function () {
            // draw axis
            console.log(this.xy);

            this.g.fillRect(-100, -5, 100, 5);
            // "tron" case
            if(this.$.data('skin') == 'tron') {

                var a = this.angle(this.cv)         // Angle
                    , sa = this.startAngle          // Previous start angle
                    , sat = this.startAngle         // Start angle
                    , ea                            // Previous end angle
                    , eat = sat + a                 // End angle
                    , r = 1;

                    this.g.lineWidth = this.lineWidth;

                    this.o.cursor
                    && (sat = eat - 0.3)
                    && (eat = eat + 0.3);

                    if (this.o.displayPrevious) {
                        ea = this.startAngle + this.angle(this.v);
                        this.o.cursor
                        && (sa = ea - 0.3)
                        && (ea = ea + 0.3);
                        this.g.beginPath();
                        this.g.strokeStyle = this.pColor;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                        this.g.stroke();
                    }

                    this.g.beginPath();
                    this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                    this.g.stroke();

                    this.g.lineWidth = 2;
                    this.g.beginPath();
                    this.g.strokeStyle = this.o.fgColor;
                    this.g.arc( this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                    this.g.stroke();
                }

            this.draw();

            // Draw axes... these go above the knob stuff, so are drawn last
            var x  = this.xy;
            var y = this.xy;
            this.g.lineWidth = 2;
            this.g.beginPath();
            this.g.strokeStyle = this.o.fgColor;
            this.g.moveTo(x - this.radius - 100, y);
            this.g.lineTo(x + this.radius + 100, y);
            this.g.stroke();

            this.g.beginPath();
            this.g.strokeStyle = this.o.fgColor;
            this.g.moveTo(x, y - this.radius - 10);
            this.g.lineTo(x, y + this.radius + 10);
            this.g.stroke();

            return false;
        }});

    // Example of infinite knob, iPod click wheel
    var v, up=0,down=0,i=0
    ,$idir = $("div.idir")
    ,$ival = $("div.ival")
    ,incr = function() { i++; $idir.show().html("+").fadeOut(); $ival.html(i); }
    ,decr = function() { i--; $idir.show().html("-").fadeOut(); $ival.html(i); };
    $("input.infinite").knob(
    {
        min : 0
        , max : 20
        , stopper : false
        , change : function () {
            if(v > this.cv){
                if(up){
                    decr();
                    up=0;
                }else{up=1;down=0;}
            } else {
                if(v < this.cv){
                    if(down){
                        incr();
                        down=0;
                    }else{down=1;up=0;}
                }
            }
            v = this.cv;
        }
    });
});
