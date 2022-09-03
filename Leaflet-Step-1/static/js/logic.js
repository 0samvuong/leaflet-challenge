// sam vuong week 17 homework
// json source https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson
// 	"USGS All Earthquakes, Past Week"

// ************************************************************
// CODE MOSTLY BASED ON lesson activity 10 - thanks
// ***************************************************


// function to create colour of circles and scale

function earthquakeColour(data) {
    switch (true) {
    case data >= 5:
        return "#800000";
    case data >= 4:
         return "#DC143C";
    case data >= 3:
        return "#FF8C00";
    case data >= 2:
        return "#FFD700";
    case data >= 1:
        return "#FFFF00";
    default:
        return "#00FF00";
    }
  }

  // function to create radius of circle based on magnitude data
  function earthquakeSize(data){
    return data * 5
  }


// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }


  // code to make circles
  function pointToLayer(feature, latlng) {
    return new L.CircleMarker(latlng, {
        radius: earthquakeSize(feature.properties.mag), 
        color: earthquakeColour(feature.properties.mag),
        fillOpacity: 0.5
        })
    }   

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  // also run pointToLayer function for every data, which will create a circle based on it's mag
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
        37.8, -96
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// Set up the legend
// mostly based on https://leafletjs.com/examples/choropleth/
// edited css file, code taken from website above
var legend = L.control({ position: "bottomright" });
legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5],
        labels = [];

    div.innerHTML += "<b> Scale </b> <br>";
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + earthquakeColour(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

}