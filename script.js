// —— Funciones helper para localStorage ——
// Guarda un objeto/array en localStorage
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
// Carga un objeto/array de localStorage (o array vacío si no existe)
const load = (key) => JSON.parse(localStorage.getItem(key)) || [];

// —— Variables de datos ——
// Lista de usuarios registrados
let users = load('users');
// Usuario actualmente logueado (o null)
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// —— Referencias al DOM ——
// Sección de autenticación y aplicación
const auth = document.getElementById('auth');
const app  = document.getElementById('app');
// Inputs de autenticación
const nameInput  = document.getElementById('name');
const emailInput = document.getElementById('email');
const passInput  = document.getElementById('password');
// Elementos de información de usuario
const userName     = document.getElementById('userName');
const balance      = document.getElementById('balance');
const historyList  = document.getElementById('history');
const loansList    = document.getElementById('loans');

// —— Registro de usuario ——
// Al hacer clic en "Registrarse"
document.getElementById('btnRegister').onclick = () => {
  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();
  const pass  = passInput.value;
  // Validaciones básicas
  if (!name || !email || !pass) return alert('Todos los campos son obligatorios');
  if (users.some(u => u.email === email)) return alert('Email ya registrado');
  // Agregar nuevo usuario con balance inicial 0
  users.push({ name, email, pass, balance: 0 });
  save('users', users);
  alert('Registro exitoso, ahora ingresa');
};

// —— Login de usuario ——
// Al hacer clic en "Ingresar"
document.getElementById('btnLogin').onclick = () => {
  const email = emailInput.value.trim();
  const pass  = passInput.value;
  // Buscar usuario con credenciales
  const user = users.find(u => u.email === email && u.pass === pass);
  if (!user) return alert('Credenciales incorrectas');
  // Guardar usuario en localStorage y mostrar interfaz principal
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  showApp();
};

// —— Mostrar interfaz principal ——
// Oculta auth, muestra app y carga datos
function showApp() {
  auth.hidden = true;
  app.hidden  = false;
  userName.innerText = currentUser.name;
  balance.innerText  = currentUser.balance.toFixed(2);
  renderHistory();
  renderLoans();
}

// —— Funcionalidad de consignación ——
// Al hacer clic en "Depositar"
document.getElementById('btnDeposit').onclick = () => {
  const amount = parseFloat(document.getElementById('depositAmount').value);
  if (isNaN(amount) || amount <= 0) return alert('Monto inválido');
  // Actualizar balance del usuario
  currentUser.balance += amount;
  saveCurrentUser();
  // Registrar transacción
  addTransaction('Consignación', amount);
  // Actualizar interfaz
  balance.innerText = currentUser.balance.toFixed(2);
  renderHistory();
};

// —— Funcionalidad de transferencia ——
// Al hacer clic en "Enviar"
document.getElementById('btnTransfer').onclick = () => {
  const toEmail = document.getElementById('transferEmail').value.trim();
  const amount  = parseFloat(document.getElementById('transferAmount').value);
  // Validaciones básicas
  if (!toEmail || isNaN(amount) || amount <= 0) return alert('Datos inválidos');
  const target = users.find(u => u.email === toEmail);
  if (!target) return alert('Usuario destino no existe');
  if (currentUser.balance < amount) return alert('Saldo insuficiente');
  // Ajustar balances de origen y destino
  currentUser.balance -= amount;
  target.balance      += amount;
  saveUsers();
  saveCurrentUser();
  // Registrar transacción de transferencia
  addTransaction(`Transferencia a ${toEmail}`, amount);
  // Actualizar interfaz
  balance.innerText = currentUser.balance.toFixed(2);
  renderHistory();
};

// —— Funcionalidad de préstamo ——
// Al hacer clic en "Solicitar"
document.getElementById('btnLoan').onclick = () => {
  const amount = parseFloat(document.getElementById('loanAmount').value);
  if (isNaN(amount) || amount <= 0) return alert('Monto inválido');
  // Crear y guardar préstamo pendiente
  const loans = load('loans');
  loans.push({
    email: currentUser.email,
    amount,
    date: new Date().toLocaleString(),
    status: 'pendiente'
  });
  save('loans', loans);
  renderLoans();
  alert('Préstamo solicitado');
};

// —— Registro de transacciones ——
// Guarda cada movimiento en localStorage
function addTransaction(type, amount) {
  const txns = load('transactions');
  txns.push({
    email: currentUser.email,
    type,
    amount,
    date: new Date().toLocaleString()
  });
  save('transactions', txns);
}

// —— Mostrar historial de movimientos ——
// Filtra y muestra solo las transacciones del usuario actual
function renderHistory() {
  historyList.innerHTML = '';
  load('transactions')
    .filter(t => t.email === currentUser.email)
    .forEach(t => {
      const li = document.createElement('li');
      li.textContent = `[${t.date}] ${t.type}: $${t.amount.toFixed(2)}`;
      historyList.append(li);
    });
}

// —— Mostrar lista de préstamos ——
// Filtra y muestra solo los préstamos del usuario actual
function renderLoans() {
  loansList.innerHTML = '';
  load('loans')
    .filter(l => l.email === currentUser.email)
    .forEach(l => {
      const li = document.createElement('li');
      li.textContent = `[${l.date}] $${l.amount.toFixed(2)} – ${l.status}`;
      loansList.append(li);
    });
}

// —— Utilitarios para sincronizar usuarios ——
// Actualiza el array 'users' y lo guarda
function saveUsers() {
  const idx = users.findIndex(u => u.email === currentUser.email);
  users[idx] = currentUser;
  save('users', users);
}
// Guarda el usuario actual en localStorage y actualiza el array
function saveCurrentUser() {
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  saveUsers();
}

// —— Cerrar sesión ——
// Elimina la sesión y recarga la página
document.getElementById('btnLogout').onclick = () => {
  localStorage.removeItem('currentUser');
  location.reload();
};

// —— Auto-login al cargar la página ——
// Si ya hay un usuario en localStorage, mostrar la app
if (currentUser) showApp();
