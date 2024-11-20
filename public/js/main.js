document.addEventListener("DOMContentLoaded", () => {
    fadeInElements();
    
    // Inicializa el perfil y la búsqueda en profile.html
    if (window.location.pathname === '/profile.html') {
        initProfilePage();
        initSearch(); // Asegúrate de que esto se llame
    } else {
        initLoginForm(); // Otras páginas
        initRegisterForm(); // Otras páginas
        initSearch(); // Otras páginas
    }
});

// ... resto del código

// --- Funciones de UI ---
function normalizeText(text) {  
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function fadeInElements() {
    document.querySelectorAll('.fade-in').forEach((element, index) => {
        element.style.opacity = 0;
        element.style.transition = `opacity 1.5s ease-in ${index * 0.3}s`;
        element.style.opacity = 1;
    });
}

function showError(id, message) {
    const inputGroup = document.getElementById(id)?.parentElement;
    if (inputGroup) {
        inputGroup.className = 'input-group error';
        inputGroup.querySelector('small').innerText = message;
    }
}

function showSuccess(id) {
    const inputGroup = document.getElementById(id)?.parentElement;
    if (inputGroup) {
        inputGroup.className = 'input-group success';
    }
}

// --- Funciones de Registro ---
function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateInputs()) {
            const userData = {
                nombre: getInputValue('nombre'),
                apellido: getInputValue('apellido'),
                fecha: getInputValue('fecha'),
                email: getInputValue('email'),
                password: getInputValue('password')
            };

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Registro exitoso. Por favor, inicia sesión.');
                    form.reset();
                } else {
                    alert(result.message || 'Error al registrarse');
                }
            } catch (error) {
                alert('Error en la conexión con el servidor');
            }
        }
    });
}

function getInputValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

// --- Funciones de Validación ---
function validateInputs() {
    const nombre = getInputValue('nombre');
    const apellido = getInputValue('apellido');
    const fecha = getInputValue('fecha');
    const email = getInputValue('email');
    const password = getInputValue('password');

    let isValid = true;

    isValid &= validateField(nombre, 'El campo de nombres no puede estar vacío', 'nombre');
    isValid &= validateField(apellido, 'El campo de apellidos no puede estar vacío', 'apellido');
    isValid &= validateField(fecha, 'La fecha de nacimiento es requerida', 'fecha', isValidDate);
    isValid &= validateField(email, 'Correo electrónico no válido', 'email', isValidEmail);
    isValid &= validateField(password, 'La contraseña debe tener al menos 6 caracteres', 'password', val => val.length >= 6);

    return !!isValid;
}

function validateField(value, errorMessage, id, validationFunc = v => v !== '') {
    const isValid = validationFunc(value);
    if (!isValid) {
        showError(id, errorMessage);
    } else {
        showSuccess(id);
    }
    return isValid;
}

function isValidEmail(email) {
    const re = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

function isValidDate(date) {
    return new Date(date) <= new Date();
}

// --- Funciones de Búsqueda y Carrusel ---
function initSearch() {
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");
    const categoryFilter = document.getElementById("category-filter");
    const priceFilter = document.getElementById("price-filter");
    const carousel = document.getElementById("search-carousel");
    const resultsContainer = document.getElementById('results');

    if (!searchBtn || !searchInput || !carousel || !categoryFilter || !priceFilter) return;

    updateCarouselFromDB(carousel);

    searchBtn.addEventListener("click", async () => {
        const query = normalizeText(searchInput.value.trim());
        const category = normalizeText(categoryFilter.value.trim());
        const priceRange = priceFilter.value;

        if (!query && !category && !priceRange) return alert('Por favor, ingrese un término, categoría o rango de precio.');

        resultsContainer.innerHTML = '<p>Buscando soluciones...</p>';

        try {
            const soluciones = await fetchSoluciones(query, category, priceRange);
            displayResults(soluciones, resultsContainer);

            await updateCarouselFromDB(carousel);
            searchInput.value = '';
        } catch (error) {
            console.error('Error al buscar soluciones:', error);
            alert('No se pudo conectar con el servidor.');
        }
    });
}

async function fetchCarouselData() {
    try {
        const response = await fetch('/api/soluciones/carousel-searches');
        if (!response.ok) throw new Error('Error al obtener datos del carrusel');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener datos del carrusel:', error);
        return [];
    }
}

async function updateCarouselFromDB(carousel) {
    const searches = await fetchCarouselData();
    carousel.innerHTML = searches.map((search, i) => `
        <div class="carousel-item fade-in" style="animation-delay: ${i * 0.2}s">${i + 1}. ${search}</div>
    `).join('');
}

async function fetchSoluciones(query, category, priceRange) {
    const url = `/api/soluciones?keyword=${encodeURIComponent(query)}&categoria=${encodeURIComponent(category)}&precio=${encodeURIComponent(priceRange)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
}

function displayResults(soluciones, container) {
    container.innerHTML = soluciones.length
        ? soluciones.map(createSolucionHTML).join('')
        : '<p>No se encontraron resultados.</p>';

    // Agregar eventos de clic a los botones "Ver más"
    document.querySelectorAll('.ver-mas-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const solucionId = e.target.dataset.id;
            const solucion = soluciones.find(s => s.id == solucionId);
            if (solucion) {
                await registerClick(solucionId, solucion.nombre, solucion.categoria); // Registrar clic
                showDetailsPopup(solucion);
            }
        });
    });
}

function createSolucionHTML(solucion) {
    return `
        <div class="solucion-card">
            <div class="solucion-header">
                <h3 class="solucion-nombre">${solucion.nombre}</h3>
            </div>
            <div class="solucion-body">
                <p>${solucion.descripcion}</p>
            </div>
            <div class="solucion-footer">
                <button class="ver-mas-btn" data-id="${solucion.id}">Ver más</button>
            </div>
        </div>`;
}

// --- Funciones de Inicio de Sesión ---
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (validateLoginInputs(email, password)) {
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Inicio de sesión exitoso');
                    const { token } = result; // Asegúrate de obtener el token
                    localStorage.setItem('token', token); // Almacena el token
                    window.location.href = '/profile.html';
                } else {
                    alert(result.message || 'Error al iniciar sesión');
                }
            } catch (error) {
                alert('Error en la conexión con el servidor');
            }
        }
    });
}

function validateLoginInputs(email, password) {
    let isValid = true;

    if (email === '') {
        showError('email', 'El correo es obligatorio');
        isValid = false;
    } else {
        showSuccess('email');
    }

    if (password === '') {
        showError('password', 'La contraseña es obligatoria');
        isValid = false;
    } else {
        showSuccess('password');
    }

    return isValid;
}

function showDetailsPopup(solucion) {
    const popup = document.getElementById('details-popup');
    const overlay = document.getElementById('popup-overlay');

    popup.innerHTML = `
        <div class="solucion-card">
            <div class="solucion-header">
                <h3 class="solucion-nombre">${solucion.nombre}</h3>
                <p class="solucion-categoria">Categoría: ${solucion.categoria}</p>
            </div>
            <div class="solucion-body">
                <p>${solucion.descripcion}</p>
            </div>
            <a href="${solucion.url}" class="solucion-enlace" target="_blank">Visitar Inteligencia Artificial</a>
            <p class="solucion-precio">Precio: $${solucion.precio || 'No disponible'}</p>
            <button id="close-popup-btn">Cerrar</button>
        </div>
    `;

    popup.style.display = 'block';
    overlay.style.display = 'block';

    document.getElementById('close-popup-btn').addEventListener('click', closeDetailsPopup);
    overlay.addEventListener('click', closeDetailsPopup);
}

function closeDetailsPopup() {
    const popup = document.getElementById('details-popup');
    const overlay = document.getElementById('popup-overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
}

// Función para registrar un clic en una solución
async function registerClick(solutionId, name, category) {
    try {
        const response = await fetch('/api/soluciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ solution_id: solutionId, name, category }),
        });

        if (!response.ok) {
            throw new Error('Error al registrar el clic');
        }

        const data = await response.json();
        console.log('Clic registrado exitosamente:', data);
    } catch (error) {
        console.error('Error al registrar el clic:', error);
    }
}

// --- Función para inicializar la página de perfil ---
function initProfilePage() {
    const token = localStorage.getItem('token');
    console.log('Token en profile.html:', token);

    if (!token) {
        alert('No has iniciado sesión. Redirigiendo al login.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const userData = jwt_decode(token); // Decodifica el token
        userData.loginTime = new Date().toLocaleTimeString(); // Agrega la hora de inicio de sesión
        console.log('Datos del usuario:', userData); // Depuración
        displayUserProfile(userData); // Muestra la información del usuario
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        alert('Token inválido. Redirigiendo al login.');
        window.location.href = 'login.html'; // Redirige si hay un error
    }
}

function displayUserProfile(userData) {
    const userInfo = document.getElementById('user-info');
    userInfo.innerHTML = `
        <p class="fade-in"><strong>Actualmente Conectado:</strong> ${userData.nombre}</p>
        <p class="fade-in"><strong>Último inicio de sesión:</strong> ${userData.loginTime}</p>
    `;

    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML += `
        <h1 class="fade-in"><strong>¡Hola ${userData.nombre} bienvenid@ &#128521;! ¿Cómo puedo ayudarte el día de hoy?</strong></h1>
    `;
}