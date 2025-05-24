// =========================
// NAVEGACIÓN ENTRE SECCIONES
// =========================
const bankSection     = document.getElementById('bank-section');
const consejosSection = document.getElementById('consejos-section');
const infoSection     = document.getElementById('info-section');

document.getElementById('btnHome').onclick = () => {
  bankSection.hidden     = false;
  consejosSection.hidden = true;
  infoSection.hidden     = true;
};
document.getElementById('btnConsejos').onclick = () => {
  bankSection.hidden     = true;
  consejosSection.hidden = false;
  infoSection.hidden     = true;
};
document.getElementById('btnInfo').onclick = () => {
  bankSection.hidden     = true;
  consejosSection.hidden = true;
  infoSection.hidden     = false;
};

// =========================
// GESTIÓN DE PRODUCTOS DINÁMICOS
// =========================
const productSelect = document.getElementById('productSelect');
const details       = document.querySelectorAll('.product-detail');

productSelect.onchange = () => {
  details.forEach(div => div.hidden = true);
  const sel = productSelect.value;
  if (sel) document.getElementById(sel).hidden = false;
};

// =========================
// HELPERS DE localStorage
// =========================
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const load = (key)         => JSON.parse(localStorage.getItem(key)) || [];

// =========================
// DATOS GLOBALES DE USUARIO
// =========================
let users       = load('users');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// =========================
// REFERENCIAS AL DOM
// =========================
const auth        = document.getElementById('auth');
const app         = document.getElementById('app');
const nameInput   = document.getElementById('name');
const emailInput  = document.getElementById('email');
const passInput   = document.getElementById('password');
const userName    = document.getElementById('userName');
const balance     = document.getElementById('balance');
const historyBody = document.getElementById('history-body');
const loansBody   = document.getElementById('loans-body');

// =========================
// REGISTRO DE USUARIO
// =========================
document.getElementById('btnRegister').onclick = () => {
  const n = nameInput.value.trim(),
        e = emailInput.value.trim(),
        p = passInput.value;
  if (!n || !e || !p) return alert('Todos los campos son obligatorios');
  if (users.some(u => u.email === e)) return alert('Email ya registrado');
  users.push({ name: n, email: e, pass: p, balance: 0 });
  save('users', users);
  alert('Registro exitoso');
};

// =========================
// LOGIN DE USUARIO
// =========================
document.getElementById('btnLogin').onclick = () => {
  const e = emailInput.value.trim(),
        p = passInput.value;
  const u = users.find(u => u.email === e && u.pass === p);
  if (!u) return alert('Credenciales incorrectas');
  currentUser = u;
  localStorage.setItem('currentUser', JSON.stringify(u));
  showApp();
};

// =========================
// MOSTRAR PANEL PRINCIPAL
// =========================
function showApp() {
  auth.hidden = true;
  app.hidden  = false;
  userName.innerText = currentUser.name;
  balance.innerText  = currentUser.balance.toFixed(2);
  renderHistory();
  renderLoans();
}

// =========================
// CONSIGNACIÓN
// =========================
document.getElementById('btnDeposit').onclick = () => {
  const amt = parseFloat(document.getElementById('depositAmount').value);
  if (isNaN(amt) || amt <= 0) return alert('Monto inválido');
  currentUser.balance += amt;
  saveCurrentUser();
  addTransaction('Consignación', amt);
  balance.innerText = currentUser.balance.toFixed(2);
  renderHistory();
};

// =========================
// TRANSFERENCIA
// =========================
document.getElementById('btnTransfer').onclick = () => {
  const to  = document.getElementById('transferEmail').value.trim(),
        amt = parseFloat(document.getElementById('transferAmount').value);
  if (!to || isNaN(amt) || amt <= 0) return alert('Datos inválidos');
  const tgt = users.find(u => u.email === to);
  if (!tgt) return alert('Usuario destino no existe');
  if (currentUser.balance < amt) return alert('Saldo insuficiente');
  currentUser.balance -= amt;
  tgt.balance        += amt;
  saveUsers();
  saveCurrentUser();
  addTransaction(`Transferencia a ${to}`, amt);
  balance.innerText = currentUser.balance.toFixed(2);
  renderHistory();
};

// =========================
// SOLICITAR PRÉSTAMO
// =========================
document.getElementById('btnLoan').onclick = () => {
  const amt = parseFloat(document.getElementById('loanAmount').value);
  if (isNaN(amt) || amt <= 0) return alert('Monto inválido');
  const loans = load('loans');
  loans.push({
    email: currentUser.email,
    amount: amt,
    date: new Date().toLocaleString(),
    status: 'pendiente'
  });
  save('loans', loans);
  renderLoans();
  alert('Préstamo solicitado');
};

// =========================
// AÑADIR TRANSACCIÓN
// =========================
function addTransaction(type, amount) {
  const txns = load('transactions');
  txns.push({
    email: currentUser.email,
    type,
    amount,
    date: new Date().toLocaleString(),
    to: type.startsWith('Transferencia') ? type.split(' ')[2] : '-'
  });
  save('transactions', txns);
}

// =========================
// RENDERIZAR HISTORIAL (TABLA)
// =========================
function renderHistory() {
  historyBody.innerHTML = '';
  load('transactions')
    .filter(t => t.email === currentUser.email)
    .forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.date}</td>
        <td>${t.type}</td>
        <td>$${t.amount.toFixed(2)}</td>
        <td>${t.to}</td>
      `;
      historyBody.append(tr);
    });
}

// =========================
// RENDERIZAR PRÉSTAMOS (TABLA)
// =========================
function renderLoans() {
  loansBody.innerHTML = '';
  load('loans')
    .filter(l => l.email === currentUser.email)
    .forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${l.date}</td>
        <td>$${l.amount.toFixed(2)}</td>
        <td>${l.status}</td>
      `;
      loansBody.append(tr);
    });
}

// =========================
// SINCRONIZAR USUARIOS
// =========================
function saveUsers() {
  const idx = users.findIndex(u => u.email === currentUser.email);
  users[idx] = currentUser;
  save('users', users);
}
function saveCurrentUser() {
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  saveUsers();
}

// =========================
// CERRAR SESIÓN
// =========================
document.getElementById('btnLogout').onclick = () => {
  localStorage.removeItem('currentUser');
  location.reload();
};

// =========================
// AUTO-LOGIN AL CARGAR
// =========================
if (currentUser) showApp();
