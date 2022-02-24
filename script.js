"use strict";

const addMarkerBtn = document.querySelector(".btn--add-marker");
const allJobs = document.querySelector(".all-jobs");
const jobSummary = document.querySelector(".job-summary");
const jobSummaryBackBtn = document.querySelector(".job-summary--back-btn");

const jobSummaryTitle = document.querySelector(".sidebar-title--job-summary");
const contactName = document.querySelector(".contact-name");
const contactPhone = document.querySelector(".contact-phone");
const contactEmail = document.querySelector(".contact-email");
const summaryId = document.querySelector(".summary-id");
const summaryDate = document.querySelector(".summary-date");

const jobFormCloseBtn = document.querySelector(".job-form--close-btn");
const jobs = document.querySelector(".jobs");
const jobForm = document.querySelector(".job-form");
const inputJobName = document.querySelector(".input--job-name");
const inputContact = document.querySelector(".input--contact");
const inputEmail = document.querySelector(".input--email");
const inputDetails = document.querySelector(".input--details");
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

class Task {
  constructor(description, quantity, rate, amount) {
    this.description = description;
    this.quantity = quantity;
    this.rate = rate;
    this.amount = amount;
  }
}

class Job {
  #tasks;
  //prettier-ignore
  constructor(id,name,contact,email,details,phone,coords,status,marker) {
    this.id = id;
    this.name = name;
    this.contact = contact;
    this.email = email;
    this.details = details;
    this.phone = phone;
    this.coords = coords;
    this.status = status;
    this.marker = marker;

    this.date = new Date();
    this.#tasks = new Array();
  }

  _pushTask(task) {
    this.#tasks.push(task);
  }
  _getTasks() {
    return this.#tasks;
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
  #currentJob;

  constructor() {
    this._getPosition();
    //prettier-ignore
    addMarkerBtn.addEventListener("click", this._toggleAddingNewMarker.bind(this));

    jobForm.addEventListener("submit", this._createNewJob.bind(this));

    this._renderAllJobs();

    jobs.addEventListener("click", this._openJobSummary.bind(this));
    //prettier-ignore
    jobSummaryBackBtn.addEventListener("click", this._closeJobSummary.bind(this));

    jobFormCloseBtn.addEventListener("click", this._closeJobForm.bind(this));

    newTask.addEventListener("click", this._addNewTask.bind(this));
  }

  _openTaskEdit() {
    newTaskBtnContainer.classList.add("adding-task");
    newTask.classList.add("adding-task");
    newTaskInputs.forEach((input) => {
      input.classList.add("adding-task");
    });
  }

  _closeTaskEdit() {
    newTaskBtnContainer.classList.remove("adding-task");
    newTask.classList.remove("adding-task");
    newTaskInputs.forEach((input) => {
      input.classList.remove("adding-task");
    });
  }
  _addNewTask(e) {
    if (this.#addingNewTask) {
      if (!e.target.closest(".new-task-btn")) return;
      console.log(newTaskDesc.value, newTaskQty.value, newTaskRate.value);
      if (!newTaskDesc.value || !newTaskQty.value || !newTaskRate.value) {
        alert("invalid task inputs");
        return;
      }
      // 1. create new task object
      const amount = (
        Number(newTaskQty.value) * Number(newTaskRate.value)
      ).toFixed(2);
      const task = new Task(
        newTaskDesc.value,
        newTaskQty.value,
        newTaskRate.value,
        amount
      );
      // 2. push task to an array of tasks in the job object
      this.#currentJob._pushTask(task);
      // 3. render new task on the list
      this._renderTask(task);
      // 4. clear form
      newTaskDesc.value = newTaskQty.value = newTaskRate.value = "";
      this._closeTaskEdit();
    }
    if (!this.#addingNewTask) {
      this._openTaskEdit();
      // 1. set focus to description input
      setTimeout(() => {
        newTaskDesc.focus();
      }, 100);
    }
    this.#addingNewTask = !this.#addingNewTask;
  }

  _closeJobForm(e) {
    jobForm.classList.remove("job-form--active");
    this.#fillingOutForm = false;

    // if this event was triggered by the close btn before creating a job, remove the marker
    if (!e) return;
    if (e.target === jobFormCloseBtn) {
      this.#map.removeLayer(this.#tempMarker);
    }
  }

  _openJobSummary(e) {
    console.log(e.target.closest(".job"));

    if (!e.target.closest(".job")) return;

    this.#currentJob = this.#jobs.find(
      (job) => job.id === Number(e.target.closest(".job").dataset.id)
    );
    const displayDate = `${
      months[this.#currentJob.date.getMonth()]
    } ${this.#currentJob.date.getDate()}, ${this.#currentJob.date.getFullYear()}`;
    jobSummaryTitle.textContent = this.#currentJob.name;
    summaryDate.textContent = displayDate;
    summaryId.textContent = this.#currentJob.id;
    contactName.textContent = this.#currentJob.contact;
    contactPhone.textContent = this.#currentJob.phone;
    contactEmail.textContent = this.#currentJob.email;

    // 1. if there are existing tasks
    if (this.#currentJob._getTasks().length > 0) {
      console.log(this.#currentJob._getTasks());
      // 2. render tasks
      this.#currentJob._getTasks().forEach((task) => this._renderTask(task));
    }

    allJobs.classList.add("all-jobs--hidden");
    jobSummary.classList.add("job-summary--active");
  }

  _renderTask(task) {
    const HTML = `
          <li class="task">
            <div class="task-description">${task.description}</div>
            <div class="task-qty">${Number(task.quantity)}</div>
            <div class="task-rate">${Number(task.rate).toFixed(2)}</div>
            <div class="task-amount">${task.amount}</div>
          </li>
          `;
    newTask.insertAdjacentHTML("beforebegin", HTML);
  }

  _closeJobSummary() {
    setTimeout(() => {
      document.querySelectorAll(".task").forEach((task) => task.remove());
      this._closeTaskEdit();
    }, 250);
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

    this.#map.addEventListener("click", this._handleMapClick.bind(this));
  }

  _toggleAddingNewMarker() {
    if (this.#fillingOutForm) return;

    this.#addingNewMarker = !this.#addingNewMarker;
    document.querySelector("#map").classList.toggle("adding-new-marker");
  }

  _handleMapClick(e) {
    const clickCoords = [e.latlng.lat, e.latlng.lng];
    if (this.#addingNewMarker && !this.#fillingOutForm) {
      this.#mapEvent = e;

      this._renderMarker(clickCoords);
      this._openJobForm();
    }
  }

  _renderMarker(clickCoords) {
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
  }

  _openJobForm() {
    jobForm.classList.add("job-form--active");
    this.#fillingOutForm = true;
    inputJobName.focus();
  }

  _createNewJob(e) {
    e.preventDefault();
    const id = Math.trunc(Math.random() * 1_000_000_000);
    if (
      !inputJobName.value ||
      !inputContact.value ||
      !inputEmail.value ||
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
      inputDetails.value,
      inputPhone.value,
      [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng],
      "active",
      this.#tempMarker
    );
    this.#jobs.push(newJob);
    this._renderJob(newJob);
    this._closeJobForm();
    this._clearJobForm();
  }

  _renderAllJobs() {
    // if there are any jobs
    //    for each job
    //      render job
  }

  _renderJob(job) {
    const HTML = `
    <li class="job" data-id="${job.id}">
      <div class="job-id">#${job.id}</div>
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

  _clearJobForm() {
    inputJobName.value =
      inputContact.value =
      inputEmail.value =
      inputDetails.value =
      inputPhone.value =
        "";
  }
}

const app = new App();
