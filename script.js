let tasks = [];
let selectedTaskId = null;
let selectedSubtask = null;
let projectName = "Untitled Project";
let editorTab = "project";

// INIT
document.addEventListener("DOMContentLoaded", () => {
  setupTabControls();
  renderTabs();
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

  // Hide/show panels
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

// === TAB AVAILABILITY ===
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

// === DYNAMIC RENDERING FOR TASK/SUBTASK FIELDS ===
function renderTaskEditor() {
  const container = document.getElementById("taskFields");
  const task = findTaskById(selectedTaskId);
  if (!task) return container.innerHTML = "<p>No task selected.</p>";

  container.innerHTML = `
    <label>Name: <input type="text" value="${task.name}" /></label>
    <label>Start: <input type="date" value="${task.start}" /></label>
    <label>End: <input type="date" value="${task.end}" /></label>
    <label>Status:
      <select>
        <option ${task.status === "future" ? "selected" : ""}>future</option>
        <option ${task.status === "active" ? "selected" : ""}>active</option>
        <option ${task.status === "paused" ? "selected" : ""}>paused</option>
        <option ${task.status === "complete" ? "selected" : ""}>complete</option>
      </select>
    </label>
    <label>Notes: <textarea>${task.notes}</textarea></label>
    <label>Assigned To: <input type="text" value="${task.assigned}" /></label>
  `;
}

function renderSubtaskEditor() {
  const container = document.getElementById("subtaskFields");
  const sub = selectedSubtask;
  if (!sub) return container.innerHTML = "<p>No subtask selected.</p>";

  container.innerHTML = `
    <label>Name: <input type="text" value="${sub.name}" /></label>
    <label>Start: <input type="date" value="${sub.start}" /></label>
    <label>End: <input type="date" value="${sub.end}" /></label>
    <label>Status:
      <select>
        <option ${sub.status === "future" ? "selected" : ""}>future</option>
        <option ${sub.status === "active" ? "selected" : ""}>active</option>
        <option ${sub.status === "paused" ? "selected" : ""}>paused</option>
        <option ${sub.status === "complete" ? "selected" : ""}>complete</option>
      </select>
    </label>
    <label>Assigned To: <input type="text" value="${sub.assigned || ""}" /></label>
  `;
}

// === DUMMY HELPERS FOR NEXT PHASE ===
function findTaskById(id) {
  return tasks.find(t => t.id === id);
}
