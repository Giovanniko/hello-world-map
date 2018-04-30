//Create a map variable
    var map;
    //Create array of markers
    var markers = [];

    //global polygon variable ensures only ONE polygon is drawn
    var polygon = null;

    //create placemarkers array to us in the multiple functions to have control
    //over the number of places that show.
    var placeMarkers = [];
 
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

       //this autocomplete is for use in the search within time entry box
       var timeAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('search-within-time-text'));

       //this autocomplete is for use in the geocoder entry box
       var zoomAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('zoom-to-area-text'));
       //bias the boundaries within the map for the zoom to area text
       zoomAutocomplete.bindTo('bounds', map);

       //create a searchbox in order to execute a places search
       var searchBox = new google.maps.places.SearchBox(
        document.getElementById('places-search'));

        //Biast the searchbox to within the bounds of the map
        searchBox.setBounds(map.getBounds());


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
       document.getElementById('hide-places').addEventListener('click', function() {
           hideMarkers(markers);
       });
        
       document.getElementById('toggle-drawing').addEventListener('click', function() {
           toggleDrawing(drawingManager);
       });

       document.getElementById('zoom-to-area').addEventListener('click', function() {
           zoomToArea();
       });

       document.getElementById('search-within-time').addEventListener('click', function(){
           searchWithinTime();
       });

       //Listen for the event fired when the user selects a predicition from the 
       //picklist and retrieve more details for that place.
       searchBox.addListener('places_changed', function() {
           searchBoxPlaces(this);
       });

       //listen for the event fired when the user selects a predicition and clicks
       //'go' more details for that place.
       document.getElementById('go-places').addEventListener('click', textSearchPlaces);
       
        
        // Add an event listener so that the polygon is captured,  call the
        // searchWithinPolygon function. This will show the markers in the polygon,
        // and hide any outside of it.
        drawingManager.addListener('overlaycomplete', function(event) {
          // First, check if there is an existing polygon.
          // If there is, get rid of it and remove the markers
          if (polygon) {
            polygon.setMap(null);
            hideMarkers(markers);
          }
          // Switching the drawing mode to the HAND (i.e., no longer drawing).
          drawingManager.setDrawingMode(null);
          // Creating a new editable polygon from the overlay.
          polygon = event.overlay;
          polygon.setEditable(true);
          //calculate area of polygon and send to screen
          var area = google.maps.geometry.spherical.computeArea(polygon.getPath());
          window.alert(area + "SQ METERS");
          // Searching within the polygon.
          searchWithinPolygon();
          // Make sure the search is re-done if the poly is changed.
          polygon.getPath().addListener('set_at', searchWithinPolygon);
          polygon.getPath().addListener('insert_at', searchWithinPolygon);
          
        });
      
     }

     
    //Populate the infowindow when the marker is clicked
    function populateInfoWindow(marker, infowindow) {
        //check to make sure the infowindow is not already open on this marker
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
       function hideMarkers(markers) {
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

       function zoomToArea() {
           //initialize the geocoder
           var geocoder = new google.maps.Geocoder();
           //get the address entered by user
           var address = document.getElementById('zoom-to-area-text').value;
           //check address is not blank
           if (address =='') {
               window.alert('You must enter an area, or address.');
           } else {
               //geocode the address and get the center and center the maps
               geocoder.geocode(
                 {address: address,
                  componentRestrictions: {locality: 'New York'}
                 }, function(results, status) {
                     if (status == google.maps.GeocoderStatus.OK){
                         map.setCenter(results[0].geometry.location);
                         document.getElementById('results').innerHTML = results[0].formatted_Address;
                         document.getElementById('results').innerHTML = results[0].geometry.location;
                         map.setZoom(15);
                     } else {
                       window.alert ('We could not find that location - try enter a more' +
                       'specific place');
                     }
                 });
             }
           }

      // This function allows the user to input a desired travel time, in
      // minutes, and a travel mode, and a location - and only show the listings
      // that are within that travel time (via that travel mode) of the location
      function searchWithinTime() {
        // Initialize the distance matrix service.
        var distanceMatrixService = new google.maps.DistanceMatrixService;
        var address = document.getElementById('search-within-time-text').value;
        // Check to make sure the place entered isn't blank.
        if (address == '') {
          window.alert('You must enter an address.');
        } else {
          hideMarkers(markers);
          // Use the distance matrix service to calculate the duration of the
          // routes between all our markers, and the destination address entered
          // by the user. Then put all the origins into an origin matrix.
          var origins = [];
          for (var i = 0; i < markers.length; i++) {
            origins[i] = markers[i].position;
          }
          var destination = address;
          var mode = document.getElementById('mode').value;
          // Now that both the origins and destination are defined, get all the
          // info for the distances between them.
          distanceMatrixService.getDistanceMatrix({
            origins: origins,
            destinations: [destination],
            travelMode: google.maps.TravelMode[mode],
            unitSystem: google.maps.UnitSystem.IMPERIAL,
          }, function(response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
              window.alert('Error was: ' + status);
            } else {
              displayMarkersWithinTime(response);
            }
          });
        }
      }

       // This function will go through each of the results, and,
      // if the distance is LESS than the value in the picker, show it on the map.
      function displayMarkersWithinTime(response) {
        var maxDuration = document.getElementById('max-duration').value;
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        // Parse through the results, and get the distance and duration of each.
        // Because there might be  multiple origins and destinations we have a nested loop
        // Then, make sure at least 1 result was found.
        var atLeastOne = false;
        for (var i = 0; i < origins.length; i++) {
          var results = response.rows[i].elements;
          for (var j = 0; j < results.length; j++) {
            var element = results[j];
            if (element.status === "OK") {
              // The distance is returned in feet, but the TEXT is in miles. If we wanted to switch
              // the function to show markers within a user-entered DISTANCE, we would need the
              // value for distance, but for now we only need the text.
              var distanceText = element.distance.text;
              // Duration value is given in seconds so we make it MINUTES. We need both the value
              // and the text.
              var duration = element.duration.value / 60;
              var durationText = element.duration.text;
              if (duration <= maxDuration) {
                //the origin [i] should = the markers[i]
                markers[i].setMap(map);
                atLeastOne = true;
                // Create a mini infowindow to open immediately and contain the
                // distance and duration
                var infowindow = new google.maps.InfoWindow({
                  content: durationText + ' away, ' + distanceText +
                    '<div><input type=\"button\" value=\"View Route\" onclick =' +
                    '\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
                });
                infowindow.open(map, markers[i]);
                // Put this in so that this small window closes if the user clicks
                // the marker, when the big infowindow opens
                markers[i].infowindow = infowindow;
                google.maps.event.addListener(markers[i], 'click', function() {
                  this.infowindow.close();
                });
              }
            }
          }
        }
        if (!atLeastOne) {
          window.alert('We could not find any locations within that distance!');
        }
      }

      // This function is in response to the user selecting "show route" on one
      // of the markers within the calculated distance. This will display the route
      // on the map.
      function displayDirections(origin) {
        hideMarkers(markers);
        var directionsService = new google.maps.DirectionsService;
        // Get the destination address from the user entered value.
        var destinationAddress =
            document.getElementById('search-within-time-text').value;
        // Get mode again from the user entered value.
        var mode = document.getElementById('mode').value;
        directionsService.route({
          // The origin is the passed in marker's position.
          origin: origin,
          // The destination is user entered address.
          destination: destinationAddress,
          travelMode: google.maps.TravelMode[mode]
        }, function(response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            var directionsDisplay = new google.maps.DirectionsRenderer({
              map: map,
              directions: response,
              draggable: true,
              polylineOptions: {
                strokeColor: 'green'
              }
            });
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }
      // This function fires when the user selects a searchbox picklist item.
      // It will do a nearby search using the selected query string or place.
      function searchBoxPlaces(searchBox) {
        hideMarkers(placeMarkers);
        var places = searchBox.getPlaces();
        if (places.length == 0) {
          window.alert('We did not find any places matching that search!');
        } else {
        // For each place, get the icon, name and location.
          createMarkersForPlaces(places);
        }
      }

      //this function fires when the user selects "go" on the places search.
      //it will do a nearby search using the entered query string or place.
      function textSearchPlaces() {
          var bounds = map.getBounds();
          hideMarkers(placeMarkers);
          var placesService = new google.maps.places.PlacesService(map);
          placesService.textSearch({
              query: document.getElementById('places-search').value,
              bounds: bounds
          }, function(results, status) {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                  createMarkersForPlaces(results);
              }
             });
      }

      //this function creates markers for each place found in either places search
      function createMarkersForPlaces(places) {
          var bounds = new google.maps.LatLngBounds();
          for (var i = 0; i < places.length; i++) {
              var place = places[i];
              var icon = {
                  url: place.icon,
                  size: new google.maps.Size(35, 35),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(15, 34),
                  scaledSize: new google.maps.Size(25, 25)
              };

              //create a marker for each place.
              var marker = new google.maps.Marker({
                  map: map,
                  icon: icon,
                  title: place.name,
                  position: place.geometry.location,
                  id: place.place_id
              });

              // Create a single infowindow to be used with the place details information
              // so that only one is open at once.
              var placeInfoWindow = new google.maps.InfoWindow();
              // If a marker is clicked, do a place details search on it in the next function.
              marker.addListener('click', function() {
                if (placeInfoWindow.marker == this) {
                  console.log("This infowindow already is on this marker!");
                } else {
                  getPlacesDetails(this, placeInfoWindow);
                }
              });
              placeMarkers.push(marker);
                  if (place.geometry.viewport) {
                    //only geocodes have viewport
                    bounds.union(place.geometry.viewport);
                  } else {
                      bounds.extend(place.geometry.location);
                  }
          }
       map.fitBounds(bounds);
      }

      function getPlacesDetails(marker, infowindow) {
      var service = new google.maps.places.PlacesService(map);
      service.getDetails({
        placeId: marker.id
      }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Set the marker property on this infowindow so it isn't created again.
          infowindow.marker = marker;
          var innerHTML = '<div>';
          if (place.name) {
            innerHTML += '<strong>' + place.name + '</strong>';
          }
          if (place.formatted_address) {
            innerHTML += '<br>' + place.formatted_address;
          }
          if (place.formatted_phone_number) {
            innerHTML += '<br>' + place.formatted_phone_number;
          }
          if (place.opening_hours) {
            innerHTML += '<br><br><strong>Hours:</strong><br>' +
                place.opening_hours.weekday_text[0] + '<br>' +
                place.opening_hours.weekday_text[1] + '<br>' +
                place.opening_hours.weekday_text[2] + '<br>' +
                place.opening_hours.weekday_text[3] + '<br>' +
                place.opening_hours.weekday_text[4] + '<br>' +
                place.opening_hours.weekday_text[5] + '<br>' +
                place.opening_hours.weekday_text[6];
          }
          if (place.photos) {
            innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                {maxHeight: 100, maxWidth: 200}) + '">';
          }
          innerHTML += '</div>';
          infowindow.setContent(innerHTML);
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      });
    }

    

//elevation request: https://maps.googleapis.com/maps/api/elevation/json?locations=34.213171,-118.571022&key=AIzaSyAMrVj6I_6cXo7DF5ienNCjvj1seozxvbU

//https://maps.googleapis.com/maps/api/distancematrix/json?origins=4800+el+camino+Real+los+Altos+CA&destinations=2465+Lathem+street+Mountain+View+CA&key=AIzaSyAMrVj6I_6cXo7DF5ienNCjvj1seozxvbU

//https://maps.googleapis.com/maps/api/directions/json?origin=florence,+italy&destination=milan,+italy&waypoints=optimize:true|genova,+italy|bologna,+italy&key=AIzaSyAMrVj6I_6cXo7DF5ienNCjvj1seozxvbU
//waypoints are not supported for the TRANSIT travel mode.

//https://maps.googleapis.com/maps/api/place/textsearch/json?query=%22pizzeria+la+cuccuma%22&key=AIzaSyAMrVj6I_6cXo7DF5ienNCjvj1seozxvbU

//https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJOSyPwPDGhkcRV5d-RP49H-w&key=AIzaSyAMrVj6I_6cXo7DF5ienNCjvj1seozxvbU

//https://maps.googleapis.com/maps/api/timezone/json?location=34.213171,-118.571022&timestamp=133176000&key=AIzaSyAMrVj6I_6cXo7DF5ienNCjvj1seozxvbU

//https://maps.googleapis.com/maps/api/timezone/json?location=51.5073509,-0.1277582999&timestamp=1459527992&key=AIzaSyAMrVj6I_6cXo7DF5ienNCjvj1seozxvbU