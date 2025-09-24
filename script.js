const STORAGE_KEY = "todo-app/tasks";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#tasks");
const emptyState = document.querySelector("#empty-state");
const template = document.querySelector("#task-template");

let tasks = loadTasks();
renderTasks();
updateEmptyState();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) {
    input.focus();
    return;
  }

  const task = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: Date.now(),
  };

  tasks.push(task);
  persistTasks();
  addTaskToDOM(task);
  updateEmptyState();

  form.reset();
  input.focus();
});

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.warn("Não foi possível carregar as tarefas salvas.", error);
    return [];
  }
}

function persistTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  list.innerHTML = "";
  [...tasks]
    .sort((a, b) => a.completed - b.completed || a.createdAt - b.createdAt)
    .forEach(addTaskToDOM);
}

function addTaskToDOM(task) {
  const fragment = template.content.cloneNode(true);
  const item = fragment.querySelector(".task");
  const checkbox = fragment.querySelector(".task__checkbox");
  const title = fragment.querySelector(".task__title");
  const deleteButton = fragment.querySelector(".task__delete");

  item.dataset.taskId = task.id;
  title.textContent = task.title;
  checkbox.checked = task.completed;

  if (task.completed) {
    item.classList.add("completed");
  }

  checkbox.addEventListener("change", () => toggleCompleted(task.id, checkbox.checked));
  deleteButton.addEventListener("click", () => removeTask(task.id));

  list.appendChild(fragment);
}

function toggleCompleted(id, isCompleted) {
  const task = tasks.find((entry) => entry.id === id);
  if (!task) {
    return;
  }

  task.completed = isCompleted;
  persistTasks();
  updateTaskInDOM(id, isCompleted);
}

function updateTaskInDOM(id, isCompleted) {
  const item = list.querySelector(`[data-task-id="${id}"]`);
  if (!item) {
    return;
  }

  item.classList.toggle("completed", isCompleted);

  if (isCompleted) {
    list.appendChild(item);
  } else {
    const items = Array.from(list.children);
    const firstCompleted = items.find((el) => el.classList.contains("completed"));
    list.insertBefore(item, firstCompleted || null);
  }
}

function removeTask(id) {
  tasks = tasks.filter((entry) => entry.id !== id);
  persistTasks();
  const item = list.querySelector(`[data-task-id="${id}"]`);
  item?.remove();
  updateEmptyState();
}

function updateEmptyState() {
  const hasTasks = tasks.length > 0;
  emptyState.hidden = hasTasks;
  list.parentElement.classList.toggle("has-tasks", hasTasks);
}
