// scripts/login.js

// Hash de la contraseña (SHA-256 de "123456")
const PASSWORD_HASH = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";

document.addEventListener("DOMContentLoaded", () => {
    const loginOverlay = document.getElementById('login-overlay');
    const mainContent = document.getElementById('main-content');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    // Función para obtener la fecha actual en formato YYYY-MM-DD
    function getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // Verificar si el usuario ya ha iniciado sesión hoy
    const loggedInDate = localStorage.getItem('loggedInDate');
    const today = getTodayDate();

    if (loggedInDate === today) {
        // Usuario ya ha iniciado sesión hoy
        loginOverlay.style.display = 'none';
        mainContent.style.display = 'block';
    } else {
        // Mostrar overlay de login
        loginOverlay.style.display = 'flex';
        mainContent.style.display = 'none';
    }

    // Función para convertir ArrayBuffer a Hex String
    function bufferToHex(buffer) {
        const hashArray = Array.from(new Uint8Array(buffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Función para verificar la contraseña
    async function checkPassword() {
        const enteredPassword = passwordInput.value.trim();
        if (!enteredPassword) {
            loginError.textContent = "Por favor, ingresa la contraseña.";
            return;
        }

        try {
            // Generar el hash SHA-256 de la contraseña ingresada
            const encoder = new TextEncoder();
            const data = encoder.encode(enteredPassword);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashHex = bufferToHex(hashBuffer);

            if (hashHex === PASSWORD_HASH) {
                // Contraseña correcta
                localStorage.setItem('loggedInDate', today);
                loginOverlay.style.display = 'none';
                mainContent.style.display = 'block';
            } else {
                // Contraseña incorrecta
                loginError.textContent = "Contraseña incorrecta. Inténtalo de nuevo.";
                passwordInput.value = ''; // Opcional: Limpiar el campo de contraseña
            }
        } catch (error) {
            console.error("Error al verificar la contraseña:", error);
            loginError.textContent = "Ocurrió un error. Por favor, intenta nuevamente.";
        }
    }

    // Manejar el evento de clic en el botón de login
    loginButton.addEventListener('click', checkPassword);

    // Permitir iniciar sesión presionando "Enter"
    passwordInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            checkPassword();
        }
    });
});
