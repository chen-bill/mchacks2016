var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var myOptions = {
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: chicago
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    directionsDisplay.setMap(map);
    calcRoute();
}

function calcRoute() {
    var first = new google.maps.LatLng(42.496403, -124.413128);
    var second = new google.maps.LatLng(42.496401, -124.413126);

    var request = {
        origin: "1521 NW 54th St, Seattle, WA 98107 ",
        destination: "San Diego, CA",
        waypoints: [{location: first, stopover: false},
            {location: second, stopover: false}],
        optimizeWaypoints: true,
        travelMode: google.maps.DirectionsTravelMode.WALKING
    };
    directionsService.route(request, function (response, status) {
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