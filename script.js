let tasks = [];
let selectedTaskId = null;
let projectName = "Untitled Project";
let defaultDuration = 3;
let settingsVisible = false;

const timeline = document.getElementById("timeline");
const editor = document.getElementById("editor");
const fileInput = document.getElementById("fileInput");
const projectInput = document.getElementById("projectName");
const settingsPanel = document.getElementById("timelineSettingsPanel");

// Init: disable name input
projectInput.disabled = true;

// Project Setup
document.getElementById("newProject").onclick = () => {
  tasks = [];
  selectedTaskId = null;
  projectName = prompt("Enter project name:", "Untitled Project") || "Untitled Project";
  projectInput.value = projectName;
  projectInput.disabled = false;
  renderTasks();
};

// Set project name as user types
projectInput.oninput = e => projectName = e.target.value;

// Add Tasks
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
  if (last?.end) task.start = last.end;
  task.end = addDays(task.start, defaultDuration);
  tasks.push(task);
  renderTasks();
};

document.getElementById("addSub").onclick = () => {
  if (!selectedTaskId) return alert("Select a task first.");
  const parent = findTaskById(selectedTaskId);
  if (!parent) return;
  parent.subtasks.push({
    id: Date.now(),
    name: "Subtask",
    status: "future",
    start: parent.start,
    end: addDays(parent.start, 2)
  });
  renderTasks();
};

document.getElementById("deleteTask").onclick = () => {
  if (!selectedTaskId) return alert("Select a task first.");
  if (!confirm("Delete selected task?")) return;
  tasks = tasks.filter(t => t.id !== selectedTaskId);
  selectedTaskId = null;
  renderTasks();
};

// Export/Import
document.getElementById("exportBtn").onclick = () => {
  const name = prompt("Filename?", projectName) || "ganttt2";
  const blob = new Blob([JSON.stringify({ meta: { projectName }, tasks }, null, 2)], {
    type: "application/json"
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name + ".json";
  link.click();
};

document.getElementById("importBtn").onclick = () => fileInput.click();
fileInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    const data = JSON.parse(event.target.result);
    tasks = data.tasks || [];
    projectName = data.meta?.projectName || "Untitled Project";
    projectInput.value = projectName;
    projectInput.disabled = false;
    renderTasks();
  };
  reader.readAsText(file);
};

// Toggle editor panel
document.getElementById("toggleEditor").onclick = () => {
  editor.style.display = editor.style.display === "none" ? "block" : "none";
};

// Timeline settings toggle
document.getElementById("openTimelineSettings").onclick = () => {
  settingsVisible = !settingsVisible;
  settingsPanel.classList.toggle("hidden", !settingsVisible);
};

document.getElementById("closeSettings").onclick = () => {
  settingsVisible = false;
  settingsPanel.classList.add("hidden");
};

// Timeline settings handlers
document.getElementById("defaultDuration").onchange = e => {
  defaultDuration = parseInt(e.target.value, 10) || 1;
};

document.getElementById("timelineBgColor").onchange = e => {
  document.getElementById("timeline").style.backgroundColor = e.target.value;
};

// Save Task
document.getElementById("taskColor").onchange = e => {
  document.getElementById("customColor").style.display = e.target.value === "custom" ? "block" : "none";
  applyLiveColor();
};
document.getElementById("customColor").onchange = applyLiveColor;
document.getElementById("taskFontColor").onchange = applyLiveColor;

function applyLiveColor() {
  const task = findTaskById(selectedTaskId);
  if (!task) return;
  const bg = getCurrentBgColor();
  const font = document.getElementById("taskFontColor").value;
  const div = [...document.querySelectorAll(".task")].find(d => d.dataset.id == selectedTaskId);
  if (div) {
    div.style.backgroundColor = bg;
    div.style.color = font;
  }
}

document.getElementById("saveTask").onclick = () => {
  const task = findTaskById(selectedTaskId);
  if (!task) return;

  task.name = document.getElementById("taskName").value;
  task.start = document.getElementById("taskStart").value;
  task.end = document.getElementById("taskEnd").value;
  task.status = document.getElementById("taskStatus").value;
  task.notes = document.getElementById("taskNotes").value;
  task.assigned = document.getElementById("taskAssigned").value;
  task.color = getCurrentBgColor();
  task.fontColor = document.getElementById("taskFontColor").value;

  renderTasks();
};

function getCurrentBgColor() {
  const dropdown = document.getElementById("taskColor").value;
  return dropdown === "custom"
    ? document.getElementById("customColor").value
    : dropdown;
}

function renderTasks() {
  timeline.innerHTML = "";
  if (!tasks.length) {
    timeline.innerHTML = "<p>No tasks yet. Click 'New Project' to begin.</p>";
    return;
  }

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.dataset.id = task.id;
    div.style.backgroundColor = task.color || "#ddd";
    div.style.color = task.fontColor || getContrastColor(task.color);
    if (task.id === selectedTaskId) div.classList.add("selected");

    div.innerHTML = `
      <div class="title">
        <span>${task.name}</span>
        <span class="status-icon">${getStatusIcon(task.status)}</span>
      </div>
      <div class="subtasks">
        ${task.subtasks.map(st => `<div class="subtask">${st.name}</div>`).join("")}
      </div>
    `;
    div.onclick = () => selectTask(task.id);
    timeline.appendChild(div);
  });

  clearEditor();
}

function selectTask(id) {
  selectedTaskId = id;
  const task = findTaskById(id);
  if (!task) return;

  document.getElementById("taskName").value = task.name;
  document.getElementById("taskStart").value = task.start || "";
  document.getElementById("taskEnd").value = task.end || "";
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskNotes").value = task.notes;
  document.getElementById("taskAssigned").value = task.assigned;
  document.getElementById("taskColor").value = task.color;
  document.getElementById("customColor").value = task.color;
  document.getElementById("taskFontColor").value = task.fontColor || getContrastColor(task.color);

  if (!isPresetColor(task.color)) {
    document.getElementById("taskColor").value = "custom";
    document.getElementById("customColor").style.display = "block";
  }

  renderTasks();
}

function clearEditor() {
  if (!selectedTaskId) {
    document.querySelectorAll("#editorContent input, #editorContent textarea").forEach(input => input.value = "");
    document.getElementById("customColor").style.display = "none";
  }
}

function findTaskById(id) {
  return tasks.find(t => t.id === id);
}

function createTask() {
  const today = new Date().toISOString().split("T")[0];
  return {
    id: Date.now(),
    name: "New Task",
    start: today,
    end: addDays(today, defaultDuration),
    status: "future",
    notes: "",
    assigned: "",
    color: "#F8961E",
    fontColor: "#000000",
    subtasks: []
  };
}

function getStatusIcon(status) {
  switch (status) {
    case "future": return "🕓";
    case "active": return "🚀";
    case "paused": return "⏸️";
    case "complete": return "✅";
    default: return "❓";
  }
}

function addDays(start, days) {
  const d = new Date(start);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isPresetColor(color) {
  return ["#F94144", "#F3722C", "#F8961E", "#F9844A", "#43AA8B", "#577590", "#9A5AFF", "#FF61C0"].includes(color);
}

function getContrastColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
}
