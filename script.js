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
  setupTabControls();
  setupButtons();
  setupSettings();
  renderTabs();
  renderTasks();
});

// === BUTTON SETUP ===
function setupButtons() {
  document.getElementById("newProject").onclick = () => {
    if (!confirm("Start a new project? Unsaved data will be lost.")) return;
    projectName = "Untitled Project";
    tasks = [];
    selectedTaskId = null;
    selectedSubtask = null;
    colorIndex = 0;
    renderTabs();
    renderTasks();
  };

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

  document.getElementById("deleteTaskFromEditor").onclick = () => {
    if (selectedTaskId && confirm("Delete this task from editor?")) {
      tasks = tasks.filter(t => t.id !== selectedTaskId);
      selectedTaskId = null;
      selectedSubtask = null;
      editorTab = "project";
      renderTabs();
      renderTasks();
    }
  };

  // Footer timeline buttons (placeholders)
  document.getElementById("zoomIn").onclick = () => alert("Zoom feature coming soon");
  document.getElementById("fitWidth").onclick = () => alert("Fit Width feature coming soon");
  document.getElementById("collapseAll").onclick = () => alert("Collapse feature coming soon");
  document.getElementById("expandAll").onclick = () => alert("Expand feature coming soon");
}

function setupSettings() {
  const toggle = document.getElementById("autoColorToggle");
  if (toggle) {
    toggle.checked = true;
    toggle.onchange = e => autoColorEnabled = e.target.checked;
  }
}

// === TABS
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

  document.getElementById("openTimelineSettings").onclick = () => {
    editorTab = "timeline";
    renderTabs();
  };
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

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

// === PROJECT NAME
document.getElementById("applyProjectName").onclick = () => {
  const name = document.getElementById("projectNameField").value.trim();
  if (!name) return alert("Name can't be empty.");
  projectName = name;
  document.getElementById("projectName").value = name;
  showToast("✔ Project name updated.");
};

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

// === TASKS
function renderTasks() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.style.backgroundColor = task.color || "#F8961E";
    div.style.color = "#000";
    div.style.padding = "0.5rem";
    div.style.marginBottom = "1rem";
    div.style.cursor = "pointer";
    div.style.borderRadius = "6px";
    div.style.boxShadow = task.id === selectedTaskId
      ? "0 0 0 3px rgba(0,0,0,0.3)"
      : "none";

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${task.name}</strong>
        ${task.subtasks?.length ? `<span style="font-size: 1.2em;">▾</span>` : ""}
      </div>
      <div style="font-size:0.9em;margin-top:0.2rem;">🕓 ${task.start} → ${task.end}</div>
      ${task.subtasks?.length ? `<div style="font-size:0.85em;margin-top:0.5rem;">${task.subtasks.length} subtask(s)</div>` : ""}
    `;

    div.onclick = () => {
      selectedTaskId = task.id;
      selectedSubtask = null;
      editorTab = "task";
      renderTabs();
    };

    timeline.appendChild(div);
  });
}

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

  document.getElementById("taskName").oninput = e => task.name = e.target.value;
  document.getElementById("taskStart").onchange = e => task.start = e.target.value;
  document.getElementById("taskEnd").onchange = e => task.end = e.target.value;
  document.getElementById("taskStatus").onchange = e => task.status = e.target.value;
  document.getElementById("taskNotes").oninput = e => task.notes = e.target.value;
  document.getElementById("taskAssigned").oninput = e => task.assigned = e.target.value;

  renderTasks();
}

function renderSubtaskEditor() {
  const container = document.getElementById("subtaskFields");
  container.innerHTML = `<p>Subtask editor coming soon...</p>`;
}

function createTask() {
  const today = new Date().toISOString().split("T")[0];
  const color = autoColorEnabled ? getNextColor() : "#F8961E";
  return {
    id: Date.now(),
    name: "New Task",
    start: today,
    end: addDays(today, defaultDuration),
    status: "future",
    notes: "",
    assigned: "",
    color,
    subtasks: []
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
