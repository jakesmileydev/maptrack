"use strict";
const addMarkerBtn = document.querySelector(".btn--add-marker");
const jobForm = document.querySelector(".job-form");
const inputJobName = document.querySelector(".input--job-name");
const inputContact = document.querySelector(".input--contact");
const inputEmail = document.querySelector(".input--email");
const inputDescription = document.querySelector(".input--description");
const inputRate = document.querySelector(".input--rate");

class Job {
  constructor(id, name, contact, email, description, rate, coords, status) {
    this.id = id;
    this.name = name;
    this.contact = contact;
    this.email = email;
    this.description = description;
    this.rate = rate;
    this.coords = coords;
    this.status = status;
  }
}

class App {
  #map;
  #mapEvent;
  #addingNewMarker;
  #fillingOutForm;
  #jobs = [];
  constructor() {
    this._getPosition();
    addMarkerBtn.addEventListener(
      "click",
      this._toggleAddingNewMarker.bind(this)
    );
    jobForm.addEventListener("submit", this._createNewJob.bind(this));
    this._renderAllJobs();
  }

  _getPosition() {
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

    this.#map.addEventListener("click", this._handleClick.bind(this));
  }

  _toggleAddingNewMarker() {
    if (this.#fillingOutForm) return;

    this.#addingNewMarker = !this.#addingNewMarker;
    console.log("addingNewMarker = " + this.#addingNewMarker);
    document.querySelector("#map").classList.toggle("adding-new-marker");
  }

  _handleClick(e) {
    const clickCoords = [e.latlng.lat, e.latlng.lng];
    if (this.#addingNewMarker && !this.#fillingOutForm) {
      this.#mapEvent = e;

      this._renderMarker(clickCoords);
      this._toggleJobForm();
    }
  }

  _renderMarker = function (clickCoords) {
    const myIcon = L.icon({
      iconUrl: "/lib/images/purple-pin.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    L.marker(clickCoords, { icon: myIcon })
      .addTo(this.#map)
      .bindPopup("Another New Job")
      .openPopup();

    this.#addingNewMarker = false;
    document.querySelector("#map").classList.remove("adding-new-marker");
  };

  _toggleJobForm() {
    jobForm.classList.toggle("job-form--active");
    this.#fillingOutForm = !this.#fillingOutForm;
    if (this.#fillingOutForm) inputJobName.focus();
  }

  _createNewJob(e) {
    e.preventDefault();
    const id = Math.trunc(Math.random() * 1_000_000_000_000);
    const newJob = new Job(
      id,
      inputJobName.value,
      inputContact.value,
      inputEmail.value,
      inputDescription.value,
      inputRate.value,
      [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng],
      "created"
    );
    this.#jobs.push(newJob);
    renderJob(newJob);
    this._toggleJobForm();
    this._clearForm();
    console.log(this.#jobs);
  }
  _renderAllJobs() {
    // if there are any jobs
    //    for each job
    //    render job
  }
  _renderJob() {
    // create an html element with current earned money, job name, date created
  }
  _clearForm() {
    inputJobName.value =
      inputContact.value =
      inputEmail.value =
      inputDescription.value =
      inputRate.value =
        "";
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// get position

const app = new App();
