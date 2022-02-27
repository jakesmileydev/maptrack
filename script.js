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
const tasks = document.querySelector(".tasks");

const newTask = document.querySelector(".new-task");
const addTaskBtn = document.querySelector(".add-task-btn");
const editTaskBtn = document.querySelector(".edit-task-btn");
const deleteTaskBtn = document.querySelector(".delete-task-btn");
const submitNewTaskBtn = document.querySelector(".submit-new-task-btn");
const cancelNewTaskBtn = document.querySelector(".cancel-new-task-btn");
const newTaskBtnContainer = document.querySelector(".job-summary-btns");
const newTaskDesc = document.querySelector(".new-task-input--description");
const newTaskQty = document.querySelector(".new-task-input--qty");
const newTaskRate = document.querySelector(".new-task-input--rate");
const newTaskInputs = document.querySelectorAll(".new-task-input");

const totalAmount = document.querySelector(".total-amount");
const paidAmount = document.querySelector(".paid-amount");
const balanceAmount = document.querySelector(".balance-amount");
// prettier-ignore
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class Task {
  #isSelected;
  constructor(index, description, quantity, rate, amount) {
    this.index = index;
    this.description = description;
    this.quantity = quantity;
    this.rate = rate;
    this.amount = Number(amount);
  }
  _markSelected() {
    this.#isSelected = true;
  }
  _markUnselected() {
    this.#isSelected = false;
  }
}

class Job {
  #total;
  #totalPaid;
  #tasks = [];
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
    this.#total = 0;
  }

  _pushTask(task) {
    this.#tasks.push(task);
  }
  _getTasks() {
    return this.#tasks;
  }

  _setTotal() {
    let total = 0;
    this.#tasks.forEach((task) => {
      total += task.amount;
    });
    this.#total = total;
  }
  _getTotal() {
    return this.#total;
  }
  _displayTotals() {
    totalAmount.textContent = this._getTotal().toFixed(2);
    balanceAmount.textContent = this._getTotal().toFixed(2);
  }
}

class App {
  #map;
  #mapEvent;
  #addingNewMarker;
  #fillingOutForm;
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

    addTaskBtn.addEventListener("click", this._openTaskCreation);
    deleteTaskBtn.addEventListener("click", this._deleteTask);
    cancelNewTaskBtn.addEventListener("click", this._closeTaskCreation);
    submitNewTaskBtn.addEventListener("click", this._createNewTask.bind(this));
    tasks.addEventListener("click", this._selectTask.bind(this));
  }

  _selectTask(e) {
    if (!e.target.closest(".task")) return;
    const thisTaskEl = e.target.closest(".task");
    tasks.querySelectorAll(".task").forEach((task) => {
      task.classList.remove("selected");
    });
    this.#currentJob._getTasks().forEach((task) => task._markUnselected());
    thisTaskEl.classList.add("selected");

    const thisTaskOb = this.#currentJob
      ._getTasks()
      .find(
        (task) => task.index === Number(e.target.closest(".task").dataset.index)
      );

    thisTaskOb._markSelected();
    console.log(this.#jobs);
  }
  // Map
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

  // Jobs
  _handleMapClick(e) {
    const clickCoords = [e.latlng.lat, e.latlng.lng];
    if (this.#addingNewMarker && !this.#fillingOutForm) {
      this.#mapEvent = e;

      this._renderMarker(clickCoords);
      this._openJobForm();
    }
  }
  _toggleAddingNewMarker() {
    if (this.#fillingOutForm) return;

    this.#addingNewMarker = !this.#addingNewMarker;
    document.querySelector("#map").classList.toggle("adding-new-marker");
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
  _renderAllJobs() {
    // if there are any jobs
    //    for each job
    //      render job
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
  _clearJobForm() {
    inputJobName.value =
      inputContact.value =
      inputEmail.value =
      inputDetails.value =
      inputPhone.value =
        "";
  }

  // Job Summary and Tasks
  _openJobSummary(e) {
    if (!e.target.closest(".job")) return;

    this.#currentJob = this.#jobs.find(
      (job) => job.id === Number(e.target.closest(".job").dataset.id)
    );

    jobSummaryTitle.textContent = this.#currentJob.name;
    summaryDate.textContent = `${
      months[this.#currentJob.date.getMonth()]
    } ${this.#currentJob.date.getDate()}, ${this.#currentJob.date.getFullYear()}`;
    summaryId.textContent = this.#currentJob.id;
    contactName.textContent = this.#currentJob.contact;
    contactPhone.textContent = this.#currentJob.phone;
    contactEmail.textContent = this.#currentJob.email;
    this.#currentJob._displayTotals();

    // 1. if there are existing tasks
    if (this.#currentJob._getTasks().length > 0) {
      console.log(this.#currentJob._getTasks());
      // 2. render tasks
      this.#currentJob._getTasks().forEach((task) => this._renderTask(task));
    }

    allJobs.classList.add("all-jobs--hidden");
    jobSummary.classList.add("job-summary--active");
  }
  _createNewTask() {
    if (!newTaskDesc.value || !newTaskQty.value || !newTaskRate.value) {
      alert("invalid task inputs");
      return;
    }
    // 1. create new task object
    const amount = (
      Number(newTaskQty.value) * Number(newTaskRate.value)
    ).toFixed(2);
    const index = this.#currentJob._getTasks().length;
    const task = new Task(
      index,
      newTaskDesc.value,
      newTaskQty.value,
      newTaskRate.value,
      Number(amount)
    );

    // 2a. push task to the tasks array in the job object
    this.#currentJob._pushTask(task);

    // 2b. updateTotal
    this.#currentJob._setTotal();
    this.#currentJob._displayTotals();
    // 3. render new task on the list
    this._renderTask(task);
    // 4. clear form
    newTaskDesc.value = newTaskQty.value = newTaskRate.value = "";
    this._closeTaskCreation();
  }
  _renderTask(task) {
    const HTML = `
          <li class="task" data-index="${task.index}">
            <div class="task-description">${task.description}</div>
            <div class="task-qty">${Number(task.quantity)}</div>
            <div class="task-rate">${Number(task.rate).toFixed(2)}</div>
            <div class="task-amount">${Number(task.amount).toFixed(2)}</div>
          </li>
          `;
    newTask.insertAdjacentHTML("beforebegin", HTML);
  }
  _deleteTask() {}
  _openTaskCreation() {
    newTask.classList.add("adding-task");
    newTaskDesc.focus();
  }
  _closeTaskCreation() {
    newTask.classList.remove("adding-task");
  }
  _closeJobSummary() {
    setTimeout(() => {
      document.querySelectorAll(".task").forEach((task) => task.remove());
      this._closeTaskCreation();
    }, 250);
    allJobs.classList.remove("all-jobs--hidden");
    jobSummary.classList.remove("job-summary--active");
  }
}

const app = new App();
