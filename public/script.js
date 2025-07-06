let profile = JSON.parse(localStorage.getItem('profile'));

if (!profile) {
    window.location.href = 'login.html';
} else {
    document.getElementById('welcome').textContent = `Bienvenido/a, ${profile.name}`;
    const mealsList = document.getElementById('meals');
    profile.meals.forEach(meal => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = meal;
        mealsList.appendChild(li);
    });

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('profile');
        window.location.href = 'login.html';
    });
    rellenarDatosNutricionales();
    loadRegistro();
}

document.getElementById('nutriForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        weight: parseFloat(document.getElementById('peso').value),
        height: parseFloat(document.getElementById('altura').value),
        age: parseInt(document.getElementById('edad').value),
        sex: document.getElementById('sexo').value,
        activityLevel: document.getElementById('actividad').value,
        goal: document.getElementById('objetivo').value,
    };

    const res = await fetch(`/api/profiles/${profile._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.success) {

        localStorage.setItem('profile', JSON.stringify(result.profile));

        Object.assign(profile, result.profile);
        // Mostrar las metas calculadas si están en el resultado
        const metas = result.profile;
        if (
            metas.targetCalories &&
            metas.targetProtein &&
            metas.targetCarbs &&
            metas.targetFats
        ) {
            document.getElementById('resCalorias').textContent = metas.targetCalories;
            document.getElementById('resProteina').textContent = metas.targetProtein;
            document.getElementById('resCarbs').textContent = metas.targetCarbs;
            document.getElementById('resGrasas').textContent = metas.targetFats;
            document.getElementById('resultadoMetas').style.display = 'block';
        }
        loadRegistro();
        showToast('Datos actualizados correctamente', 'success');
    } else {
        showToast('Error al actualizar', 'danger');
    }
});

async function loadRegistro() {
    const date = new Date().toISOString().split('T')[0];

    const res = await fetch(`/api/consumed?userId=${profile._id}&date=${date}`);
    const data = await res.json();

    const tbody = document.getElementById('registroBody');
    tbody.innerHTML = '';

    // ----- Totales para el dashboard -----
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    if (!data.success || data.entries.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6">No hay alimentos registrados hoy.</td>`;
        tbody.appendChild(row);
        updateDashboard(totals);   // todo en cero
        return;
    }

    data.entries.forEach(entry => {
        const { foodId, quantity } = entry;
        const row = document.createElement('tr');

        const total = field => foodId[field] * quantity;
        row.innerHTML = `
        <td>${foodId.name}</td>
        <td>${quantity}</td>
        <td>${total('calories').toFixed(1)}</td>
        <td>${total('protein').toFixed(1)}</td>
        <td>${total('carbs').toFixed(1)}</td>
        <td>${total('fats').toFixed(1)}</td>
      `;
        tbody.appendChild(row);

        // Acumular
        totals.calories += total('calories');
        totals.protein += total('protein');
        totals.carbs += total('carbs');
        totals.fats += total('fats');
    });

    updateDashboard(totals);
}

function mostrarFormNuevo() {
    document.getElementById('formNuevoAlimento').classList.remove('d-none');
}

async function crearNuevoAlimento() {
    const nuevo = {
        userId: profile._id,
        name: document.getElementById('nuevoNombre').value,
        calories: parseFloat(document.getElementById('nuevoCal').value),
        protein: parseFloat(document.getElementById('nuevoProt').value),
        carbs: parseFloat(document.getElementById('nuevoCarb').value),
        fats: parseFloat(document.getElementById('nuevoGras').value),
    };

    const resFood = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
    });

    const created = await resFood.json();

    if (!created.success) {
        showToast(created.message || 'Error al crear alimento');
        return;
    }

    showToast('Alimento guardado');
    await cargarAlimentos(); // actualizar select
    document.getElementById('selectFood').value = created.food._id;
}

async function cargarAlimentos() {
    const res = await fetch(`/api/food?userId=${profile._id}`);
    const data = await res.json();

    console.log(data);
    const select = document.getElementById('selectFood');
    select.innerHTML = '<option value="">Seleccione un alimento</option>';
    data.foods.forEach(f => {
        const option = document.createElement('option');
        option.value = f._id;
        option.textContent = f.name;
        select.appendChild(option);
    });
}

document.getElementById('addFoodModal').addEventListener('shown.bs.modal', () => {
    cargarAlimentos();
});

function cerrarModal() {
    const modalEl = document.getElementById('addFoodModal');
    const instance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    instance.hide();
}

// Manejar envío del formulario para registrar consumo
document.getElementById('consumedForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const foodId = document.getElementById('selectFood').value;
    const foodName = document.getElementById('selectFood').selectedOptions[0]?.textContent || '';
    const cantidad = parseFloat(document.getElementById('cantidad').value);
    const date = new Date().toISOString().split('T')[0];

    if (!foodId) return showToast('Debe seleccionar un alimento', 'warning');

    const res = await fetch('/api/consumed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile._id, foodId, foodName, date, quantity: cantidad })
    });

    const result = await res.json();
    if (result.success) {
        showToast('Alimento registrado', 'success');
        cerrarModal();
        loadRegistro?.();
    } else {
        showToast('Error al registrar alimento', 'danger');
    }
    loadRegistro();

});

/* ---------- DASHBOARD ---------- */
function updateDashboard(totals) {
    const metas = profile;          // metas vienen del perfil guardado
    pintarBarra('Calorias', totals.calories, metas.targetCalories, 'kcal');
    pintarBarra('Proteina', totals.protein, metas.targetProtein, 'g');
    pintarBarra('Carbs', totals.carbs, metas.targetCarbs, 'g');
    pintarBarra('Grasas', totals.fats, metas.targetFats, 'g');
}

function pintarBarra(nombre, consumido = 0, meta = 0, sufijo = '') {
    // Elementos
    const bar = document.getElementById(`dash${nombre}Bar`);
    const text = document.getElementById(`dash${nombre}Text`);

    // Si no hay meta, escondemos el bloque completo
    if (!meta) {
        document.getElementById(`dash${nombre}`).style.display = 'none';
        return;
    }
    document.getElementById(`dash${nombre}`).style.display = 'block';

    // Texto y porcentaje
    text.textContent = `${Math.round(consumido)} / ${meta} ${sufijo}`;
    const pct = Math.min((consumido / meta) * 100, 100);
    bar.style.width = pct + '%';

    // Colores (verde-bien, amarillo-bajo, rojo-excedido)
    bar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
    if (consumido < meta * 0.8) bar.classList.add('bg-warning');
    else if (consumido <= meta) bar.classList.add('bg-success');
    else bar.classList.add('bg-danger');
}

function rellenarDatosNutricionales() {

    if (!profile) return;
    if (profile.weight) document.getElementById('peso').value = profile.weight;
    if (profile.height) document.getElementById('altura').value = profile.height;
    if (profile.age) document.getElementById('edad').value = profile.age;
    if (profile.sex) document.getElementById('sexo').value = profile.sex;
    if (profile.activityLevel) document.getElementById('actividad').value = profile.activityLevel;
    if (profile.goal) document.getElementById('objetivo').value = profile.goal;

    document.getElementById('resCalorias').textContent = profile.targetCalories;
    document.getElementById('resProteina').textContent = profile.targetProtein;
    document.getElementById('resCarbs').textContent = profile.targetCarbs;
    document.getElementById('resGrasas').textContent = profile.targetFats;
    document.getElementById('resultadoMetas').style.display = 'block';
}

// --- Cargar historial al abrir modal ---
document.getElementById('historyModal').addEventListener('show.bs.modal', loadHistory);

async function loadHistory() {
    const res = await fetch(`/api/consumed?userId=${profile._id}`); // sin fecha = todo
    const data = await res.json();
    console.log(data);
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';

    if (!data.success || data.entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay registros.</td></tr>';
        return;
    }

    data.entries.forEach(e => {
        const tr = document.createElement('tr');
        const total = f => (e.foodId[f] * e.quantity).toFixed(1);
        tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.foodId.name}</td>
      <td>${e.quantity}</td>
      <td>${total('calories')}</td>
      <td>${total('protein')}</td>
      <td>${total('carbs')}</td>
      <td>${total('fats')}</td>`;
        tbody.appendChild(tr);
    });
}

/* ---------- Notificaciones Toast ---------- */
function showToast(msg, variant = 'primary', delay = 4000) {
    const container = document.getElementById('toastContainer');

    // Crea el HTML del toast
    const toastEl = document.createElement('div');
    toastEl.className = `toast text-bg-${variant} border-0`;
    toastEl.role = 'showToast';
    toastEl.ariaLive = 'assertive';
    toastEl.ariaAtomic = 'true';
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>`;

    container.appendChild(toastEl);

    // Muestra y auto-destruye
    const toast = new bootstrap.Toast(toastEl, { delay });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}