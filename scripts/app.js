'use strict'

angular.module('mainApp', ['ui.bootstrap', 'ngAnimate'])
.controller('mainController', ['$scope', '$http', function($scope, $http){
	var tripAdvisorApiKey = '58d228cfafdb4eb1a1ad67010537778b';
	var googlePlacesApiKey = 'AIzaSyAahHAcSl2j4Yc8ZlhfB85Od1g_NdBGzf8';
    var uberServerToken = '6YDZJ_ZzQzdVZLDasJBuAFTp0ulYus4ql8QSkFWw';
	$scope.page = "landingPage";
	$scope.location = "";
	$scope.loading = false;
	$scope.selectedEvents = [];
	$scope.loadedOptions = {
		hotelOptions: {},
		attractionsOptions: {},
		restaurantOptions: {}
	};
	$scope.startLocationAddress = "";

	// map stuff
	$scope.totalTripDistance;
	$scope.totalTripTime;

	var startLocationData;
	var endLocationData;

	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();
	var map;


	$scope.markersData = [];

	function queryLocationByName(queriedLocation, callback){
		$scope.loading = true;
		$http.get('http://api.tripadvisor.com/api/partner/2.0/search/' + queriedLocation + '?key=' + tripAdvisorApiKey + '&categories=geos')
			.then(function(res){
				console.log(res);
				callback(res.data.geos[0].location_id);
			}, function(err){
				console.log(err);
			});
	}

	function queryLocationByAddress(address, callback){
		var finalAddress = address.split(' ').join('+');
		$http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + finalAddress + '&key=' + googlePlacesApiKey)
			.then(function(res){
				callback(res.data.results);
			}, function(err){
				console.log(err);
			});
	}

	function queryAttractionsByLocationId(locationId) {
		$http.get('http://api.tripadvisor.com/api/partner/2.0/location/' + locationId + '/attractions?key=' + tripAdvisorApiKey).then(querySuccess, queryError);

		function querySuccess(httpResponse){
			parseData('attractions', httpResponse);
			$scope.page = 'selectPage';
			$scope.loading = false;
		};
		function queryError(err){
			console.log(err);
		};
	}

	function queryHotelsByLocationId(locationId){
		$http.get('http://api.tripadvisor.com/api/partner/2.0/location/' + locationId + '/hotels?key=' + tripAdvisorApiKey).then(querySuccess, queryError);

		function querySuccess(httpResponse){
			parseData('hotels', httpResponse);
		};
		function queryError(err){
			console.log(err);
		};
	}

	function queryRestaurantsByLocationId(locationId){
		$http.get('http://api.tripadvisor.com/api/partner/2.0/location/' + locationId + '/restaurants?key=' + tripAdvisorApiKey).then(querySuccess, queryError);

		function querySuccess(httpResponse){
			parseData('restaurants', httpResponse);
		}
		function queryError(err){
			console.log(err);
		}
	}

    function queryEstimate(){
        console.log("sending");
        $http.get("http://api.uber.com/v1/estimates/price?start_latitude=" + $scope.markersData[0].lat + "+ &start_longitude=" + $scope.markersData[0].lng + "&end_latitude=" + $scope.markersData[1].lat + "&end_longitude=" + $scope.markersData[1].lng + "&server_token="
            + uberServerToken).then(querySuccess, queryError);
        function querySuccess(httpResponse){
            var estimate = httpResponse.data.prices[0].estimate;
            $('#fare-estimate').attr("placeholder", estimate + " to Uber to first destination");
        }
        function queryError(err){
            console.log(err);
        }
    }

	function parseData(type, httpResponse){
		if(type == 'attractions'){
			var attractionsArray = httpResponse.data.data;
			for(var key in attractionsArray){
				var newName = attractionsArray[key].name.replace(/[^\w\s]/gi, '');
				$scope.loadedOptions.attractionsOptions[newName] = {
					name: newName,
					latitude: attractionsArray[key].latitude,
					longitude: attractionsArray[key].longitude,
					rating: attractionsArray[key].rating,
					address: attractionsArray[key].address_obj,
					ratingImage: attractionsArray[key].rating_image_url,
					rankingData: attractionsArray[key].ranking_data,
					selected: false
				}
			}
		} else if (type == 'restaurants'){
			var restaurantsArray = httpResponse.data.data;
			for(var key in restaurantsArray){
				var newName = restaurantsArray[key].name.replace(/[^\w\s]/gi, '');
				$scope.loadedOptions.restaurantOptions[newName] = {
					name: newName,
					latitude: restaurantsArray[key].latitude,
					longitude: restaurantsArray[key].longitude,
					rating: restaurantsArray[key].rating,
					address: restaurantsArray[key].address_obj,
					ratingImage: restaurantsArray[key].rating_image_url,
					rankingData: restaurantsArray[key].ranking_data,
					selected: false
				}
			}
		} else {
			var hotelOptions = httpResponse.data.data;
			for(var key in hotelOptions){
				var newName = hotelOptions[key].name.replace(/[^\w\s]/gi, '');
				$scope.loadedOptions.hotelOptions[newName] = {
					name: newName,
					latitude: hotelOptions[key].latitude,
					longitude: hotelOptions[key].longitude,
					rating: hotelOptions[key].rating,
					address: hotelOptions[key].address_obj,
					ratingImage: hotelOptions[key].rating_image_url,
					rankingData: hotelOptions[key].ranking_data,
					selected: false
				}
			}
		}
	}


	function generateRouteData(startLocation, itinerary, callback) {

		if (itinerary.length == 0)
			return null;

		var result = {};
		result.visits = {

		}
		for (var i = 0; i < itinerary.length; i++) {
			var itineraryName = itinerary[i].name;

			result.visits[itineraryName] = {
				"location": {
					"name": itineraryName,
					"lat": itinerary[i].latitude,
					"lng": itinerary[i].longitude,
				},
				"duration": 1
			};
		};

		result.fleet = {
			"person1": {
				"start_location": {
					"id": "home",
					"name": startLocation[0].formatted_address,
					"lat": startLocation[0].geometry.location.lat,
					"lng": startLocation[0].geometry.location.lng
				},
				"end_location": {
					"id": "home",
					"name": startLocation[0].formatted_address,
					"lat": startLocation[0].geometry.location.lat,
					"lng": startLocation[0].geometry.location.lng
				},
				"shift_start": "0:00",
				"shift_end": "23:59"
			}
		}
		callback(result);
	};

	// console.log(mockItinerary);
	// generateRouteData(mockItinerary);

	$scope.debug = function(){

	}

	$scope.addEvent = function(event){
		for(var categories in $scope.loadedOptions){
			if($scope.loadedOptions[categories][event.name] && $scope.loadedOptions[categories][event.name].selected == false){
				$scope.loadedOptions[categories][event.name].selected = true;
				$scope.selectedEvents.push(event);
			} else if ($scope.loadedOptions[categories][event.name]){
				removeEvent(event);
				$scope.loadedOptions[categories][event.name].selected = false;
			}
		}
	}

	function removeEvent(event){
		for(var item in $scope.selectedEvents){
			if($scope.selectedEvents[item].name == event.name){
				$scope.selectedEvents.splice(item, 1);
			}
		}
	}

	$scope.generateItinerary = function(){
		$scope.page = 'resultPage';

		queryLocationByAddress($scope.startLocationAddress, function(startLocation){

			startLocationData = {
				"name": 'Start: ' + startLocation[0].formatted_address,
				lat: parseFloat(startLocation[0].geometry.location.lat),
				lng: parseFloat(startLocation[0].geometry.location.lng)
			}

			endLocationData = {
				"name": 'End: ' + startLocation[0].formatted_address,
				lat: parseFloat(startLocation[0].geometry.location.lat),
				lng: parseFloat(startLocation[0].geometry.location.lng)
			}

			generateRouteData(startLocation, $scope.selectedEvents, function(response){
				var req = {
					method: 'POST',
					url: 'https://api.routific.com/v1/vrp',
					headers: {
					  	'Content-Type': 'application/json',
					  	'Authorization': 'bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NmQ2NWZjYzUxYWQ2M2Y2MTBlYTIyYzYiLCJpYXQiOjE0NTY4ODk4MDR9.GqSUPl3lxWranUrFno6mQbAy6AzpnUaRrp6mdyNDcZ0'
					},
					data: response
				}

			$http(req).then(optimizationCallback, optimizationError);
				function optimizationCallback(response){
					console.log(response);
					configureOptimizedData(response.data.solution.person1, function(result){
						for (var i = 0; i < result.length; i++) {
							result[i] = {
								lat: parseFloat(result[i].latitude),
								lng: parseFloat(result[i].longitude),
								name: result[i].name
							};
						};
						result.unshift(startLocationData);
						result.push(endLocationData);

						$scope.markersData = result;
						initialize();
					});
				}

				function optimizationError(error){
					console.log('error in optimzation search: ' + JSON.stringify(error));
				}
			});
		});
	}

	function configureOptimizedData (orderedData, callback){
		var result = [];
		for(var key in orderedData){
			for(var categories in $scope.loadedOptions){
				for(var places in $scope.loadedOptions[categories]){
					if($scope.loadedOptions[categories][places].name == orderedData[key].location_id){
						result.push({
							name: orderedData[key].location_id,
							latitude: $scope.loadedOptions[categories][places].latitude,
							longitude: $scope.loadedOptions[categories][places].longitude
						});
					}
				}
			}
		}
		callback(result);
	}

	$scope.editItinerary = function(){
		$scope.page = "selectPage";
		$scope.location = "";
		$scope.loading = false;
		$scope.startLocationAddress = "";
		$scope.markersData = [];
	}

	$scope.changeCity = function(){
		$scope.page = "landingPage";
		$scope.location = "";
		$scope.loading = false;
		$scope.startLocationAddress = "";
		$scope.markersData = [];
	}

	var _selected;
	$scope.getLocation = function(val) {
	return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
		  params: {
		    address: val,
		    sensor: false
		  }
		}).then(function(response){
		  return response.data.results.map(function(item){
		    return item.formatted_address;
		  });
		});
	};

	$scope.ngModelOptionsSelected = function(value) {
		if (arguments.length) {
		  _selected = value;
		} else {
		  return _selected;
		}
	};

	$scope.onSelect = function ($item, $model, $label) {
	 	$scope.location = $label;
	    queryLocationByName($label, function(newLocationId){
	    	queryAttractionsByLocationId(newLocationId);
			queryHotelsByLocationId(newLocationId);
			queryRestaurantsByLocationId(newLocationId);
	    });
	};

// Bills attempt

	function initialize() {
	    directionsDisplay = new google.maps.DirectionsRenderer();
	    var myOptions = {
	        zoom: 5,
	        mapTypeId: google.maps.MapTypeId.ROADMAP,
	        center: google.maps.LatLng(40.601203,-8.668173),
	        draggableCursor: "pointer",
	    };
	    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	    directionsDisplay.setMap(map);
	    calcRoute();
	}

	function calcRoute() {
	    var waypointsData = [];
	    for(var events in $scope.markersData){
	    	waypointsData.push({
	    		location: new google.maps.LatLng($scope.markersData[events].lat, $scope.markersData[events].lng),
	    		stopover: false
	    	})
	    }

	    var request = {
	        origin: new google.maps.LatLng(startLocationData.lat,startLocationData.lng),
	        destination: new google.maps.LatLng(startLocationData.lat,startLocationData.lng),
	        waypoints: waypointsData,
	        travelMode: google.maps.DirectionsTravelMode.WALKING
	    };

	    directionsService.route(request, function (response, status) {
	    	console.log(response);
	        if (status == google.maps.DirectionsStatus.OK) {
	            directionsDisplay.setDirections(response);
	            var route = response.routes[0];
	            var summaryPanel = document.getElementById("directions_panel");
	            summaryPanel.innerHTML = "";
	            // For each route, display summary information.
	            for (var i = 0; i < route.legs.length; i++) {
	                var routeSegment = i + 1;
	                summaryPanel.innerHTML += "<b>Route Segment: " + routeSegment + "</b><br />";
	                summaryPanel.innerHTML += route.legs[i].start_address + " to ";
	                summaryPanel.innerHTML += route.legs[i].end_address + "<br />";
	                summaryPanel.innerHTML += route.legs[i].distance.text + "<br /><br />";
	            }
	        } else {
	            alert("directions response " + status);
	        }
	    });
	}

}])
