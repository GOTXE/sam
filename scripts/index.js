// Al inicio del archivo
const solariSound = new Audio('./assets/sound/solari.mp3');
solariSound.volume = 1; // Ajustar volumen al 0.3 = 30% 1 = 100%

fetch('./data/mov.json') // Cargar el archivo JSON
    .then(response => response.json())
    .then(data => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

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
            if (dateB.toDateString() === tomorrow.toDateString()) return 1;

            if (dateA > tomorrow && dateB > tomorrow) {
                return dateA - dateB;
            }
            if (dateA > tomorrow) return -1;
            if (dateB > tomorrow) return 1;

            if (dateA < today && dateB < today) {
                if (salidaA && salidaB) return salidaA - salidaB;
                if (salidaA) return -1;
                if (salidaB) return 1;
                return dateA - dateB;
            }

            if (dateA < today && !salidaA) return 1;
            if (dateB < today && !salidaB) return -1;

            return 0;
        });

        const tbody = document.getElementById('table-body');

        // Función para envolver caracteres
        const wrapCharacters = (text) => {
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
        };

        // Renderizar los datos en la tabla línea por línea
        const renderTable = (data) => {
            tbody.innerHTML = ''; // Limpiar el contenido existente
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);

            data.forEach((item, index) => {
                setTimeout(() => {
                    const row = document.createElement('tr');
                    const itemDate = parseDate(item.fecha_llegada);

                    // Reproducir sonido
                    solariSound.currentTime = 0; // Reiniciar audio
                    solariSound.play().catch(e => console.log('Error reproduciendo audio:', e));

                    // Determinar la clase de la fila
                    let rowClass = '';
                    if (itemDate.toDateString() === today.toDateString()) {
                        rowClass = 'row-today';
                    } else if (itemDate.toDateString() === tomorrow.toDateString()) {
                        rowClass = 'row-tomorrow';
                    }

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
                }, index * 500); // Retraso de 500ms entre cada fila
            });
        };

        // Llamar a la función renderTable con los datos
        renderTable(data);
    })
    .catch(error => console.error('Error al cargar el JSON:', error));
    
    // Cambiar tamaño de la letra de Titulo
    document.addEventListener('DOMContentLoaded', () => {
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