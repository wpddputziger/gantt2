let tasks = [];
let selectedTaskId = null;
let selectedSubtask = null;
let projectName = "Untitled Project";
let editorTab = "project";
let defaultDuration = 3;
let autoColorEnabled = true;
let colorIndex = 0;
const taskColors = ["#F8961E", "#577590", "#43AA8B", "#9A5AFF", "#F94144", "#F3722C"];

document.addEventListener("DOMContentLoaded", () => {

  const editor = document.getElementById("editor");

  // Force show + spacing
  editor.style.display = "block";
  editor.style.visibility = "visible";
  editor.style.height = "auto";
  editor.style.minHeight = "400px";

  // Force reflow (browser visual update)
  editor.getBoundingClientRect();
  
  setupTabControls();
  setupButtons();
  setupSettings();
  renderTabs();
  renderTasks();


});

// === BUTTON SETUP ===
function setupButtons() {
document.getElementById("applyProjectName").onclick = () => {
  projectName = document.getElementById("projectNameField").value;
  document.getElementById("projectTitle").textContent = projectName;
};

    if (!confirm("Start a new project? Unsaved data will be lost.")) return;
    projectName = "Untitled Project";
    tasks = [];
    selectedTaskId = null;
    selectedSubtask = null;
    colorIndex = 0;
    document.getElementById("projectTitle").textContent = projectName;
    renderTabs();
    renderTasks();
  };


  document.getElementById("importBtn").onclick = () => document.getElementById("fileInput").click();
  document.getElementById("fileInput").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const data = JSON.parse(event.target.result);
      tasks = data.tasks || [];
projectName = data.meta?.projectName || "Untitled Project";

document.getElementById("projectTitle").textContent = projectName;
      renderTasks();
      renderTabs();
    };
    reader.readAsText(file);
  };

  document.getElementById("exportBtn").onclick = () => {
    const blob = new Blob([JSON.stringify({ meta: { projectName }, tasks }, null, 2)], {
      type: "application/json"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName.replace(/\s+/g, "_")}.json`;
    link.click();
  };

  document.getElementById("toggleEditor").onclick = () => {
    const editor = document.getElementById("editor");
    editor.style.display = editor.style.display === "none" ? "block" : "none";
  };

document.getElementById("editor").style.display = "block";
  
  document.getElementById("addPrimaryStart").onclick = () => {
    const task = createTask();
    const last = tasks[tasks.length - 1];
    if (last?.start) task.start = last.start;
    task.end = addDays(task.start, defaultDuration);
    tasks.push(task);
    renderTasks();
  };

document.getElementById("addPrimaryEnd").onclick = () => {
  const task = createTask();
  const last = tasks[tasks.length - 1];
  const base = last?.end || new Date().toISOString().split("T")[0];
  task.start = base;
  task.end = addDays(task.start, defaultDuration);
  tasks.push(task);
  renderTasks();
};

  document.getElementById("addSub").onclick = () => {
    if (!selectedTaskId) return alert("Select a task first.");
    const parent = findTaskById(selectedTaskId);
    const sub = {
      id: Date.now(),
      name: "New Subtask",
      start: parent.start,
      end: addDays(parent.start, 2),
      status: "future",
      assigned: ""
    };
    parent.subtasks.push(sub);
    selectedSubtask = sub;
    editorTab = "subtask";
    renderTabs();
    renderTasks();
  };

  document.getElementById("deleteTask").onclick = () => {
    if (!selectedTaskId) return;
    if (confirm("Delete this task and its subtasks?")) {
      tasks = tasks.filter(t => t.id !== selectedTaskId);
      selectedTaskId = null;
      selectedSubtask = null;
      renderTabs();
      renderTasks();
    }
  };

  document.getElementById("zoomIn").onclick = () => alert("Zoom feature coming soon");
  document.getElementById("fitWidth").onclick = () => alert("Fit Width feature coming soon");
  document.getElementById("collapseAll").onclick = () => {
    tasks.forEach(t => t.expanded = false);
    renderTasks();
  };
  document.getElementById("expandAll").onclick = () => {
    tasks.forEach(t => t.expanded = true);
    renderTasks();
  };
}

// === SETTINGS ===
function setupSettings() {
  const toggle = document.getElementById("autoColorToggle");
  if (toggle) {
    toggle.checked = true;
    toggle.onchange = e => autoColorEnabled = e.target.checked;
  }

  const durationField = document.getElementById("defaultDuration");
  if (durationField) {
    durationField.onchange = e => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) defaultDuration = val;
    };
  }
}

// === TABS ===
function setupTabControls() {
  const tabs = ["project", "task", "subtask", "timeline"];
  tabs.forEach(tab => {
    const btn = document.getElementById("tab" + capitalize(tab));
    btn.onclick = () => {
      if (btn.classList.contains("disabled")) return;
      editorTab = tab;
      renderTabs();
    };
  });


}

function renderTabs() {
  const tabMap = {
    project: "panelProject",
    task: "panelTask",
    subtask: "panelSubtask",
    timeline: "panelTimeline"
  };

  for (let key in tabMap) {
    const panel = document.getElementById(tabMap[key]);
    const btn = document.getElementById("tab" + capitalize(key));
    const isActive = editorTab === key;

    panel.classList.toggle("hidden", !isActive);
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("disabled", !canAccessTab(key));
  }

  if (editorTab === "task") renderTaskEditor();
  if (editorTab === "subtask") renderSubtaskEditor();
}

function canAccessTab(tab) {
  switch (tab) {
    case "project": return true;
    case "task": return !!selectedTaskId;
    case "subtask": return !!selectedSubtask;
    case "timeline": return !!projectName;
    default: return false;
  }
}

// === RENDER TASKS ===
function renderTasks() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";


if (!tasks.length) return;

const projectStart = tasks[0].start;
const wrapper = document.createElement("div");
wrapper.style.position = "relative";
wrapper.style.minHeight = "600px";
wrapper.style.width = "3000px";

tasks.forEach((task, i) => {
  const div = document.createElement("div");
  const projectStart = task[0].start;
  div.className = "task";
  div.style.backgroundColor = task.color || "#F8961E";
  div.style.color = getContrastColor(task.color);
  div.style.padding = "0.5rem";
  div.style.borderRadius = "6px";
  div.style.boxShadow = task.id === selectedTaskId ? "0 0 0 3px rgba(0,0,0,0.3)" : "none";
  div.style.position = "absolute";
  div.style.top = `${i * 80}px`; // space vertically
  div.style.left = dateToOffset(task.start, projectStart) + "px";

  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <strong>${task.name}</strong>
      ${task.subtasks?.length ? `<span style="font-size: 1.2em; cursor:pointer;" onclick="toggleSubtasks(${task.id}); event.stopPropagation();">▾</span>` : ""}
    </div>
    <div style="font-size:0.9em;margin-top:0.2rem;">🕓 ${task.start} → ${task.end}</div>
    ${task.expanded !== false && task.subtasks?.length ? task.subtasks.map(st => `<div class="subtask" style="margin-left: 1rem; font-size: 0.85em; margin-top: 0.3rem;">- ${st.name}</div>`).join("") : ""}
  `;

  div.onclick = () => {
    selectedTaskId = task.id;
    selectedSubtask = null;
    editorTab = "task";
    renderTabs();
  };

  wrapper.appendChild(div);
});

timeline.appendChild(wrapper);
}

    // Horizontal visual offset for stair-step look



function toggleSubtasks(taskId) {
  const task = findTaskById(taskId);
  task.expanded = !task.expanded;
  renderTasks();
}

// === EDITORS ===
function renderTaskEditor() {
  const container = document.getElementById("taskFields");
  const task = findTaskById(selectedTaskId);
  if (!task) return container.innerHTML = "<p>No task selected.</p>";

  container.innerHTML = `
    <label>Name: <input id="taskName" type="text" value="${task.name}" /></label>
    <label>Start: <input id="taskStart" type="date" value="${task.start}" /></label>
    <label>End: <input id="taskEnd" type="date" value="${task.end}" /></label>
    <label>Status:
      <select id="taskStatus">
        <option value="future">Future</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="complete">Complete</option>
      </select>
    </label>
    <label>Notes: <textarea id="taskNotes">${task.notes}</textarea></label>
    <label>Assigned To: <input id="taskAssigned" type="text" value="${task.assigned}" /></label>
  `;

  document.getElementById("applyTaskChanges").onclick = () => {
    task.name = document.getElementById("taskName").value;
    task.start = document.getElementById("taskStart").value;
    task.end = document.getElementById("taskEnd").value;
    task.status = document.getElementById("taskStatus").value;
    task.notes = document.getElementById("taskNotes").value;
    task.assigned = document.getElementById("taskAssigned").value;
    renderTasks();
    showToast("✅ Task updated");
  };
}

function renderSubtaskEditor() {
  const container = document.getElementById("subtaskFields");
  if (!selectedSubtask) return container.innerHTML = "<p>No subtask selected.</p>";

  container.innerHTML = `
    <label>Name: <input type="text" id="subName" value="${selectedSubtask.name}" /></label>
    <label>Start: <input type="date" id="subStart" value="${selectedSubtask.start}" /></label>
    <label>End: <input type="date" id="subEnd" value="${selectedSubtask.end}" /></label>
    <label>Status: 
      <select id="subStatus">
        <option value="future">Future</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="complete">Complete</option>
      </select>
    </label>
    <label>Assigned To: <input type="text" id="subAssigned" value="${selectedSubtask.assigned}" /></label>
  `;

  document.getElementById("applySubtaskChanges").onclick = () => {
    selectedSubtask.name = document.getElementById("subName").value;
    selectedSubtask.start = document.getElementById("subStart").value;
    selectedSubtask.end = document.getElementById("subEnd").value;
    selectedSubtask.status = document.getElementById("subStatus").value;
    selectedSubtask.assigned = document.getElementById("subAssigned").value;
    renderTasks();
    showToast("✅ Subtask updated");
  };

  document.getElementById("deleteSubtask").onclick = () => {
    const parent = findTaskById(selectedTaskId);
    parent.subtasks = parent.subtasks.filter(s => s.id !== selectedSubtask.id);
    selectedSubtask = null;
    renderTabs();
    renderTasks();
    showToast("🗑️ Subtask deleted");
  };
}

// === HELPERS ===
function createTask() {
  const today = new Date().toISOString().split("T")[0];
  const color = autoColorEnabled ? getNextColor() : "#F8961E";
  return {
    id: Date.now(),
    name: "New Task",
    start: start,
    end: addDays(today, defaultDuration),
    status: "future",
    notes: "",
    assigned: "",
    color,
    subtasks: [],
    expanded: true
  };
}

function getNextColor() {
  const color = taskColors[colorIndex % taskColors.length];
  colorIndex++;
  return color;
}

function findTaskById(id) {
  return tasks.find(t => t.id === id);
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function getContrastColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function showToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "10px";
  toast.style.right = "10px";
  toast.style.background = "#4caf50";
  toast.style.color = "white";
  toast.style.padding = "0.5rem 1rem";
  toast.style.borderRadius = "6px";
  toast.style.zIndex = "9999";
  document.body.appendChild(toast);
  setTimeout(() => document.body.removeChild(toast), 2000);
}


let zoomLevel = 20; // px per day

function dateToOffset(startDate, baseDate) {
  const start = new Date(startDate);
  const base = new Date(baseDate);
  const diffDays = Math.floor((start - base) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays * zoomLevel);
}
