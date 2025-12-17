// Estado de la aplicación
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Elementos del DOM
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');

// NUEVOS Elementos para el Modal
const customModal = document.getElementById('customModal');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');
const modalMessage = document.getElementById('modalMessage');

/**
 * Función para mostrar el modal y esperar respuesta del usuario
 */
function showConfirmModal(message) {
    return new Promise((resolve) => {
        modalMessage.textContent = message;
        customModal.classList.add('active');

        confirmBtn.onclick = () => {
            customModal.classList.remove('active');
            resolve(true);
        };

        cancelBtn.onclick = () => {
            customModal.classList.remove('active');
            resolve(false);
        };
    });
}

// Funciones principales
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    todos.push(todo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
}

// MODIFICADO: Ahora es asíncrona para esperar el modal
async function deleteTodo(id) {
    const result = await showConfirmModal("¿Estás seguro de que deseas eliminar esta tarea?");
    if (result) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// MODIFICADO: Ahora es asíncrona para esperar el modal
async function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;

    const result = await showConfirmModal(`¿Deseas eliminar las ${completedCount} tareas completadas?`);
    if (result) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }
    
    todoList.innerHTML = '';
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn">Eliminar</button>
        `;
        
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        todoList.appendChild(li);
    });
    
    updateCounts();
}

function updateCounts() {
    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;
    
    document.getElementById('allCount').textContent = todos.length;
    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('itemsLeft').textContent = `${activeCount} tareas pendientes`;
}

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Inicializar
renderTodos();