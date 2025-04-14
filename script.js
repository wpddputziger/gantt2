let tasks = [];
let selectedTaskId = null;
let selectedSubtask = null;
let projectName = "Untitled Project";
let editorTab = "project";

// INIT
document.addEventListener("DOMContentLoaded", () => {
  setupTabControls();
  renderTabs();
  renderTasks();
});

// === TAB LOGIC ===
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

// === PROJECT NAME HANDLING ===
document.getElementById("applyProjectName").onclick = () => {
  const newName = document.getElementById("projectNameField").value.trim();
  if (!newName) return alert("Project name cannot be empty.");
  projectName = newName;
  document.getElementById("projectName").value = newName;
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

// === RENDER TASKS
function renderTasks() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.style.backgroundColor = task.color || "#F8961E";
    div.style.color = "#000";
    div.style.marginBottom = "1rem";
    div.style.padding = "0.5rem";
    div.innerHTML = `<strong>${task.name}</strong> <span style="float:right">🕓</span>`;
    div.onclick = () => {
      selectedTaskId = task.id;
      selectedSubtask = null;
      editorTab = "task";
      renderTabs();
    };
    timeline.appendChild(div);
  });
}

// === RENDER TASK EDITOR
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

  renderTasks(); // re-render to show updated name/status
}

// === SUBTASK LOGIC PLACEHOLDER
function renderSubtaskEditor() {
  const container = document.getElementById("subtaskFields");
  container.innerHTML = `<p>Subtask editor coming soon...</p>`;
}

// === HELPERS
function findTaskById(id) {
  return tasks.find(t => t.id === id);
}
