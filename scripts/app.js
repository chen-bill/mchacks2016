'use strict'

angular.module('mainApp', ['ui.bootstrap'])
.controller('mainController', ['$scope', '$http', function($scope, $http){
	var tripAdvisorApiKey = '4F99833E8FE6438E9F753AE4E0257653';

	$scope.page = "landingPage";
	$scope.location = "";
	$scope.selectedEvents = [];
	$scope.loadedOptions = {
		hotelOptions: {},
		attractionsOptions: {},
		restaurantOptions: {}
	};

	$scope.queryLocation = function(queryLocation){
		$scope.page = 'selectPage';
		$http.get('http://api.tripadvisor.com/api/partner/2.0/search/' + queryLocation + '?key=' + tripAdvisorApiKey + '&categories=geos')
			.then(function(res){
				var newLocationId = res.data.geos[0].location_id;
				queryAttractionsByLocationId(newLocationId);
				queryHotelsByLocationId(newLocationId);
				queryRestaurantsByLocationId(newLocationId);
			}, function(err){
				console.log(err);
			});
	}

	function queryAttractionsByLocationId(locationId) {
		$http.get('http://api.tripadvisor.com/api/partner/2.0/location/' + locationId + '/attractions?key=' + tripAdvisorApiKey).then(querySuccess, queryError);

		function querySuccess(httpResponse){
			parseData('attractions', httpResponse);
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
		};
		function queryError(err){
			console.log(err);
		};
	}

	function parseData(type, httpResponse){
		if(type == 'attractions'){
			var attractionsArray = httpResponse.data.data;
			for(var key in attractionsArray){
				$scope.loadedOptions.attractionsOptions[attractionsArray[key].name] = {
					name: attractionsArray[key].name,
					latitude: attractionsArray[key].latitude,
					longitude: attractionsArray[key].longitude,
					rating: attractionsArray[key].rating,
					address: attractionsArray[key].address_obj,
					selected: false
				}
			}
		} else if (type == 'restaurants'){
			var restaurantsArray = httpResponse.data.data;
			for(var key in restaurantsArray){
				$scope.loadedOptions.restaurantOptions[restaurantsArray[key].name] = {
					name: restaurantsArray[key].name,
					latitude: restaurantsArray[key].latitude,
					longitude: restaurantsArray[key].longitude,
					rating: restaurantsArray[key].rating,
					address: restaurantsArray[key].address_obj,
					selected: false
				}
			}
		} else {
			var hotelOptions = httpResponse.data.data;
			for(var key in hotelOptions){
				$scope.loadedOptions.hotelOptions[hotelOptions[key].name] = {
					name: hotelOptions[key].name,
					latitude: hotelOptions[key].latitude,
					longitude: hotelOptions[key].longitude,
					rating: hotelOptions[key].rating,
					address: hotelOptions[key].address_obj,
					selected: false
				}
			}
		}
	}
	var mockItinerary = [
	  {
	    "name": "Toronto Bicycle Tours",
	    "latitude": "43.6545",
	    "longitude": "-79.39039",
	    "rating": "5.0",
	    "address": {
	      "street1": "275 Dundas Street West",
	      "street2": "",
	      "city": "Toronto",
	      "state": "Ontario",
	      "country": "Canada",
	      "postalcode": "M5T 3K1",
	      "address_string": "275 Dundas Street West, Toronto, Ontario M5T 3K1 Canada"
	    },
	    "selected": false,
	    "$$hashKey": "object:100"
	  },
	  {
	    "name": "Edge Walk at the CN Tower",
	    "latitude": "43.643883",
	    "longitude": "-79.38902",
	    "rating": "5.0",
	    "address": {
	      "street1": "301 Front Street West",
	      "street2": "",
	      "city": "Toronto",
	      "state": "Ontario",
	      "country": "Canada",
	      "postalcode": "M5V 2T6 ",
	      "address_string": "301 Front Street West, Toronto, Ontario M5V 2T6 Canada"
	    },
	    "selected": false,
	    "$$hashKey": "object:102"
	  },
	  {
	    "name": "St. Lawrence Market",
	    "latitude": "43.64921",
	    "longitude": "-79.371956",
	    "rating": "4.5",
	    "address": {
	      "street1": "92-95 Front St. E.",
	      "street2": "",
	      "city": "Toronto",
	      "state": "Ontario",
	      "country": "Canada",
	      "postalcode": "M5E 1C3",
	      "address_string": "92-95 Front St. E., Toronto, Ontario M5E 1C3 Canada"
	    },
	    "selected": false,
	    "$$hashKey": "object:104"
	  }
	];

	function generateRouteData(itinerary) {
		if (itinerary.length == 0)
			return null;

		var result = {};
		result.visits = {

		}
		for (var i = 0; i < itinerary.length; i++) {
			var itineraryName = itinerary[i].name;
			result.visits[itineraryName] = {
				"location": {
					"name": itinerary[i].address.street1,
					"lat": itinerary[i].latitude,
					"lng": itinerary[i].longitude,
				},
				"duration": 1
			};
		};
		//todo: start locaton??? get from user?
		result.fleet = {
			"person1": {
				"start_location": {
					"id": "hotel",
					"name": "insert address here",
					"lat": itinerary[0].latitude,
					"lng": itinerary[0].longitude
				},
				"end_location": {
					"id": "hotel",
					"name": "insert address here",
					"lat": itinerary[0].latitude,
					"lng": itinerary[0].longitude
				},
				"shift_start": "0:00",
				"shift_end": "23:59"
			}
		}
		console.log(result);
		return result;
	};

	// console.log(mockItinerary);
	// generateRouteData(mockItinerary);

	$scope.generate = function(){
		$scope.page = 'resultPage';
	}

	$scope.debug = function(){
		console.log(JSON.stringify($scope.selectedEvents));
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
				console.log('here');
				$scope.selectedEvents.splice(item, 1);
			}
		}
	}

	$scope.generateItinerary = function(queryLocation){
		$scope.page = 'result-page';
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
	    $scope.queryLocation($label);
	};

}])