angular.module('mainApp', [])
.controller('mainController', ['$scope', '$http', function($scope, $http){
	var tripAdvisorApiKey = '4F99833E8FE6438E9F753AE4E0257653';

	$scope.page = "landingPage";
	$scope.location = "";
	$scope.selectedOptions = {};
	$scope.loadedOption = {
		hotelOptions: [],
		attractionsOptions: [],
		selectedEvents: []
	};
	$scope.mapMap = {
		toronto: {
			latitude: "43.7000",
			longitude: "-79.4000"
		}
	}

	$scope.queryLocation = function(queryLocation){
		$scope.page = 'selectPage';
		$http.get('http://api.tripadvisor.com/api/partner/2.0/search/' + queryLocation + '?key=' + tripAdvisorApiKey + '&categories=geos')
			.then(function(res){
				console.log(res.data.geos[0].location_id);
				$scope.selectedOptions.locationId = res.data.geos[0].location_id;
				queryAttractionsByLocationId($scope.selectedOptions.locationId)
				console.log($scope.selectedOptions);
			}, function(err){
				console.log(err);
			});
	}

	function queryAttractionsByLocationId(locationId) {
		$http.get('http://api.tripadvisor.com/api/partner/2.0/location/' + locationId + '/attractions?key=' + tripAdvisorApiKey).then(querySuccess, queryError);

		function querySuccess(res){
			console.log(res);
		}

		function queryError(err){
			console.log(err);
		}
	}

	function parseData(){

	}
}])