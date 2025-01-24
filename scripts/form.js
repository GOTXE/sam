// Simulación de datos para prueba
const fixedData = {
    nombres: [
        "Rayo",
        "Destructor",
        "Furia",
        "BALA",
        "Tornado",
        "Huracán",
        "Centella",
        "Trueno",
        "Tormenta",
        "Ciclón"
    ]
    ,
    posiciones: ["1", "2", "3", "4"],
    conexiones: ["AAA", "BBB", "CCC", "DDD", "EEE", "FFF", "GGG", "HHH", "III", "JJJ", "LLL", "MMM", "NNN", "OOO", "PPP", "QQQ", "RRR", "SSS", "TTT", "UUU", "VVV", "WWW", "XXX", "YYY", "ZZZ"]
};


function loadInitialData() {
    // Llenar los desplegables
    populateDropdowns();

    // Cargar datos en la tabla
    loadTableData();
}

function populateDropdowns() {
    // Llenar los desplegables con los datos de fixedData
    const nombreDropdown = document.getElementById("nombre");
    const posicionDropdown = document.getElementById("posicion");
    const conexionDropdown = document.getElementById("conexion");

    fixedData.nombres.forEach(nombre => {
        const option = document.createElement("option");
        option.value = nombre;
        option.textContent = nombre;
        nombreDropdown.appendChild(option);
    });

    fixedData.posiciones.forEach(posicion => {
        const option = document.createElement("option");
        option.value = posicion;
        option.textContent = posicion;
        posicionDropdown.appendChild(option);
    });

    fixedData.conexiones.forEach(conexion => {
        const option = document.createElement("option");
        option.value = conexion;
        option.textContent = conexion;
        conexionDropdown.appendChild(option);
    });
}

function loadTableData() {
    fetch('./data/mov.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar mov.json");
            }
            return response.json();
        })
        .then(data => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const parseDate = (dateString) => {
                const [day, month, year] = dateString.split('/').map(Number);
                return new Date(year, month - 1, day);
            };

            data.sort((a, b) => {
                const dateA = parseDate(a.fecha_llegada);
                const dateB = parseDate(b.fecha_llegada);

                const salidaA = a.fecha_salida ? parseDate(a.fecha_salida) : null;
                const salidaB = b.fecha_salida ? parseDate(b.fecha_salida) : null;

                // 1. Fecha de llegada = Hoy
                if (dateA.toDateString() === today.toDateString()) {
                    if (dateB.toDateString() === today.toDateString()) {
                        return a.hora_llegada.localeCompare(b.hora_llegada);
                    }
                    return -1;
                }
                if (dateB.toDateString() === today.toDateString()) return 1;

                // 2. Fecha de llegada = Mañana
                if (dateA.toDateString() === tomorrow.toDateString()) {
                    if (dateB.toDateString() === tomorrow.toDateString()) {
                        return a.hora_llegada.localeCompare(b.hora_llegada);
                    }
                    return -1;
                }
                if (dateB.toDateString() === tomorrow.toDateString()) return 1;

                // 3. Próximas fechas (posterior a mañana)
                if (dateA > tomorrow && dateB > tomorrow) {
                    return dateA - dateB;
                }
                if (dateA > tomorrow) return -1;
                if (dateB > tomorrow) return 1;

                // 4. Fechas anteriores a hoy (ordenadas por fecha de salida)
                if (dateA < today && dateB < today) {
                    if (salidaA && salidaB) return salidaA - salidaB;
                    if (salidaA) return -1;
                    if (salidaB) return 1;
                    return dateA - dateB;
                }

                // 5. Fechas anteriores a hoy sin fecha de salida
                if (dateA < today && !salidaA) return 1;
                if (dateB < today && !salidaB) return -1;

                return 0;
            });

            const tableBody = document.getElementById("table-body");
            tableBody.innerHTML = ""; // Limpiar tabla antes de cargar

            data.forEach(item => {
                const row = document.createElement("tr");

                // Crear contenido dinámico para la fila
                row.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.fecha_llegada}</td>
                <td>${item.hora_llegada}</td>
                <td>${item.fecha_salida || "N/A"}</td>
                <td>${item.Posición}</td>
                <td>${item.Conexión}</td>
                <td>${item.Teléfonos.join(", ")}</td>
                <td>${item.POC || "N/A"}</td>
            `;

                // Añadir evento para seleccionar fila
                row.addEventListener("click", () => {
                    highlightRow(row);
                    loadRowData(item);
                });

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error al cargar datos:", error));
}


function highlightRow(selectedRow) {
    const rows = document.querySelectorAll("#table-body tr");
    rows.forEach(row => row.classList.remove("selected")); // Quitar selección previa
    selectedRow.classList.add("selected"); // Añadir selección a la fila actual
}

function resetForm() {
    // Limpiar todos los campos del formulario
    document.getElementById("nombre").value = "Selecciona una opción";
    document.getElementById("fecha_llegada").value = "";
    document.getElementById("hora_llegada").value = "";
    document.getElementById("fecha_salida").value = "";
    document.getElementById("posicion").value = "Selecciona una opción";
    document.getElementById("conexion").value = "Selecciona una opción";
    document.getElementById("telefonos").value = "";
    document.getElementById("poc").value = "";

    // Deseleccionar cualquier fila seleccionada en la tabla
    const rows = document.querySelectorAll("#table-body tr");
    rows.forEach(row => row.classList.remove("selected"));
}

function clearForm() {
    // Limpiar los campos del formulario
    document.getElementById('nombre').value = '';
    document.getElementById('fecha_llegada').value = '';
    document.getElementById('hora_llegada').value = '';
    document.getElementById('fecha_salida').value = '';
    document.getElementById('posicion').value = '';
    document.getElementById('conexion').value = '';
    document.getElementById('poc').value = '';
    document.getElementById('telefonos').value = '';

    // Deseleccionar la fila en la tabla
    const selectedRow = document.querySelector('tr.selected');
    if (selectedRow) {
        selectedRow.classList.remove('selected');
    }
}

function loadRowData(item) {
    document.getElementById('nombre').value = item.nombre;
    document.getElementById('fecha_llegada').value = formatDateForInput(item.fecha_llegada);
    document.getElementById('hora_llegada').value = item.hora_llegada;
    document.getElementById('fecha_salida').value = item.fecha_salida ? formatDateForInput(item.fecha_salida) : '';
    document.getElementById('posicion').value = item.Posición;
    document.getElementById('conexion').value = item.Conexión;
    document.getElementById('telefonos').value = item.Teléfonos.join(', ');
    document.getElementById('poc').value = item.POC;
}

function validateForm() {
    const nombre = document.getElementById("nombre").value;
    const fechaLlegada = document.getElementById("fecha_llegada").value;
    const posicion = document.getElementById("posicion").value;

    if (nombre === "Selecciona una opción" || !fechaLlegada || posicion === "Selecciona una opción") {
        alert("Por favor, complete todos los campos obligatorios.");
        return false;
    }
    return true;
}


function formatDateForInput(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function saveData() {
    // Validar campos obligatorios
    if (!validateForm()) return;

    const nombre = document.getElementById("nombre").value;
    const fechaLlegada = document.getElementById("fecha_llegada").value;
    const horaLlegada = document.getElementById("hora_llegada").value || null;
    const fechaSalida = document.getElementById("fecha_salida").value || null;
    const posicion = document.getElementById("posicion").value;
    const conexion = document.getElementById("conexion").value;
    const telefonos = document.getElementById("telefonos").value.split(/[, ]+/).filter(Boolean);
    const poc = document.getElementById("poc").value || null;

    // Crear un objeto con los datos
    const newData = {
        nombre,
        fecha_llegada: formatDateForDisplay(fechaLlegada),
        hora_llegada: horaLlegada,
        fecha_salida: fechaSalida ? formatDateForDisplay(fechaSalida) : null,
        Posición: posicion,
        Conexión: conexion,
        Teléfonos: telefonos,
        POC: poc
    };

    // Confirmar datos
    if (!confirm(`¿Guardar los siguientes datos?\n${JSON.stringify(newData, null, 2)}`)) return;

    // Verificar si hay una fila seleccionada
    const selectedRow = document.querySelector("#table-body tr.selected");

    if (selectedRow) {
        // Actualizar datos en la fila seleccionada
        const index = selectedRow.dataset.index;
        updateData(index, newData);
    } else {
        // Añadir nueva entrada
        addData(newData);
    }

    // Limpiar formulario y actualizar tabla
    resetForm();
    loadTableData();
}
function deleteData() {
    const selectedRow = document.querySelector("#table-body tr.selected");
    if (!selectedRow) {
        alert("Por favor, seleccione una fila para eliminar.");
        return;
    }

    // Confirmar eliminación
    if (!confirm("¿Está seguro de que desea eliminar esta entrada?")) return;

    const index = selectedRow.dataset.index;

    // Eliminar entrada del archivo mov.json
    fetch('./data/mov.json')
        .then(response => response.json())
        .then(data => {
            data.splice(index, 1); // Eliminar entrada
            return saveToFile(data); // Guardar datos actualizados
        })
        .then(() => {
            alert("Entrada eliminada con éxito.");
            loadTableData(); // Recargar tabla
            resetForm(); // Limpiar formulario
        })
        .catch(error => console.error("Error al eliminar la entrada:", error));
}
function validateForm() {
    const nombre = document.getElementById("nombre").value;
    const fechaLlegada = document.getElementById("fecha_llegada").value;
    const posicion = document.getElementById("posicion").value;

    if (nombre === "Selecciona una opción" || !fechaLlegada || posicion === "Selecciona una opción") {
        alert("Por favor, complete todos los campos obligatorios.");
        return false;
    }
    return true;
}
function saveToFile(data) {
    return fetch('./data/mov.json', {
        method: 'POST', // Simula el guardado al backend
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}
function addData(newData) {
    fetch('./data/mov.json')
        .then(response => response.json())
        .then(data => {
            data.push(newData); // Añadir nueva entrada
            return saveToFile(data); // Guardar datos actualizados
        })
        .then(() => alert("Datos guardados con éxito."))
        .catch(error => console.error("Error al guardar los datos:", error));
}
function updateData(index, updatedData) {
    fetch('./data/mov.json')
        .then(response => response.json())
        .then(data => {
            data[index] = updatedData; // Actualizar entrada
            return saveToFile(data); // Guardar datos actualizados
        })
        .then(() => alert("Datos actualizados con éxito."))
        .catch(error => console.error("Error al actualizar los datos:", error));
}

let previousData = null;

async function checkForUpdates() {
    try {
        const response = await fetch('/data/mov.json');
        const currentData = await response.json();
        
        if (JSON.stringify(previousData) !== JSON.stringify(currentData)) {
            updateTable(currentData);
            updateFormData(currentData);
            previousData = currentData;
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}


function updateTable(data) {
    const tableBody = document.querySelector('.right-pane table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.fecha_llegada}</td>
            <td>${item.hora_llegada}</td>
            <td>${item.fecha_salida || '-'}</td>
            <td>${item.Posición}</td>
            <td>${item.Conexión}</td>
            <td>${item.Teléfonos.join(', ')}</td>
            <td>${item.POC}</td>
        `;
        
        // Agregar evento click a la fila
        row.addEventListener('click', () => {
            highlightRow(row);
            loadRowData(item);
        });
        
        tableBody.appendChild(row);
    });
}

function updateFormData(data) {
    const nombreSelect = document.getElementById('nombre');
    nombreSelect.innerHTML = '<option>Selecciona una opción</option>';
    
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.nombre;
        option.textContent = item.nombre;
        nombreSelect.appendChild(option);
    });
}

// Iniciar polling cada 5 segundos
document.addEventListener('DOMContentLoaded', () => {
    checkForUpdates(); // Primera carga
    setInterval(checkForUpdates, 5000); // Actualizaciones cada 5 segundos
});
