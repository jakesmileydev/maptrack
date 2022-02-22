"use strict";
const addMarker = document.querySelector(".btn--add-marker");

class App {
  #map;
  #mapEvent;
  #addingNewMarker;
  constructor() {
    this._getPosition();
    addMarker.addEventListener("click", this._toggleAddingNewMarker.bind(this));
    // this._loadMap();
  }
  _getPosition() {
    let coords;

    const options = {
      maximumAge: 0,
      enableHighAccuracy: true,
      timeout: 5000,
    };

    const success = function (position) {
      console.log("success...loading map");
      this._loadMap(position);
    };

    const failure = function (error) {
      console.log(`Failed to get position - ${error}`);
    };

    navigator.geolocation.getCurrentPosition(
      success.bind(this),
      failure,
      options
    );
  }

  _loadMap(position) {
    this.coords = [position.coords.latitude, position.coords.longitude];
    this.#map = L.map("map", { zoomControl: false }).setView(this.coords, 11);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    new L.control.zoom({ position: "topright" }).addTo(this.#map);

    // Not sure how to fix this...
    // Problem: Can't send event and bind this on _renderMarker at the same time.
    // Solution: Weird helper function below
    const markerHelper = function (e) {
      this._renderMarker(e);
    };
    this.#map.addEventListener("click", markerHelper.bind(this));
  }

  _toggleAddingNewMarker() {
    this.#addingNewMarker = !this.#addingNewMarker;
    console.log("addingNewMarker = " + this.#addingNewMarker);
    document.querySelector("#map").classList.toggle("adding-new-marker");
  }

  _renderMarker(event) {
    const myIcon = L.icon({
      iconUrl: "/lib/images/purple-pin.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
    const clickCoords = [event.latlng.lat, event.latlng.lng];

    if (this.#addingNewMarker) {
      L.marker(clickCoords, { icon: myIcon })
        .addTo(this.#map)
        .bindPopup("Another New Job")
        .openPopup();
      this.#addingNewMarker = false;
      document.querySelector("#map").classList.remove("adding-new-marker");
      // show new job form
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// get position

const app = new App();
