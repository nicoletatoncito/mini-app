const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const count = document.getElementById("count");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".chip");

const STORAGE_KEY = "miniapp_tasks_v1";

let tasks = loadTasks();
let currentFilter = "all";

render();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now(),
  });

  input.value = "";
  saveTasks();
  render();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

function toggleTask(id){
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  render();
}

function deleteTask(id){
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function getFilteredTasks(){
  if (currentFilter === "active") return tasks.filter(t => !t.completed);
  if (currentFilter === "completed") return tasks.filter(t => t.completed);
  return tasks;
}

function render(){
  const visible = getFilteredTasks();

  list.innerHTML = visible.map(t => `
    <li class="item ${t.completed ? "completed" : ""}">
      <div class="left">
        <input class="check" type="checkbox" ${t.completed ? "checked" : ""} data-action="toggle" data-id="${t.id}" />
        <span class="text" title="${escapeHtml(t.text)}">${escapeHtml(t.text)}</span>
      </div>
      <button class="icon-btn" type="button" data-action="delete" data-id="${t.id}" aria-label="Delete task">Delete</button>
    </li>
  `).join("");

  const total = tasks.length;
  count.textContent = total.toString();

  list.querySelectorAll("[data-action]").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const action = el.dataset.action;
      if (action === "toggle") toggleTask(id);
      if (action === "delete") deleteTask(id);
    });
  });
}

function saveTasks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}

function escapeHtml(str){
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
