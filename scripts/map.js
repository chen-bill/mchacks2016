var map;
var infoWindow;

//http://stackoverflow.com/questions/6593473/lat-long-array-as-markers-on-google-maps-api-v3
var markersDataList  = ["51.38254, -2.362804", "51.235249, -2.297804", "51.086126, -2.210767", "51.084519, -2.262813", "51.175994, -2.159207", "51.132978, -2.213939", "51.207289, -2.181474", "51.321724, -2.205518", "51.317219, -2.210649", "50.700816, -1.925721", "50.719979, -2.074488", "50.810063, -1.919034", "50.785094, -1.849725", "50.842648, -1.777575", "50.723047, -1.902297", "50.743044, -1.880132", "51.71355, 0.154967", "51.992676, 0.602668", "52.355964, -1.486877", "53.523356, -1.107254", "51.87591, -2.235986", "51.670729, -1.934476", "51.542953, -0.28102", "51.52132, 0.098986", "52.271354, 0.788806", "51.346031, -0.478255", "51.263343, -1.140235", "51.481736, -1.089953", "51.476566, -0.514911", "51.505462, -0.555614", "51.558631, -1.78224", "51.351101, -1.995069", "51.380722, -2.039105", "51.416719, -2.124294", "51.42063, -2.133049", "51.533076, -1.925663", "51.348518, -1.797868", "51.331682, -1.776469", "51.127299, -1.568594", "51.082304, -1.172732", "50.994651, -1.495699", "50.988355, -1.499401", "51.074562, -1.774168", "51.066228, -1.799655", "51.071929, -1.794634", "51.218585, -1.515494", "51.080011, -1.860008", "5151.070508, -1.810412", "51.056581, -1.795259", "51.043955, -1.789822", "51.20323, -1.906011", "51.229055, -1.951243", "51.061094, -1.998836", "51.039063, -1.999079", "51.067313, -2.070322", "51.099235, -1.787773", "51.250454, -1.764469", "51.006591, -1.650057", "50.999451, -2.080693", "50.993131, -2.246465", "51.006542, -2.197207", "51.01744, -2.186619", "51.042629, -2.272731", "51.007395, -2.332772", "55.605281, -2.899154", "53.395123, -2.537949", "53.684928, -1.511449"];
var marker, i;

var markersData = [
for (i = 0; i < markersDataList.length; i++) 
{  
    marker = new google.maps.Marker({
    position: new google.maps.LatLng(markersDataList[i][0], markersDataList[i][1]),
    map: map
  });

}

// for (i = 0; i < markersDataList.length; i++) 
// {  
//     //marker = new google.maps.Marker({
//     lat: new google.maps.LatLng(markersDataList[i][0]),
//       lng: new google.maps.LatLngmarkersDataList[i][1])
//     //map: map
//   //});

// }
//]
//markersData variable stores the information necessary to each marker
var markersData = [
   {
      // lat: 40.6386333,
      // lng: -8.745,
       // lat: place.geometry.location.lat();
       // lng: place.geometry.location.lng();

      lat: latitude.result();


   },

   {
      lat: 40.59955,
      lng: -8.7498167,

   },

   {
      lat: 40.6247167,
      lng: -8.7129167,

   } 
];


function initialize() {
   var mapOptions = {
      center: new google.maps.LatLng(40.601203,-8.668173),
      zoom: 9,
      mapTypeId: 'roadmap',
   };

   map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

   // a new Info Window is created
   infoWindow = new google.maps.InfoWindow();

   // Event that closes the Info Window with a click on the map
   google.maps.event.addListener(map, 'click', function() {
      infoWindow.close();
   });

   // Finally displayMarkers() function is called to begin the markers creation
   displayMarkers();
}
google.maps.event.addDomListener(window, 'load', initialize);


// This function will iterate over markersData array
// creating markers with createMarker function
function displayMarkers(){

   // this variable sets the map bounds according to markers position
   var bounds = new google.maps.LatLngBounds();
   
   // for loop traverses markersData array calling createMarker function for each marker 
   for (var i = 0; i < markersData.length; i++){

      var latlng = new google.maps.LatLng(markersData[i].lat, markersData[i].lng);
      var name = markersData[i].name;
     

      createMarker(latlng, name);

      // marker position is added to bounds variable
      bounds.extend(latlng);  
   }

//sets bounds
   map.fitBounds(bounds);
}

//creates marker + displays 
function createMarker(latlng, name, address1, address2, postalCode){
   var marker = new google.maps.Marker({
      map: map,
      position: latlng,
      title: name
   });

   // This event expects a click on a marker
   // When this event is fired the Info Window content is created
   // and the Info Window is opened.
   google.maps.event.addListener(marker, 'click', function() {
      
      // Creating the content to be inserted in the infowindow
      var iwContent = '<div id="iw_container">' +
            '<div class="iw_title">' + name + '</div>' +
         '<div class="iw_content">' + address1 + '<br />' +
         address2 + '<br />' +
         postalCode + '</div></div>';
      
      // including content to the Info Window.
      infoWindow.setContent(iwContent);

      // opening the Info Window in the current map and at the current marker location.
      infoWindow.open(map, marker);
   });
}