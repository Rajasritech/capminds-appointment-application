//Global Variable 
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
let idToDelete = null;
let currentEditingId = null;

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
  // This toggles the 'expanded' class on the sidebar
  sidebar.classList.toggle("expanded");

  // Optional: Change the icon direction based on state
  const icon = menuToggle.querySelector("img");
  if (sidebar.classList.contains("expanded")) {
    // You can swap the image source here if you have a "close" icon
    icon.src = "images/icons/material-symbols_navigate-next-close.png";
  } else {
    icon.src = "images/icons/material-symbols_navigate-next.png";
  }
});

// View switching logic
const navItems = document.querySelectorAll(".nav-item[data-target]");
const pageViews = document.querySelectorAll(".page-view");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Get the ID of the page we want to show 
    const targetPageId = item.getAttribute("data-target");

    // Remove active class from all sidebar items and add to clicked one
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    //  Hide all page views
    pageViews.forEach((view) => {
      view.style.display = "none";
    });

    // Show the specific page that was clicked
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) {
      targetPage.style.display = "block";
    }

    // this is for dashboard data load 
    if (targetPageId === "dashboard-view") {
      renderDashboard();
    }
    // this is for safe
    if (targetPageId === "calendar-view") {
      renderCalendar();
    }
  });
});

//For calendar get current year
let dt = new Date();

//calenderRender function
function renderCalendar() {
  
  //this to show current month in dropdown
  if (monthSelect) {
        monthSelect.value = dt.getMonth();
    }

    
  const grid = document.getElementById("calendar-days-grid");
  const dateText = document.querySelector(".date-text");

  // Load appointments from storage
  const savedApps = JSON.parse(localStorage.getItem("appointments")) || [];

  const year = dt.getFullYear();
  const month = dt.getMonth();

  //calculate next month
  const nextMonthDate = new Date(year, month + 1, 1);
  const nextMonthName = nextMonthDate.toLocaleString("default", {
    month: "long",
  });

  // Update the top date display
  const monthName = dt.toLocaleString("default", { month: "long" });
  dateText.innerText = `${monthName} ${dt.getDate()}, ${year}`;

  // Clear existing grid
  grid.innerHTML = "";

  // Calculation logic
  
  const lastDay = new Date(year, month + 1, 0).getDate();
   // 5 rows * 7 days
  const totalCells = 35; // 5 rows * 7 days

  //  Fill Current Month Days
  for (let i = 1; i <= lastDay; i++) {
    const cell = document.createElement("div");
    //this creates a div
    cell.className = "day-cell";

    //Create a date string (YYYY-MM-DD)
    const dateKey = `${year}-${(month + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;

    // Match the "Jan 1" style for the first day
    if (i === 1) {

      cell.innerHTML = `<span class="date-num"><strong>${monthName.substring(0, 3)} ${i}</strong></span>`;

    } else {
      cell.innerHTML = `<span class="date-num">${i}</span>`;
    }


    //Check if any appointments match this day
    const dayMatches = savedApps.filter((app) => app.date === dateKey);
    dayMatches.forEach((app, index) => {
      const apptDiv = document.createElement("div");
      const colorClasses = ["color-blue", "color-purple", "color-green", "color-orange", "color-pink", "color-teal"];
      const colorClass = colorClasses[index % colorClasses.length];
      apptDiv.className = `appointment-card arrived ${colorClass}`; 

      apptDiv.innerHTML = `
    <div class="appt-main">
        <img src="images/icons/ic_round-directions-walk.svg" class="appt-status-icon">
        <span class="appt-text">
            <strong>${app.patient}</strong> ${app.doctor} ${app.time}
        </span>
    </div>
    <div class="appt-actions">
        <img src="images/icons/ri_edit-2-line.svg" class="action-icon" onclick="editApp(${app.id})">
        <img src="images/icons/material-symbols_delete-outline-rounded.svg" class="action-icon" onclick="deleteAppointment(${app.id})">
        <img src="images/icons/material-symbols_note-add-outline-rounded.svg" onclick="viewAppDetails(${app.id})" class="action-icon">
    </div>
`;
      cell.appendChild(apptDiv);
    });

    //to send item to grid
    grid.appendChild(cell);
  }

  // Fill Next Month Padding
  const remainingCells = totalCells - grid.children.length;
  for (let j = 1; j <= remainingCells; j++) {
    const cell = document.createElement("div");
    //create a div
    cell.className = "day-cell next-month";

    //Also check appointments for next month's padding days
    const nextMonthDateStr = `${nextMonthDate.getFullYear()}-${(nextMonthDate.getMonth() + 1).toString().padStart(2, "0")}-${j.toString().padStart(2, "0")}`;
    const nextMonthMatches = savedApps.filter(
      (app) => app.date === nextMonthDateStr,
    );

    if (j === 1) {
      cell.innerHTML = `<span class="date-num muted"><strong>${nextMonthName.substring(0, 3)} ${j}</strong></span>`;
    } else {
      cell.innerHTML = `<span class="date-num muted">${j}</span>`;
    }
    //for appoint ment match
    nextMonthMatches.forEach((app, index) => {
      const apptDiv = document.createElement("div");
      const colorClasses = ["color-blue", "color-purple", "color-green", "color-orange", "color-pink", "color-teal"];
      const colorClass = colorClasses[index % colorClasses.length];
      apptDiv.className = `appointment-card ${colorClass}`;
      apptDiv.innerHTML = `<strong>${app.patient}</strong> <span>${app.time}</span>`;
      cell.appendChild(apptDiv);
    });
    grid.appendChild(cell);
  }
}

// Button Functions
function changeMonth(step) {
  dt.setMonth(dt.getMonth() + step);
  renderCalendar();
}

function goToday() {
  dt = new Date();

  renderCalendar();
}

// Connect buttons to functions
document.querySelectorAll(".ctrl-btn")[0].onclick = () => changeMonth(-1);
document.querySelectorAll(".ctrl-btn")[1].onclick = () => changeMonth(1);
document.querySelector(".btn-today").onclick = goToday;

//(January to December) in month dropdown
const monthSelect = document.getElementById('monthSelect');
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function initMonthDropdown() {
    monthSelect.innerHTML = ''; 
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index; 
        option.text = month;
        
        // Set the current month as the default selected option
        if (index === dt.getMonth()) {
            option.selected = true;
        }
        monthSelect.appendChild(option);
    });
}
//when month selected
monthSelect.onchange = function() {
    const selectedMonth = parseInt(this.value);
    dt.setMonth(selectedMonth); // Update our global date object
    renderCalendar(); // Redraw the grid
};

// Initialize
initMonthDropdown();
renderCalendar();

// appointment modal js
const appModal = document.getElementById("appointmentModal");
const openBtn = document.querySelector(".btn-appointment");
const closeBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

openBtn.onclick = () => {
  populateSelects();
  appModal.style.display = "flex";
};

const hideModal = () => {
  appModal.style.display = "none";
};

closeBtn.onclick = hideModal;
cancelBtn.onclick = hideModal;



// Appointments details

//Adding more data in select options using array
const doctorList = ["Dr. Madhu", "Dr. Lokesh", "Dr. Sadhana", "Dr. Vimal"];
const hospitalList = [
    "Apollo Hospitals, Chennai",
    "MIOT International, Chennai",
    "Christian Medical College (CMC), Vellore",
    "KMCH, Coimbatore",
    "Government General Hospital, Chennai",
    "Madurai Meenakshi Mission"
];
const specialtyList = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "General Medicine",
    "Pediatrics",
    "Dermatology"
];

// function to add
function populateSelects() {
    const selects = document.querySelectorAll('#appointmentForm select');
    fillDropdown(selects[0], "Select Doctor", doctorList);
    fillDropdown(selects[1], "Select Hospital", hospitalList);
    fillDropdown(selects[2], "Select Specialty", specialtyList);
}

// Reusable helper function
function fillDropdown(element, placeholder, dataArray) {
    if (!element) return;
    
    element.innerHTML = `<option selected disabled>${placeholder}</option>`;
    
    dataArray.forEach(item => {
        let opt = document.createElement('option');
        opt.value = item;
        opt.innerHTML = item;
        element.appendChild(opt);
    });
}

// We check localStorage first. if empty, we start with an empty array.
function saveToStorage(appointment) {
  
  let currentApps = JSON.parse(localStorage.getItem("appointments")) || [];
  currentApps.push(appointment);
  localStorage.setItem("appointments", JSON.stringify(currentApps));

  //  Update the global appointments variable if you're using one
  if (typeof appointments !== "undefined") {
    appointments = currentApps;
  }
}

const appointmentForm = document.getElementById("appointmentForm");
let toastTimer = null;

function showSuccessToast(message) {
  const toast = document.getElementById("appointmentSuccessToast");
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = "block";

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.display = "none";
  }, 2600);
}

// this is for time formet
function formatAMPM(time) {
  if (!time) return "";

  const trimmedTime = String(time).trim();
  const alreadyFormatted = trimmedTime.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);

  if (alreadyFormatted) {
    const [, hours, minutes, modifier] = alreadyFormatted;
    return `${parseInt(hours, 10)}:${minutes} ${modifier.toLowerCase()}`;
  }

  const timeMatch = trimmedTime.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (timeMatch) {
    const [, hours, minutes, modifier] = timeMatch;
    return `${parseInt(hours, 10)}:${minutes} ${modifier.toLowerCase()}`;
  }

  let [hours, minutes] = trimmedTime.split(":");
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
// Form Submission Handler
appointmentForm.onsubmit = function (e) {
  e.preventDefault(); 
  
  const selects = this.querySelectorAll("select");

  const patientName =document.getElementById('patientNameInput')
  const patient = patientName.value;
  const doctorName = selects[0].value;
  const hospital = selects[1].value;
  const specialty = selects[2].value;
  const selectedDate = document.getElementById("appointmentDate").value;
  const selectedHour = document.getElementById("appointmentTimeHour").value;
  const selectedMinute = document.getElementById("appointmentTimeMinute").value;
  const selectedMeridiem = document.getElementById("appointmentTimeMeridiem").value;
  const selectedTime = selectedHour && selectedMinute ? `${selectedHour}:${selectedMinute} ${selectedMeridiem}` : "";
  const reason = this.querySelector(".reason-box").value;

  console.log(patient);
  console.log(doctorName);
  console.log(hospital);
  console.log(specialty);
  // Check if defaults are still selected or if date/time are empty
  if (patient.trim() === "" || !selectedDate || !selectedTime) {
    alert("Please Enter a Patient, Date, and Time before saving.");
    return;
  }

  // Create Appointment Object
  const newAppointment = {
    id: Date.now(),
    patient: patient,
    doctor: doctorName,
    hospital: hospital,
    specialty: specialty,
    date: selectedDate,
    // Convert to 12hr format for the UI
    time: formatAMPM(selectedTime),
    reason: reason,
    status: "Arrived",
  };

  saveToStorage(newAppointment);
  this.reset();

  
  console.table(newAppointment);

  showSuccessToast("Appointment saved successfully!");
  hideModal();
  const navItems = document.querySelectorAll(".nav-item.active[data-target]");
  console.log(navItems);
  
  navItems.forEach((item) => {
    
    const targetPageId = item.getAttribute("data-target");

    
    if (targetPageId === "dashboard-view") {
      renderDashboard();
    }
    if (targetPageId === "calendar-view") {
      renderCalendar();
    }
  });

  
};




// Dashbord view
// Global function to show the dashboard
function renderDashboard() {
    const tableBody = document.getElementById('dashboard-body');
    const savedApps = JSON.parse(localStorage.getItem('appointments')) || [];
    let htmlContent = "";
   

    // Data Rows
   savedApps.forEach((app) => {
        htmlContent += `
            <tr>
                <td class="blue-link">${app.patient}</td>
                <td class="blue-link">${app.doctor}</td>
                <td>${app.hospital}</td>
                <td>${app.specialty}</td>
                <td>${app.date}</td>
                <td class="blue-link">${app.time}</td>
                <td>
                    <div class="action-cell">
                        <img src="images/icons/carbon_edit.svg" class="dash-icon" onclick="editApp(${app.id})">
                        <img src="images/icons/material-symbols_delete-outline.svg" class="dash-icon" onclick="deleteAppointment(${app.id})">
                    </div>
                </td>
            </tr>
            `;
    });


    // Empty Rows (Aligned perfectly)
     for (let i = savedApps.length; i < 7; i++) {
        htmlContent += `<tr><td colspan="7">&nbsp;</td></tr>`;
    }

    tableBody.innerHTML = htmlContent;
}


//Filter Section in dashboard
// Handle Patient Search
document.getElementById('patientSearch').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#dashboard-body tr:not(.empty-row)');
    
    rows.forEach(row => {
        const patientName = row.children[0].textContent.toLowerCase();
        row.style.display = patientName.includes(term) ? '' : 'none';
    });
});

// Handle Doctor Search
document.getElementById('doctorSearch').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#dashboard-body tr:not(.empty-row)');
    
    rows.forEach(row => {
        const doctorName = row.children[1].textContent.toLowerCase();
        row.style.display = doctorName.includes(term) ? '' : 'none';
    });
});

//Using Startdate and EndDate search
// Set current date as default on load
function initDateInputs() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    
    const formatted = `${day}/${month}/${year}`;
    document.getElementById('startDate').value = formatted;
    document.getElementById('endDate').value = formatted;
}

// Helper to convert DD/MM/YYYY text into a JS Date Object
function getDateFromText(text) {
    const parts = text.split('/');
    if (parts.length !== 3) return null;
    // Note: month is 0-indexed (Jan = 0)
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

// The Main Filter Function
function handleUpdateClick() {
    const startStr = document.getElementById('startDate').value;
    const endStr = document.getElementById('endDate').value;
    
    const startDate = getDateFromText(startStr);
    const endDate = getDateFromText(endStr);

    if (!startDate || !endDate) {
        alert("Please enter dates in DD/MM/YYYY format");
        return;
    }

    const rows = document.querySelectorAll('#dashboard-body tr');

    rows.forEach(row => {
        // Skip empty placeholder rows (Safety Check)
        if (!row.children[4] || row.children[4].textContent.trim() === "") return;

        // Get date from table (Assuming YYYY-MM-DD format in the 5th column)
        const rowDateText = row.children[4].textContent.trim();
        const rowDate = new Date(rowDateText);

        // Normalize all to midnight to compare only dates (not times)
        rowDate.setHours(0,0,0,0);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);

        // Toggle visibility
        if (rowDate >= startDate && rowDate <= endDate) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Attach to the Update Button
document.querySelector('.update-btn').addEventListener('click', handleUpdateClick);

// Initialize dates when script loads
initDateInputs();


//this for delete function


function deleteAppointment(id) {
    idToDelete = id;

    
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    const deleteModal = document.getElementById('deleteConfirmModal');

    deleteModal.style.display = 'flex';
}

document.getElementById('finalDeleteBtn').addEventListener('click', () => {
    if (idToDelete) {
        // Delete from data
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments = appointments.filter(app => app.id !== idToDelete);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Refresh the UI
        renderCalendar();
        renderDashboard();

        // Close the modal
        closeDeleteModal();
    }
});

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    idToDelete = null;
}

// 

//Edit appointment

//to fill available dropdown
function populateEditSelects() {
    const selects = document.querySelectorAll('#editForm select');

    //fill dropdown global resuable function
    fillDropdown(selects[0], "Select Hospital", hospitalList);
}

//convert from 12hrs to 24hrs function
function convertTo24Hour(time12h) {
    if (!time12h) return "";
    
    // Split "10:03" and "pm"
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier.toLowerCase() === 'pm') {
        hours = parseInt(hours, 10) + 12;
    }

    // Ensure it's two digits (e.g., "09:03")
    const finalHours = String(hours).padStart(2, '0');
    return `${finalHours}:${minutes}`;
}

//edit modal
function editApp(id) {
    currentEditingId = id;
    populateEditSelects()
    
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    const app = appointments.find(a => a.id === id);

    if (app) {
        populateEditSelects()
        document.getElementById('editPatientName').value = app.patient;
        document.getElementById('editHospital').value = app.hospital;
        document.getElementById('editAppDate').value = app.date;
        console.log(app.time)
        document.getElementById('editAppTime').value = convertTo24Hour(app.time);

        // Show the modal
        document.getElementById('editModal').style.display = 'flex';
    }
}
//Close function for editmodal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditingId = null;
}



document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Find the index of the appointment we are editing
    const index = appointments.findIndex(a => a.id === currentEditingId);

    if (index !== -1) {
        // Update the object in the array
        appointments[index] = {
            ...appointments[index], // Keep existing data (like ID)
            patient: document.getElementById('editPatientName').value,
            hospital: document.getElementById('editHospital').value,
            date: document.getElementById('editAppDate').value,
            time: formatAMPM(document.getElementById('editAppTime').value)
        };

        // Save updated array back to LocalStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Refresh the UI components
        
        if (typeof renderDashboard === 'function') renderDashboard();
      
        if (typeof renderCalendar === 'function') renderCalendar();
        
        closeEditModal();
    }
});



// For View Modal
function viewAppDetails(id) {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const app = appointments.find(a => a.id === id);

    if (app) {
        // Inject data into the View Modal
        document.getElementById('viewPatient').textContent = app.patient;
        document.getElementById('viewDoctor').textContent = app.doctor || "N/A";
        document.getElementById('viewHospital').textContent = app.hospital;
        document.getElementById('viewSpecialty').textContent = app.specialty || "General";
        
        // Show Date and formatted Time together
        const formattedTime = typeof formatAMPM === 'function' ? formatAMPM(app.time) : app.time;
        document.getElementById('viewDateTime').textContent = `${app.date} at ${formattedTime}`;
        
        document.getElementById('viewReason').textContent = app.reason || "No reason provided.";

        
       

        // Open the Modal
        document.getElementById('viewModal').style.display = 'flex';
    }
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}



//outside model click close function

window.onclick = (event) => {
  if (event.target == document.getElementById('viewModal')) {
   closeViewModal()
  }
  else if (event.target == appModal) {
    hideModal();
  }
  else if(event.target == document.getElementById('editModal')) {
   closeEditModal()
  }
  else if(event.target == document.getElementById('deleteConfirmModal')) {
   closeDeleteModal()
}
};