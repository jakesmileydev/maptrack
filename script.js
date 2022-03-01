"use strict";

const sidebar = document.querySelector(".sidebar");
const addMarkerBtn = document.querySelector(".btn--add-marker");
const allJobs = document.querySelector(".all-jobs");
const jobSummary = document.querySelector(".job-summary");
const jobSummaryBackBtn = document.querySelector(".job-summary--back-btn");

const jobSummaryTitle = document.querySelector(".sidebar-title--job-summary");
const jobSummaryTaskBtns = document.querySelector(".job-summary-task-btns");
const contactName = document.querySelector(".contact-name");
const contactPhone = document.querySelector(".contact-phone");
const contactEmail = document.querySelector(".contact-email");
const summaryDetails = document.querySelector(".job-summary--details");
const summaryId = document.querySelector(".summary-id");
const summaryDate = document.querySelector(".summary-date");

const jobFormCloseBtn = document.querySelector(".job-form--close-btn");
const jobs = document.querySelector(".jobs");
const jobForm = document.querySelector(".job-form");
const inputJobName = document.querySelector(".input--job-name");
const inputImage = document.querySelector(".input--image");
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

const totalAmount = document.querySelector(".total-amount");
const paidAmount = document.querySelector(".paid-amount");
const balanceAmount = document.querySelector(".balance-amount");
const sidebarBtns = document.querySelector(".sidebar-buttons");
const sidebarBtnsDelete = document.querySelector(".sidebar-buttons-delete");
const sidebarBtnsView = document.querySelector(".sidebar-buttons-view");
// prettier-ignore
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class Task {
  #isSelected;
  #isEditing;
  constructor(id, description, quantity, rate, amount) {
    this.id = id;
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
  _getSelectedStatus() {
    return this.#isSelected;
  }
  _startEditing() {
    this.#isEditing = true;
  }
  _stopEditing() {
    this.#isEditing = false;
  }
  _getEditStatus() {
    return this.#isEditing;
  }
}

class Job {
  #total;
  #totalPaid;
  #isSelected;
  #tasks = [];
  //prettier-ignore
  constructor(id,name,contact,email,imageURL,details,phone,coords,status,marker) {
    this.id = id;
    this.name = name;
    this.contact = contact;
    this.email = email;
    this.imageURL = imageURL;
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
  _removeTask(taskId) {
    const taskIndex = this.#tasks.findIndex((task) => task.id === taskId);
    this.#tasks.splice(taskIndex, 1);
  }
  _getTasks() {
    return this.#tasks;
  }
  _setTotal() {
    let total = 0;
    this.#tasks.forEach((task) => {
      total += Number(task.amount);
    });
    this.#total = total;
  }
  _getTotal() {
    return this.#total;
  }
  _updatePopupTotal() {
    console.log(this.id);

    let popupArray = Array.from(document.querySelectorAll(".popup-total"));
    console.log(popupArray);

    console.log(popupArray.forEach((popup) => console.log(popup.dataset.id)));
  }
  _displayTotals() {
    this._updatePopupTotal();
    totalAmount.textContent = this._getTotal().toFixed(2);
    balanceAmount.textContent = this._getTotal().toFixed(2);
  }
  _markSelected() {
    this.#isSelected = true;
  }
  _markUnselected() {
    this.#isSelected = false;
  }
  _getSelectedStatus() {
    return this.#isSelected;
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
    // jobs.addEventListener("click", this._selectJob.bind(this));
    //prettier-ignore
    jobSummaryBackBtn.addEventListener("click", this._closeJobSummary.bind(this));
    jobFormCloseBtn.addEventListener("click", this._closeJobForm.bind(this));
    addTaskBtn.addEventListener("click", this._openTaskCreation);
    editTaskBtn.addEventListener("click", this._openEditTask.bind(this));
    tasks.addEventListener("click", this._handleEditing.bind(this));
    deleteTaskBtn.addEventListener("click", this._deleteTask.bind(this));
    cancelNewTaskBtn.addEventListener("click", this._closeTaskCreation);
    submitNewTaskBtn.addEventListener("click", this._createNewTask.bind(this));
    sidebar.addEventListener("click", this._select.bind(this));
    sidebarBtnsView.addEventListener("click", this._openJobSummary.bind(this));
    sidebarBtnsDelete.addEventListener("click", this._deleteJob.bind(this));
  }
  _deleteJob() {
    const isSelected = (job) => job._getSelectedStatus() === true;
    this.#map.removeLayer(this.#jobs.find(isSelected).marker);
    this.#jobs.splice(this.#jobs.findIndex(isSelected), 1);
    document.querySelector(".job.selected").remove();
    console.log(this.#jobs);
  }
  _select(e) {
    this._selectJob(e);
    this._selectTask(e);
  }
  _selectJob(e) {
    if (!e.target.closest(".job")) {
      sidebarBtns.classList.remove("visible");

      this._deselectJobs();
      return;
    }

    const thisJobEl = e.target.closest(".job");
    const thisJobOb = this.#jobs.find(
      (job) => job.id === Number(thisJobEl.dataset.id)
    );

    if (!thisJobOb._getSelectedStatus()) {
      this._deselectJobs();
      thisJobEl.classList.add("selected");
      thisJobOb._markSelected();
      sidebarBtns.classList.add("visible");
      this.#map.flyTo(thisJobOb.coords, 11, {
        animate: true,
      });
    } else {
      thisJobEl.classList.remove("selected");
      sidebarBtns.classList.remove("visible");
      thisJobOb._markUnselected();
    }
  }
  _deselectJobs() {
    jobs.querySelectorAll(".job").forEach((job) => {
      job.classList.remove("selected");
    });
    this.#jobs?.forEach((job) => job._markUnselected());
  }
  _handleEditing(e) {
    if (
      !e.target.closest(".submit-new-task-btn.editing-task") &&
      !e.target.closest(".cancel-new-task-btn.editing-task")
    )
      return;
    const selectedTaskEl = document.querySelector(".task.selected");

    const thisTaskArray = this.#currentJob._getTasks();
    const thisTask = thisTaskArray.find(
      (task) => task.id === +selectedTaskEl.dataset.id
    );
    const closeEdit = function () {
      selectedTaskEl.querySelector(".new-task.editing-task").remove();

      selectedTaskEl.querySelector(".task-description").style.display = "block";
      selectedTaskEl.querySelector(".task-qty").style.display = "block";
      selectedTaskEl.querySelector(".task-rate").style.display = "block";
      selectedTaskEl.querySelector(".task-amount").style.display = "block";

      thisTask._stopEditing();
    };
    if (e.target.closest(".submit-new-task-btn.editing-task")) {
      selectedTaskEl.querySelector(".task-description").textContent =
        thisTask.description = selectedTaskEl.querySelector(
          ".new-task-input--description.editing-task"
        ).value;

      selectedTaskEl.querySelector(".task-qty").textContent =
        thisTask.quantity = selectedTaskEl.querySelector(
          ".new-task-input--qty.editing-task"
        ).value;

      selectedTaskEl.querySelector(".task-rate").textContent = thisTask.rate =
        selectedTaskEl.querySelector(
          ".new-task-input--rate.editing-task"
        ).value;

      selectedTaskEl.querySelector(".task-amount").textContent =
        thisTask.amount = (
          Number(thisTask.quantity) * Number(thisTask.rate)
        ).toFixed(2);

      this.#currentJob._setTotal();
      this.#currentJob._displayTotals();
      closeEdit();
      console.log(this.#currentJob._getTasks());
    }
    if (e.target.closest(".cancel-new-task-btn.editing-task")) {
      console.log(this.#currentJob._getTasks());

      closeEdit();
    }
  }
  _openEditTask() {
    // if no task is selected, don't do anything
    const thisTaskArray = this.#currentJob._getTasks();
    if (!thisTaskArray.find((task) => task._getSelectedStatus() === true))
      return;

    //    find selected element
    const selectedTaskEl = document.querySelector(".task.selected");

    //    find selected task in #currentJob.#tasks
    const thisTask = thisTaskArray.find(
      (task) => task.id === +selectedTaskEl.dataset.id
    );
    // if this task is already editing, don't do anything
    if (thisTask._getEditStatus()) return;

    const HTML = `
        <li class="new-task editing-task">
          <input
            type="text"
            class="new-task-input new-task-input--description editing-task"
          />
          <input
            type="number"
            step=".01"
            class="new-task-input new-task-input--qty editing-task"
          />
          <input
            type="number"
            step=".01"
            class="new-task-input new-task-input--rate editing-task"
          />
          <div class="editing-task-btns editing-task">
            <button class="submit-new-task-btn editing-task">+</button>
            <button class="cancel-new-task-btn editing-task">x</button>
          </div>
        </li>
      `;

    thisTask._startEditing();
    selectedTaskEl.insertAdjacentHTML("afterbegin", HTML);
    selectedTaskEl.querySelector(".task-description").style.display = "none";
    selectedTaskEl.querySelector(".task-qty").style.display = "none";
    selectedTaskEl.querySelector(".task-rate").style.display = "none";
    selectedTaskEl.querySelector(".task-amount").style.display = "none";
    selectedTaskEl.querySelector(
      ".new-task-input--description.editing-task"
    ).value = thisTask.description;
    selectedTaskEl.querySelector(".new-task-input--qty.editing-task").value =
      thisTask.quantity;
    selectedTaskEl.querySelector(".new-task-input--rate.editing-task").value =
      thisTask.rate;
    selectedTaskEl.querySelector(".new-task-input--description").focus();
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

    this.#map.addLayer(this.#tempMarker);

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

      // close job summary, deselect jobs, and hide sidebar buttons
      this._deselectJobs();
      sidebarBtns.classList.remove("visible");
      this._closeJobSummary();
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
  _closeJobForm(e) {
    jobForm.classList.remove("job-form--active");
    this.#fillingOutForm = false;
    this._clearJobForm();
    // if this event was triggered by the close btn (before creating a job), then remove the marker
    if (!e) return;
    if (e.target === jobFormCloseBtn) {
      this.#map.removeLayer(this.#tempMarker);
    }
  }

  _createNewJob(e) {
    e.preventDefault();
    const id = Math.trunc(Math.random() * 1_000_000_000);
    if (
      !inputJobName.value ||
      !inputContact.value ||
      !inputEmail.value ||
      !inputPhone.value ||
      !inputImage.value
    ) {
      alert("Invalid Form Submission, please verify data");
      return;
    }

    const src = URL.createObjectURL(e.target[5].files[0]);

    this.#tempMarker
      .bindPopup(
        L.popup({
          autoClose: false,
          offset: [0, -4],
          maxWidth: 500,
          minWidth: 250,
          closeOnClick: false,
          className: `job-popup`,
        })
      )
      .setPopupContent(
        `
      <img class="job-image" src="${src}">
      <div class="popup-info">
        <h4 class ="popup-name">${inputJobName.value}</h4>
        <div class="popup-total" dataset-id="${id}">$0.00</div>
      </div>
      `
      )
      .openPopup();
    const newJob = new Job(
      id,
      inputJobName.value,
      inputContact.value,
      inputEmail.value,
      src,
      inputDetails.value,
      inputPhone.value,
      [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng],
      "active",
      this.#tempMarker
    );
    this.#map.flyTo(newJob.coords);
    this.#jobs.push(newJob);
    this._renderJob(newJob);
    this._closeJobForm();
    this._clearJobForm();
    console.log(this.#jobs);
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
    jobs.insertAdjacentHTML("beforeend", HTML);
  }
  _renderAllJobs() {
    // if there are any jobs
    //    for each job
    //      render job
  }

  _clearJobForm() {
    inputJobName.value =
      inputContact.value =
      inputEmail.value =
      inputDetails.value =
      inputPhone.value =
      inputImage.value =
        "";
  }

  // Job Summary and Tasks
  _openJobSummary(e) {
    this.#currentJob = this.#jobs.find(
      (job) => job._getSelectedStatus() === true
    );

    jobSummaryTitle.textContent = this.#currentJob.name;
    summaryDate.textContent = `${
      months[this.#currentJob.date.getMonth()]
    } ${this.#currentJob.date.getDate()}, ${this.#currentJob.date.getFullYear()}`;
    summaryId.textContent = this.#currentJob.id;
    // document.querySelector(".job-image").src = this.#currentJob.imageURL;
    contactName.textContent = this.#currentJob.contact;
    contactPhone.textContent = this.#currentJob.phone;
    contactEmail.textContent = this.#currentJob.email;
    summaryDetails.textContent = this.#currentJob.details
      ? this.#currentJob.details
      : "(none)";
    this.#currentJob._displayTotals();

    // 1. if there are existing tasks
    if (this.#currentJob._getTasks().length > 0) {
      console.log(this.#currentJob._getTasks());
      // 2. render tasks
      this.#currentJob._getTasks().forEach((task) => this._renderTask(task));
    } else {
    }

    allJobs.classList.add("all-jobs--hidden");
    jobSummaryTaskBtns.classList.add("job-summary-task-btns--visible");
    jobSummary.classList.add("job-summary--active");
  }
  _closeJobSummary() {
    this.#currentJob = false;
    allJobs.classList.remove("all-jobs--hidden");
    jobSummary.classList.remove("job-summary--active");
    jobSummaryTaskBtns.classList.remove("job-summary-task-btns--visible");
    setTimeout(() => {
      document.querySelectorAll(".task").forEach((task) => task.remove());
      this._closeTaskCreation();
    }, 250);
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
    const id = Math.trunc(Math.random() * 1_000_000_000);
    const task = new Task(
      id,
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

    this._closeTaskCreation();
  }
  _renderTask(task) {
    const HTML = `
          <li class="task" data-id="${task.id}">
            <div class="task-description">${task.description}</div>
            <div class="task-qty">${Number(task.quantity)}</div>
            <div class="task-rate">${Number(task.rate)}</div>
            <div class="task-amount">${Number(task.amount).toFixed(2)}</div>
          </li>
          `;
    newTask.insertAdjacentHTML("beforebegin", HTML);
  }
  _selectTask(e) {
    if (
      // if the job summary is not open, then no currentJob value exists, don't do anything
      !this.#currentJob ||
      // if editing a task, disable selection
      this.#currentJob
        ._getTasks()
        .some((task) => task._getEditStatus() === true)
    )
      return;

    if (
      e.target.closest(".edit-task-btn") ||
      e.target.closest(".delete-task-btn")
    )
      return;
    if (!e.target.closest(".task")) {
      this._deselectTasks();
      return;
    }

    const thisTaskEl = e.target.closest(".task");
    const thisTaskOb = this.#currentJob
      ._getTasks()
      .find((task) => task.id === Number(e.target.closest(".task").dataset.id));

    if (!thisTaskOb._getSelectedStatus()) {
      this._deselectTasks();
      thisTaskEl.classList.add("selected");
      thisTaskOb._markSelected();
    } else {
      thisTaskEl.classList.remove("selected");
      thisTaskOb._markUnselected();
    }
  }
  _deselectTasks() {
    tasks.querySelectorAll(".task").forEach((task) => {
      task.classList.remove("selected");
    });
    this.#currentJob._getTasks()?.forEach((task) => task._markUnselected());
  }
  _deleteTask() {
    const thisTaskArray = this.#currentJob._getTasks();
    if (!thisTaskArray.find((task) => task._getSelectedStatus() === true))
      return;
    const taskId = thisTaskArray.find(
      (task) => task._getSelectedStatus() === true
    ).id;
    const selectedTaskEl = document.querySelector(".task.selected");

    // 1. remove task from the UI
    selectedTaskEl.remove();
    // 2. delete task data from the #tasks array in the #currentJob object

    this.#currentJob._removeTask(taskId);
    // 3. update totals
    this.#currentJob._setTotal();
    this.#currentJob._displayTotals();
    console.log(thisTaskArray);
  }
  _openTaskCreation() {
    newTask.classList.add("adding-task");
    newTaskDesc.focus();
  }
  _closeTaskCreation() {
    newTaskDesc.value = newTaskQty.value = newTaskRate.value = "";
    newTask.classList.remove("adding-task");
  }
}

const app = new App();
