let tasks = [];
let selectedTaskId = null;
let projectName = "Untitled Project";
const version = "v0.2.0";

// DOM REFS
const timeline = document.getElementById("timeline");
const editor = document.getElementById("editor");
const projectInput = document.getElementById("projectName");
const fileInput = document.getElementById("fileInput");

// INIT
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  document.getElementById("version").textContent = "GANTT2 " + version;
});

// TASK BUTTONS
document.getElementById("addPrimaryStart").onclick = () => {
  const newTask = createTask();
  const last = tasks[tasks.length - 1];
  if (last && last.start) newTask.start = last.start;
  tasks.push(newTask);
  renderTasks();
};

document.getElementById("addPrimaryEnd").onclick = () => {
  const newTask = createTask();
  const last = tasks[tasks.length - 1];
  if (last && last.end) newTask.start = last.end;
  tasks.push(newTask);
  renderTasks();
};

document.getElementById("addSub").onclick = () => {
  if (!selectedTaskId) return alert("Select a task first.");
  const parent = findTaskById(selectedTaskId);
  if (!parent) return;
  parent.subtasks.push({
    id: Date.now(),
    name: "Subtask",
    status: "future"
  });
  renderTasks();
};

document.getElementById("deleteTask").onclick = () => {
  if (!selectedTaskId) return alert("Select a task first.");
  if (!confirm("Delete this task and all its subtasks?")) return;
  tasks = tasks.filter(t => t.id !== selectedTaskId);
  selectedTaskId = null;
  renderTasks();
};

// TOGGLE EDITOR
document.getElementById("toggleEditor").onclick = () => {
  editor.style.display = editor.style.display === "none" ? "block" : "none";
};

// EXPORT / IMPORT
document.getElementById("exportBtn").onclick = () => {
  const name = prompt("Filename?", projectName || "ganttt2-project") || "ganttt2";
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
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
    tasks = JSON.parse(event.target.result);
    renderTasks();
  };
  reader.readAsText(file);
};

// PROJECT NAME BINDING
projectInput.oninput = (e) => {
  projectName = e.target.value;
};

// TASK EDITOR SAVE
document.getElementById("taskColor").onchange = e => {
  const colorInput = document.getElementById("customColor");
  colorInput.style.display = e.target.value === "custom" ? "block" : "none";
};

document.getElementById("saveTask").onclick = () => {
  const task = findTaskById(selectedTaskId);
  if (!task) return;

  task.name = document.getElementById("taskName").value;
  task.start = document.getElementById("taskStart").value;
  task.end = document.getElementById("taskEnd").value;
  task.status = document.getElementById("taskStatus").value;
  task.notes = document.getElementById("taskNotes").value;
  task.assigned = document.getElementById("taskAssigned").value;

  const dropdown = document.getElementById("taskColor").value;
  task.color = dropdown === "custom"
    ? document.getElementById("customColor").value
    : dropdown;

  task.fontColor = document.getElementById("taskFontColor").value;

  renderTasks();
};

function renderTasks() {
  timeline.innerHTML = "";
  if (tasks.length === 0) {
    timeline.innerHTML = "<p>No tasks yet. Click 'New Primary Task' to begin.</p>";
    return;
  }

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.style.backgroundColor = task.color || "#ddd";

    const fontColor = task.fontColor || getContrastColor(task.color);
    div.style.color = fontColor;

    const icon = getStatusIcon(task.status);
    div.innerHTML = `
      <div class="title">
        <span>${task.name}</span>
        <span class="status-icon">${icon}</span>
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
}

function clearEditor() {
  if (!selectedTaskId) {
    document.querySelectorAll("#editorContent input, #editorContent textarea").forEach(input => input.value = "");
    document.getElementById("customColor").style.display = "none";
  }
}

function createTask() {
  return {
    id: Date.now(),
    name: "New Task",
    start: null,
    end: null,
    status: "future",
    notes: "",
    assigned: "",
    color: "#F8961E",
    fontColor: "#000000",
    subtasks: []
  };
}

function findTaskById(id) {
  return tasks.find(t => t.id === id);
}

function isPresetColor(color) {
  return ["#F94144", "#F3722C", "#F8961E", "#F9844A", "#43AA8B", "#577590", "#9A5AFF", "#FF61C0"].includes(color);
}

function getContrastColor(hexColor) {
  if (!hexColor) return "#000000";
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
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
