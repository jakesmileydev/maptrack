"use strict";
const addMarkerBtn = document.querySelector(".btn--add-marker");
const allJobs = document.querySelector(".all-jobs");
const jobSummary = document.querySelector(".job-summary");
const jobSummaryBackBtn = document.querySelector(".job-summary--back-btn");
const jobFormCloseBtn = document.querySelector(".job-form--close-btn");
const jobs = document.querySelector(".jobs");
const jobForm = document.querySelector(".job-form");
const inputJobName = document.querySelector(".input--job-name");
const inputContact = document.querySelector(".input--contact");
const inputEmail = document.querySelector(".input--email");
const inputDescription = document.querySelector(".input--description");
const inputPhone = document.querySelector(".input--phone");
const newTask = document.querySelector(".new-task");
const newTaskBtn = document.querySelector(".new-task-btn");
const newTaskBtnContainer = document.querySelector(".new-task-btn-container");
const newTaskDesc = document.querySelector(".new-task-input--description");
const newTaskQty = document.querySelector(".new-task-input--qty");
const newTaskRate = document.querySelector(".new-task-input--rate");
const newTaskInputs = document.querySelectorAll(".new-task-input");
// prettier-ignore
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class Job {
  constructor(
    id,
    name,
    contact,
    email,
    description,
    phone,
    coords,
    status,
    marker
  ) {
    this.id = id;
    this.name = name;
    this.contact = contact;
    this.email = email;
    this.description = description;
    this.phone = phone;
    this.coords = coords;
    this.status = status;
    this.marker = marker;
    this.earnings = 0;
    this.date = new Date();
  }
}

class App {
  #map;
  #mapEvent;
  #addingNewMarker;
  #fillingOutForm;
  #addingNewTask;
  #tempMarker;
  #jobs = [];

  constructor() {
    this._getPosition();
    addMarkerBtn.addEventListener(
      "click",
      this._toggleAddingNewMarker.bind(this)
    );
    jobForm.addEventListener("submit", this._createNewJob.bind(this));
    this._renderAllJobs();
    jobs.addEventListener("click", this._openJobSummary.bind(this));
    jobSummaryBackBtn.addEventListener(
      "click",
      this._closeJobSummary.bind(this)
    );
    jobFormCloseBtn.addEventListener("click", this._closeForm.bind(this));

    newTask.addEventListener("click", this._addNewTask.bind(this));
  }
  _addNewTask(e) {
    if (!e.target.closest(".new-task-btn")) return;
    console.log(this.#addingNewTask);
    const toggleAddingClasses = function () {
      newTaskBtnContainer.classList.toggle("adding");
      newTaskInputs.forEach((input) => {
        input.classList.toggle("adding-task");
      });
    };
    if (this.#addingNewTask) {
      console.log(newTaskDesc.value, newTaskQty.value, newTaskRate.value);
      // create new task item
      console.log("create new task item and push to object");
      newTaskBtnContainer.classList.remove("adding");
      newTaskInputs.forEach((input) => {
        input.classList.remove("adding-task");
      });
      this.#addingNewTask = false;
    }
    if (!this.#addingNewTask) {
      newTaskBtnContainer.classList.remove("adding");
      newTaskInputs.forEach((input) => {
        input.classList.remove("adding-task");
      });
      this.#addingNewTask = true;
    }
  }
  _closeForm() {
    this.#map.removeLayer(this.#tempMarker);
    jobForm.classList.toggle("job-form--active");
    this.#fillingOutForm = false;
  }
  _openJobSummary(e) {
    const thisJob = this.#jobs.find(
      (job) => (job.id = e.target.closest(".job").dataset.id)
    );

    allJobs.classList.add("all-jobs--hidden");
    // update job summary

    jobSummary.classList.add("job-summary--active");
  }
  _closeJobSummary() {
    allJobs.classList.remove("all-jobs--hidden");
    jobSummary.classList.remove("job-summary--active");
  }

  _getPosition() {
    const success = function (position) {
      this._loadMap(position);
    };

    const failure = function (error) {
      console.log(`Failed to get position - ${error}`);
    };

    const options = {
      maximumAge: 0,
      enableHighAccuracy: true,
      timeout: 5000,
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

    this.#tempMarker = L.marker(clickCoords, { icon: myIcon });

    this.#map.addLayer(
      this.#tempMarker.bindPopup("creating new job...").openPopup()
    );

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
    const id = Math.trunc(Math.random() * 1_000_000_000);
    if (
      !inputJobName.value ||
      !inputContact.value ||
      !inputEmail.value ||
      !inputDescription.value ||
      !inputPhone.value
    ) {
      alert("Invalid Form Submission, please verify data");
      return;
    }

    const newJob = new Job(
      id,
      inputJobName.value,
      inputContact.value,
      inputEmail.value,
      inputDescription.value,
      inputPhone.value,
      [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng],
      "active",
      this.#tempMarker
    );
    this.#jobs.push(newJob);
    this._renderJob(newJob);
    this._toggleJobForm();
    this._clearForm();
    console.log(this.#jobs);
  }
  _renderAllJobs() {
    // if there are any jobs
    //    for each job
    //      render job
  }
  _renderJob(job) {
    const HTML = `
    <li class="job" data-id="${job.id}">
      <div class="job-earnings">$${job.earnings.toFixed(2)}</div>
      <div class="job-name">${job.name}</div>
      <div class="job-date">${
        months[job.date.getMonth()]
      } ${job.date.getDate()}</div>
      <div class="job-chevron">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
          <rect width="256" height="256" fill="none"></rect>
          <polyline points="96 48 176 128 96 208" fill="none" stroke="#808080" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline>
         </svg>
      </div>
    </li>
    `;
    jobs.insertAdjacentHTML("afterbegin", HTML);
  }
  _clearForm() {
    inputJobName.value =
      inputContact.value =
      inputEmail.value =
      inputDescription.value =
      inputPhone.value =
        "";
  }
}

const app = new App();
