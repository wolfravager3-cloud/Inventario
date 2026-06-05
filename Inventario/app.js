const API = 'http://localhost:3000/productos';

// Mostrar / ocultar contraseña
function togglePassword() {
    const input = document.getElementById('password');

    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function logout(){
    localStorage.removeItem('auth');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    document.getElementById('app').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}

// Credenciales del administrador (front-end solamente)
const ADMIN_USER = 'LxG';
const ADMIN_PASS = 'admin';

// Mantener sesión y configurar UI
window.onload = () => {

    const form = document.getElementById('form');
    const pasteBtn = document.getElementById('pasteImg');
    const buscar = document.getElementById('buscar');

    if (localStorage.getItem('auth') === 'true') {
        document.getElementById('login').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        aplicarEstadoUI();
        cargarProductos();
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const role = localStorage.getItem('role');
            if (role !== 'admin') {
                alert('Solo el administrador puede agregar productos.');
                return;
            }

            const nombre = document.getElementById('nombre').value;
            const precio = document.getElementById('precio').value;
            const cantidad = document.getElementById('cantidad').value;
            const imagen = document.getElementById('imagen').value;
            const descripcion = document.getElementById('descripcion').value;
            const fecha = document.getElementById('fecha').value;

            await fetch(API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre,
                    precio,
                    cantidad,
                    imagen,
                    descripcion,
                    fecha
                })
            });

            form.reset();
            cargarProductos();
        });
    }

    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                document.getElementById('imagen').value = text;
            } catch (err) {
                alert('No se pudo acceder al portapapeles');
            }
        });
    }

    if (buscar) {
        buscar.addEventListener('input', () => {
            cargarProductos();
        });
    }

};

// Crear vendedor (solo admin, guardado en localStorage)
function crearVendedor(){
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
        alert('Solo administrador puede crear vendedores');
        return;
    }

    const user = document.getElementById('newSellerUser').value.trim();
    const pass = document.getElementById('newSellerPass').value.trim();

    if (!user || !pass) {
        document.getElementById('adminMsg').textContent = 'Usuario/contraseña vacíos';
        return;
    }

    const sellers = JSON.parse(localStorage.getItem('sellers') || '[]');

    if (sellers.find(s => s.user === user)){
        document.getElementById('adminMsg').textContent = 'Ese usuario ya existe';
        return;
    }

    sellers.push({user, pass});
    localStorage.setItem('sellers', JSON.stringify(sellers));
    mostrarVendedores();

    document.getElementById('adminMsg').textContent = 'Vendedor creado';
    document.getElementById('newSellerUser').value = '';
    document.getElementById('newSellerPass').value = '';
}

function eliminarVendedor(usuario){

    const role = localStorage.getItem('role');

    if(role !== 'admin'){
        return alert('Solo administrador');
    }

    let sellers =
        JSON.parse(
            localStorage.getItem('sellers') || '[]'
        );

    sellers =
        sellers.filter(
            s => s.user !== usuario
        );

    localStorage.setItem(
        'sellers',
        JSON.stringify(sellers)
    );

    mostrarVendedores();
}

function mostrarVendedores(){

    const lista = document.getElementById('listaVendedores');

    if(!lista) return;

    const sellers =
        JSON.parse(localStorage.getItem('sellers') || '[]');

    lista.innerHTML = '';

    if(sellers.length === 0){
        lista.innerHTML = '<p>No hay vendedores registrados</p>';
        return;
    }

    sellers.forEach((seller,index)=>{

        lista.innerHTML += `
        <div style="
            border:1px solid #ccc;
            padding:10px;
            margin:5px 0;
            border-radius:8px;
        ">

            <strong>Usuario:</strong> ${seller.user}<br>

            <strong>Contraseña:</strong>
            <span id="pass${index}">******</span>

            <button onclick="verPassword(${index})">
                Mostrar
            </button>

            <button onclick="eliminarVendedor(${index})">
                Eliminar
            </button>

        </div>
        `;
    });
}

function verPassword(index){

    const sellers =
        JSON.parse(localStorage.getItem('sellers') || '[]');

    document.getElementById(`pass${index}`).innerText =
        sellers[index].pass;
}

function eliminarVendedor(index){

    if(!confirm('¿Eliminar vendedor?')){
        return;
    }

    let sellers =
        JSON.parse(localStorage.getItem('sellers') || '[]');

    sellers.splice(index,1);

    localStorage.setItem(
        'sellers',
        JSON.stringify(sellers)
    );

    mostrarVendedores();
}
// Login
function login() {

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    // Admin
    if (usuario === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem('auth', 'true');
        localStorage.setItem('role', 'admin');
        localStorage.setItem('username', usuario);

        document.getElementById('login').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        aplicarEstadoUI();
        cargarProductos();
        return;
    }

    // Vendedor (localStorage)
    const sellers = JSON.parse(localStorage.getItem('sellers') || '[]');
    const found = sellers.find(s => s.user === usuario && s.pass === password);

    if (found) {
        localStorage.setItem('auth', 'true');
        localStorage.setItem('role', 'seller');
        localStorage.setItem('username', usuario);

        document.getElementById('login').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        aplicarEstadoUI();
        cargarProductos();
        return;
    }

    document.getElementById('error').textContent = 'Usuario o contraseña incorrectos';
}

function aplicarEstadoUI(){
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('username') || '';

    document.getElementById('userLabel').textContent = `${user} (${role || ''})`;

    if (role === 'admin'){
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('form').style.display = 'flex';
        mostrarVendedores();
        // show actions will be handled when rendering
    } else {
        // vendedor
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('form').style.display = 'none';
    }
}

// Mostrar productos
// Mostrar productos
async function cargarProductos() {

    const res = await fetch(API);
    const data = await res.json();

    const lista = document.getElementById('lista');
    const buscar = document.getElementById('buscar').value.toLowerCase();

    lista.innerHTML = '';

    data
    .filter(p => {

        const nombre =
            (p.Nombre || p.nombre || '').toLowerCase();

        const descripcion =
            (p.Descripción || p.descripcion || '').toLowerCase();

        return nombre.includes(buscar) ||
               descripcion.includes(buscar);

    })

    .forEach(producto => {

        lista.innerHTML += `
        <tr>

            <td>${producto.ID}</td>

            <td>${producto.Nombre}</td>

            <td>Q${producto.Precio}</td>

            <td>${producto.Cantidad}</td>

            <td>
                ${
                    producto.imagen
                    ?
                    `<img src="${producto.imagen}" class="producto-img">`
                    :
                    '-'
                }
            </td>

            <td>
                ${
                    producto.Fecha
                    ?
                    producto.Fecha
                    :
                    'Sin fecha'
                }
            </td>

                 <td class="descripcion">
                 ${
                 producto.Descripción || '-'
                 }
                 </td>

            <td>
                <button onclick="editar(${producto.ID})">
                    Editar
                </button>

                <button onclick="eliminar(${producto.ID})">
                    Eliminar
                </button>
            </td>

        </tr>
        `;
    });
}
// Eliminar (solo admin)
async function eliminar(id) {
    const role = localStorage.getItem('role');
    if (role !== 'admin') return alert('Acceso denegado');

    await fetch(`${API}/${id}`, {
        method: 'DELETE'
    });

    cargarProductos();
}

// Editar producto (admin)
// Editar producto (admin)
async function editar(id){

    const role = localStorage.getItem('role');

    if (role !== 'admin') {
        return alert('Acceso denegado');
    }

    const res = await fetch(`${API}/${id}`);
    const p = await res.json();

    const nombre = prompt('Nombre', p.Nombre) || p.Nombre;
    const precio = prompt('Precio', p.Precio) || p.Precio;
    const cantidad = prompt('Cantidad', p.Cantidad) || p.Cantidad;
    const imagen = prompt('URL imagen', p.imagen || '') || p.imagen || '';
    const descripcion = prompt('Descripción', p.Descripción || '') || p.Descripción || '';

    await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    nombre: nombre,
    precio: precio,
    cantidad: cantidad,
    imagen: imagen,
    fecha: p.Fecha,
    descripcion: descripcion
})
});

    cargarProductos();
}
