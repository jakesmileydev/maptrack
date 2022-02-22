"use strict";

const addMarker = document.querySelector(".btn--add-marker");
///////////////////////////////////////////////////////////////////////////////////////////////////
// get position
let coords;
let addingNewMarker;
var map;

const options = {
  maximumAge: 0,
  enableHighAccuracy: true,
  timeout: 5000,
};

const success = function (position) {
  coords = [position.coords.latitude, position.coords.longitude];
  map = L.map("map", { zoomControl: false }).setView(coords, 11);

  let myIcon = L.icon({
    iconUrl: "/lib/images/purple-pin.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  L.marker(coords, { icon: myIcon })
    .addTo(map)
    .bindPopup("New Job")
    .openPopup();
  L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  new L.control.zoom({ position: "topright" }).addTo(map);

  map.on("click", function (e) {
    const clickCoords = [e.latlng.lat, e.latlng.lng];
    if (addingNewMarker) {
      L.marker(clickCoords, { icon: myIcon })
        .addTo(map)
        .bindPopup("Another New Job")
        .openPopup();
      addingNewMarker = false;
      document.querySelector("#map").classList.remove("adding-new-marker");
      // show new job form
    }
  });
};

const failure = function (error) {
  console.log(`Error ${error}`);
};

navigator.geolocation.getCurrentPosition(success, failure, options);

addMarker.addEventListener("click", function () {
  addingNewMarker = !addingNewMarker;
  console.log("addingNewMarker = " + addingNewMarker);
  document.querySelector("#map").classList.toggle("adding-new-marker");
});
