const lista = document.getElementById('lista-profiles');
const nameInput = document.getElementById('name');
const passwordInput = document.getElementById('password');
const mealsInput = document.getElementById('meals');
const btnCrear = document.getElementById('btnCrear');

async function cargarProfiles() {
    const res = await fetch('/api/profiles');
    const profiles = await res.json();
    lista.innerHTML = '';

    profiles.forEach(p => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
      <div>
        <strong>${p.name}</strong><br>
        Comidas: ${p.meals.join(', ')}
      </div>
      <button class="btn btn-danger btn-sm" onclick="borrarProfile('${p._id}')">Eliminar</button>
    `;
        lista.appendChild(li);
    });
}

btnCrear.addEventListener('click', async () => {
    const nombre = nameInput.value;
    const pass = passwordInput.value;
    const comidas = mealsInput.value.split(',').map(x => x.trim()).filter(x => x);

    if (!nombre || !pass) return alert('Faltan datos');

    await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nombre, password: pass, meals: comidas })
    });

    nameInput.value = '';
    passwordInput.value = '';
    mealsInput.value = '';
    cargarProfiles();
});

async function borrarProfile(id) {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    cargarProfiles();
}

cargarProfiles();
