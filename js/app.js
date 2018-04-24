//Create a map variable
    var map;
    //Create array of markers
    var markers = [];

    var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: 'cyan' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
        ];

  
        // Constructor creates a new map - only center and zoom are required.
     function initMap() {
       
       map = new google.maps.Map(document.getElementById("map"), {
           center: {lat: 40.740386, lng: -73.920872},
           zoom: 18,
           styles: styles,
           mapTypeControl: false//user cannot change map type to satellite roads terrain etc
       });

       var locations = [
       {title: 'E 72nd St., Manhattan', location: {lat: 40.767549, lng: -73.954709}},
       {title: '44th St., Woodside, Queens', location: {lat: 40.740386, lng: -73.920872}},
       {title: '41st St. Sunnyside, Queens', location: {lat: 40.746774, lng: -73.923021}},
       {title: '103rd St. Corona, Queens', location: {lat: 40.74978, lng: -73.862646}},
       {title: '117th St., Queens', location: {lat: 40.758247, lng: -73.862267 }},
       {title: '20 Henry St., Brooklyn Heights, Brooklyn', location: {lat: 40.700203, lng: -73.991933}},
       {title: 'Avenue J, Midwood, Brooklyn', location: {lat: 40.624991, lng: -73.961067}},
       {title: '190 St. & Davidson, Bronx', location: {lat: 40.865379, lng: -73.900579}}
       ];

       var largeInfowindow = new google.maps.InfoWindow();
        //var bounds = new google.maps.LatLngBounds();moved to showplaces function

        //Styles the markers, default marker
        var defaultIcon = makeMarkerIcon('0091ff');

        var highlightedIcon = makeMarkerIcon('FFFF24');

       //the loop takes the location array and ceates and array of markers on initilizing
       for (var i = 0; i <locations.length; i++) {
           //get postion from the location array
           var position = locations[i].location;
           var title = locations[i].title;
           //create one marker per location and put the in the markers array
           var marker = new google.maps.Marker({
               //map: map,
               position: position,
               title: title,
               icon: defaultIcon,
               animation: google.maps.Animation.DROP,
               id:i
           });
           //push each marker on to the markers array
           markers.push(marker);
           //extend the boundaries of the map for each marker
           //bounds.extend(marker.position);moved to showplaces function
           //create an event listener when clicking to open each infowindow
           marker.addListener('click', function() {
               populateInfoWindow(this, largeInfowindow);//this refers to the object to the left of the dot at function scall time
           });

           //eventlisteners for hover over
           marker.addListener('mouseover', function() {
               this.setIcon(highlightedIcon);
           });

           marker.addListener('mouseout', function() {
               this.setIcon(defaultIcon);
           });
       }

        //map.fitBounds(bounds);moved into showplaces function

       document.getElementById('show-places').addEventListener('click', showPlaces);
       document.getElementById('hide-places').addEventListener('click', hidePlaces);
     }
       //Populate the infowindow when the marker is clicked
       function populateInfoWindow(marker, infowindow) {
           //check to make sure the info window is not already openend on this marker
           if (infowindow.marker != marker) {
               infowindow.marker = marker;
               infowindow.setContent('<div>' + marker.title +' '+ marker.position +'<div>');
               infowindow.open(map, marker);
               
               //Make sure the marker property is cleared if the infowindow is closed
               infowindow.addListener('closeclick', function(){
                   infowindow.setMarker(null);
               });
           }
       }

       function showPlaces() {
           var bounds = new google.maps.LatLngBounds();
           //Extend the bounds for each marker on the map and display the marker
           for(var i = 0; i < markers.length; i++) {
              markers[i].setMap(map);
              bounds.extend(markers[i].position);
           }
           map.fitBounds(bounds);
       }
       
       //loops through and hides each marker
       function hidePlaces() {
           for(var i = 0; i < markers.length; i++) {
               markers[i].setMap(null);
           }
       }

       function makeMarkerIcon(markerColor) {
           var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
           new google.maps.Size(21, 34),
           new google.maps.Point(0, 0),
           new google.maps.Point(10, 34),
           new google.maps.Size(21, 34));
         return markerImage;
       }

//        var woodside = {lat: 40.740386, lng: -73.920872
//        var firstNYC = new google.maps.Marker({
//            position: woodside,
//            map: map,
//            title: "Woodside, Queens"
//        });
//        var infowindow = new google.maps.InfoWindow({
//            content: '47-31 44th Street, Woodside, New York 11377'
//        });
//        firstNYC.addListener('click', function() {
//            infowindow.open(map, firstNYC);//if not 'marker' use a position property so it has a place to open
//        });