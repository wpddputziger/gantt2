let tasks = [];
let selectedTaskId = null;

const timeline = document.getElementById("timeline");
const editor = document.getElementById("editorContent");

document.getElementById("newProject").onclick = () => {
  tasks = [];
  selectedTaskId = null;
  renderTasks();
};

document.getElementById("addPrimary").onclick = () => {
  const task = {
    id: Date.now(),
    name: "New Task",
    start: null,
    end: null,
    status: "Not Started",
    notes: "",
    assigned: "",
    color: "#ddd",
    subtasks: []
  };
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
    status: "Not Started"
  });
  renderTasks();
  selectTask(parent.id);
};

document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ganttt2-project.json";
  link.click();
};

document.getElementById("importBtn").onclick = () => {
  document.getElementById("fileInput").click();
};

document.getElementById("fileInput").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    tasks = JSON.parse(event.target.result);
    renderTasks();
  };
  reader.readAsText(file);
};

document.getElementById("taskColor").onchange = e => {
  const colorInput = document.getElementById("customColor");
  if (e.target.value === "custom") {
    colorInput.style.display = "block";
  } else {
    colorInput.style.display = "none";
  }
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

  const colorDropdown = document.getElementById("taskColor").value;
  if (colorDropdown === "custom") {
    task.color = document.getElementById("customColor").value;
  } else {
    task.color = colorDropdown;
  }

  renderTasks();
};

function renderTasks() {
  timeline.innerHTML = "";
  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.style.backgroundColor = task.color;
    div.innerHTML = `
      <div class="title">${task.name}</div>
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

  if (!["#F94144", "#F3722C", "#F8961E", "#F9844A", "#43AA8B", "#577590", "#9A5AFF", "#FF61C0"].includes(task.color)) {
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

function findTaskById(id) {
  return tasks.find(t => t.id === id);
}
