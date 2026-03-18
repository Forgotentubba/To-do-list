const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const emptyState = document.getElementById("emptyState");
const themeToggle = document.getElementById("themeToggle");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "todas";
let currentSearch = "";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveTheme(theme) {
  localStorage.setItem("theme", theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  totalCount.textContent = total;
  pendingCount.textContent = pending;
  completedCount.textContent = completed;
}

function getPriorityLabel(priority) {
  if (priority === "alta") return "Alta";
  if (priority === "media") return "Média";
  return "Baixa";
}

function filteredTasks() {
  return tasks.filter((task) => {
    const matchesFilter =
      currentFilter === "todas" ||
      (currentFilter === "pendentes" && !task.completed) ||
      (currentFilter === "concluidas" && task.completed);

    const matchesSearch = task.text
      .toLowerCase()
      .includes(currentSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = filteredTasks();

  emptyState.style.display = visibleTasks.length === 0 ? "block" : "none";

  visibleTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.completed ? "checked" : ""} />
        <div class="task-content ${task.completed ? "completed" : ""}">
          <h3>${task.text}</h3>
          <p>Criada em ${task.createdAt}</p>
          <span class="badge priority-${task.priority}">
            Prioridade ${getPriorityLabel(task.priority)}
          </span>
        </div>
      </div>
      <div class="task-actions">
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Excluir</button>
      </div>
    `;

    const checkbox = li.querySelector('input[type="checkbox"]');
    const editBtn = li.querySelector(".edit-btn");
    const deleteBtn = li.querySelector(".delete-btn");

    checkbox.addEventListener("change", () => toggleTask(task.id));
    editBtn.addEventListener("click", () => editTask(task.id));
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(li);
  });

  updateStats();
}

function addTask() {
  const text = taskInput.value.trim();
  const priority = priorityInput.value;

  if (!text) return;

  tasks.unshift({
    id: Date.now(),
    text,
    priority,
    completed: false,
    createdAt: new Date().toLocaleString("pt-BR"),
  });

  taskInput.value = "";
  priorityInput.value = "media";
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;

  const newText = prompt("Editar tarefa:", task.text);
  if (newText === null) return;

  const trimmed = newText.trim();
  if (!trimmed) return;

  tasks = tasks.map((taskItem) =>
    taskItem.id === id ? { ...taskItem, text: trimmed } : taskItem
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderTasks();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  saveTheme(isDark ? "dark" : "light");
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTask();
});

searchInput.addEventListener("input", (event) => {
  currentSearch = event.target.value;
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

clearCompletedBtn.addEventListener("click", clearCompleted);
themeToggle.addEventListener("click", toggleTheme);

loadTheme();
renderTasks();
