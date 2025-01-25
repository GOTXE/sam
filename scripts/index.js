// Función para cargar el contenido después de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    const solariSound = new Audio('./assests/sound/solari_1s.mp3');
    solariSound.volume = 1; // Ajustar volumen al 100%

    // Verificar si el permiso ya fue otorgado
    if (localStorage.getItem('audioPermission') === 'granted') {
        enableAudio(solariSound);
    } else {
        requestAudioPermission(solariSound);
    }
    // Cargar datos luego de otorgar el permiso
    fetch('./data/mov.json') // Cargar el archivo JSON
        .then(response => response.json())
        .then(data => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            // Función para parsear la fecha
            const parseDate = (dateString) => {
                const [day, month, year] = dateString.split('/');
                return new Date(year, month - 1, day);
            };

            // Ordenar los datos
            data.sort((a, b) => {
                const dateA = parseDate(a.fecha_llegada);
                const dateB = parseDate(b.fecha_llegada);

                const salidaA = a.fecha_salida ? parseDate(a.fecha_salida) : null;
                const salidaB = b.fecha_salida ? parseDate(b.fecha_salida) : null;

                if (dateA.toDateString() === today.toDateString()) {
                    if (dateB.toDateString() === today.toDateString()) {
                        return a.hora_llegada.localeCompare(b.hora_llegada);
                    }
                    return -1;
                }
                if (dateB.toDateString() === today.toDateString()) return 1;

                if (dateA.toDateString() === tomorrow.toDateString()) {
                    if (dateB.toDateString() === tomorrow.toDateString()) {
                        return a.hora_llegada.localeCompare(b.hora_llegada);
                    }
                    return -1;
                }

                return dateA - dateB;
            });

            if (data.length > 0) {
                renderTable(data, solariSound);
            }
        })
        .catch(error => console.error('Error al cargar el JSON:', error));
    
    // Cambiar tamaño de la letra de Titulo
    const h1 = document.querySelector('h1');
    const articles = ['de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'unos', 'unas'];
    
    h1.innerHTML = h1.textContent.split(' ').map(word => {
        if (articles.includes(word.toLowerCase())) {
            return word;
        } else {
            return `<span class="first-letter">${word.charAt(0)}</span>${word.slice(1)}`;
        }
    }).join(' ');
});

// Función para solicitar permiso de audio
function requestAudioPermission(solariSound) {
    const permissionButton = document.createElement('button');
    permissionButton.textContent = 'Permitir sonido';
    permissionButton.style.position = 'fixed';
    permissionButton.style.top = '10px';
    permissionButton.style.right = '10px';
    document.body.appendChild(permissionButton);

    permissionButton.addEventListener('click', () => {
        solariSound.play().then(() => {
            localStorage.setItem('audioPermission', 'granted');
            permissionButton.remove();
            // Cargar datos después de otorgar permiso
            fetch('./data/mov.json')
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        renderTable(data, solariSound);
                    }
                })
                .catch(error => console.error('Error al cargar el JSON:', error));
        }).catch(error => {
            console.error('Error al reproducir sonido:', error);
        });
    });
}

// Función para habilitar el audio
function enableAudio(solariSound) {
    solariSound.play().catch(error => {
        console.error('Error al reproducir sonido:', error);
    });
}

// Función para renderizar la tabla
function renderTable(data, solariSound) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) {
        console.error('tbody no encontrado');
        return;
    }
    tbody.innerHTML = ''; // Limpiar el contenido existente
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const delayPerRow = 500; // Retraso en milisegundos entre cada línea
    const totalDuration = data.length * delayPerRow + 3800; // Duración total en milisegundos


    // Reproducir sonido en bucle
    solariSound.loop = true;
    solariSound.currentTime = 0;
    solariSound.play().catch(e => console.log('Error reproduciendo audio:', e));

    data.forEach((item, index) => { 
        setTimeout(() => {
            const row = document.createElement('tr');
            const itemDate = parseDate(item.fecha_llegada);

            // Determinar la clase de la fila
            let rowClass = '';
            if (itemDate.toDateString() === today.toDateString()) {
                rowClass = 'row-today';
            } else if (itemDate.toDateString() === tomorrow.toDateString()) {
                rowClass = 'row-tomorrow';
            }
            // Crear la fila de la tabla con los datos
            row.className = rowClass;
            row.innerHTML = `
                <td>${wrapCharacters(item.nombre)}</td>
                <td>${wrapCharacters(item.fecha_llegada.split('/').slice(0, 2).join('/'))}</td>
                <td>${wrapCharacters(item.hora_llegada)}</td>
                <td>${wrapCharacters(item.fecha_salida ? item.fecha_salida.split('/').slice(0, 2).join('/') : 'TBD')}</td>
                <td>${wrapCharacters(item.Posición)}</td>
                <td>${wrapCharacters(item.Conexión)}</td>
                <td>${wrapCharacters(item.Teléfonos.join(', '))}</td>
                <td>${wrapCharacters(item.POC)}</td>
            `;
            tbody.appendChild(row);

        } , index * 500); // Retraso de 500ms entre cada fila
    });

    // Detener el sonido después de renderizar todas las filas
    setTimeout(() => {
        solariSound.loop = false; // Desactivar el bucle
        solariSound.pause(); // Pausar el sonido
    }, totalDuration); // Tiempo total para la reproducción
}

// Función para convertir una cadena de fecha en un objeto Date
function parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
}

// Función para envolver las letras con animación
function wrapCharacters(text) {
    return text.split('').map((char, index) => {
        let charClass;
        if (char === ' ') {
            charClass = 'letter-blank';
        } else if (char === ':') {
            charClass = 'letter-colon';
        } else if (char === '-') {
            charClass = 'letter-dash';
        } else if (char === '/') {
            charClass = 'letter-slash';
        } else {
            charClass = `letter letter-${char.toUpperCase()}`;
        }
        return `<span class="${charClass}" style="animation-delay: ${index * 0.1}s;"></span>`;
    }).join('');
}