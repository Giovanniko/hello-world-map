//Create a map variable
    var map;
    //Create array of markers
    var markers = [];

    //global polygon variable ensures only ONE polygon is drawn
    var polygon = null;
 
    function initMap() {
         //Create styles array
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
       map = new google.maps.Map(document.getElementById("map"), {
           center: {lat: 40.740386, lng: -73.920872},
           zoom: 13,
           styles: styles,
           mapTypeControl: false//user cannot change map type to satellite roads terrain etc
       });
        //better to use a database served up remotely
       var locations = [
       {title: '430 E 72nd St., Manhattan', location: {lat:  40.7671278, lng: -73.9544168}, heading: 207},
       {title: '44th St., Woodside, Queens', location: {lat: 40.740386, lng: -73.920872}, heading: 0},
       {title: '41st St. Sunnyside, Queens', location: {lat: 40.746774, lng: -73.923021}, heading: 0},
       {title: '103rd St. Corona, Queens', location: {lat: 40.74978, lng: -73.862646}, heading: 0},
       {title: '117th St., Queens', location: {lat: 40.758247, lng: -73.862267 }, heading: 0},
       {title: '20 Henry St., Brooklyn Heights, Brooklyn', location: {lat: 40.700203, lng: -73.991933}, heading: 0},
       {title: 'Avenue J, Midwood, Brooklyn', location: {lat: 40.624991, lng: -73.961067}, heading: 0},
       {title: '190 St. & Davidson, Bronx', location: {lat: 40.865379, lng: -73.900579}, heading: 0}
       ];

      var largeInfowindow = new google.maps.InfoWindow();
        //var bounds = new google.maps.LatLngBounds();moved to showplaces function
        
      //Initialize the drawing manager:  
      var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
                ]
        }
      });

        //Styles the markers, default marker
      var defaultIcon = makeMarkerIcon('0091ff');

      var highlightedIcon = makeMarkerIcon('FFFF24');

       //the loop takes the location array and ceates and array of markers on initilizing
       for (var i = 0; i <locations.length; i++) {
           //get position from the location array
           var position = locations[i].location;
           var title = locations[i].title;
           var heading = locations[i].heading;
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
        
       document.getElementById('toggle-drawing').addEventListener('click', function() {
           toggleDrawing(drawingManager);
       });
        
        // Add an event listener so that the polygon is captured,  call the
        // searchWithinPolygon function. This will show the markers in the polygon,
        // and hide any outside of it.
        drawingManager.addListener('overlaycomplete', function(event) {
          // First, check if there is an existing polygon.
          // If there is, get rid of it and remove the markers
          if (polygon) {
            polygon.setMap(null);
            hidePlaces(markers);
          }
          // Switching the drawing mode to the HAND (i.e., no longer drawing).
          drawingManager.setDrawingMode(null);
          // Creating a new editable polygon from the overlay.
          polygon = event.overlay;
          polygon.setEditable(true);
          // Searching within the polygon.
          searchWithinPolygon();
          // Make sure the search is re-done if the poly is changed.
          polygon.getPath().addListener('set_at', searchWithinPolygon);
          polygon.getPath().addListener('insert_at', searchWithinPolygon);
        });    
        
     }
     
//Populate the infowindow when the marker is clicked
     function populateInfoWindow(marker, infowindow) {
        //check to make sure the info window is not already open on this marker
        if (infowindow.marker != marker) {
           //Clear the infowindow content to give the streetview time to load.
           infowindow.setContent('');
           infowindow.marker = marker;
           //infowindow.open(map, marker);
               
           //Make sure the marker property is cleared if the infowindow is closed
           infowindow.addListener('closeclick', function(){
             infowindow.marker = null;
             //infowindow.setMarker(null);
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;

            // In case the status is OK, which means the panoramic was found, compute the
            // position of the streetview image, then calculate the heading, then get a
            // panorama from that and set the options
            
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
         streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
         infowindow.open(map, marker);
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
    
    //function that hides and shows the drawing options
    function toggleDrawing(drawingManger) {
        if (drawingManger.map) {
            drawingManger.setMap(null);
            //if the user drew something, get rid of the polygon
            if (polygon) {
                polygon.setMap(null);
            }
        } else {
            drawingManger.setMap(map);
        }
    }

      // This function hides all markers outside the polygon,
      // and shows only the ones within it. This is so that the
      // user can specify an exact area of search.
      function searchWithinPolygon() {
        for (var i = 0; i < markers.length; i++) {
          if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
            markers[i].setMap(map);
          } else {
            markers[i].setMap(null);
          }
        }
      }