angular.module('mainApp', [])
.controller('mainController', ['$scope', '$http', function($scope, $http){
	var tripAdvisorApiKey = '4F99833E8FE6438E9F753AE4E0257653';

	$scope.page = "landingPage";
	$scope.location = "";
	$scope.selectedOptions = {};
	$scope.loadedOptions = {
		hotelOptions: {},
		attractionsOptions: {},
		restaurantOptions: {}
	};
	$scope.mapMap = {
		toronto: {
			latitude: "43.7000",
			longitude: "-79.4000"
		}
	}

	$scope.queryLocation = function(queryLocation){
		console.log('queryinglocation');
		$scope.page = 'selectPage';
		$http.get('http://api.tripadvisor.com/api/partner/2.0/search/' + queryLocation + '?key=' + tripAdvisorApiKey + '&categories=geos')
			.then(function(res){
				var newLocationId = res.data.geos[0].location_id;
				$scope.selectedOptions.locationId = res.data.geos[0].location_id;
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
			console.log("query sucess");
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
			attractionsArray = httpResponse.data.data;
			for(var key in attractionsArray){
				$scope.loadedOptions.attractionsOptions[attractionsArray[key].name] = {
					name: attractionsArray[key].name,
					latitude: attractionsArray[key].latitude,
					longitude: attractionsArray[key].longitude,
					rating: attractionsArray[key].rating,
					address: attractionsArray[key].address_obj
				}
			}
		} else if (type == 'restaurants'){
			restaurantsArray = httpResponse.data.data;
			for(var key in restaurantsArray){
				$scope.loadedOptions.restaurantOptions[restaurantsArray[key].name] = {
					name: restaurantsArray[key].name,
					latitude: restaurantsArray[key].latitude,
					longitude: restaurantsArray[key].longitude,
					rating: restaurantsArray[key].rating,
					address: restaurantsArray[key].address_obj
				}
			}
		} else {
			hotelOptions = httpResponse.data.data;
			for(var key in hotelOptions){
				$scope.loadedOptions.hotelOptions[hotelOptions[key].name] = {
					name: hotelOptions[key].name,
					latitude: hotelOptions[key].latitude,
					longitude: hotelOptions[key].longitude,
					rating: hotelOptions[key].rating,
					address: hotelOptions[key].address_obj
				}
			}
		}
	}

	$scope.debug = function(){
		console.log($scope.loadedOptions);
	}
}])