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

	// ******************************************************************8
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