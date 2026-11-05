/* ============================================================
   LÓGICA DEL FORMULARIO
   1. Valida el formato del correo.
   2. Envía el correo de bienvenida con EmailJS.
   3. Muestra mensajes de éxito o de error.
   Los datos de EmailJS se leen de config.js.
   ============================================================ */

(function () {
  "use strict";

  // Elementos de la página (los ids están definidos en index.html)
  const form = document.getElementById("subscribe-form");
  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("submit-btn");
  const message = document.getElementById("form-message");

  // Formato válido: algo@dominio.ext (la extensión con al menos 2 letras)
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

  const SUBMIT_TEXT = "Suscribirme";

  // ¿Ya se reemplazaron los tres datos de config.js?
  function isConfigured() {
    return Object.values(EMAILJS_CONFIG).every(function (value) {
      return typeof value === "string" && value.trim() !== "" && !value.startsWith("TU_");
    });
  }

  function showMessage(type, text) {
    message.textContent = text; // textContent evita insertar HTML
    message.className = "message message--" + type;
    message.hidden = false;
  }

  function clearMessage() {
    message.hidden = true;
    message.textContent = "";
    message.className = "message";
    emailInput.classList.remove("is-invalid");
    emailInput.removeAttribute("aria-invalid");
  }

  function markInvalid() {
    emailInput.classList.add("is-invalid");
    emailInput.setAttribute("aria-invalid", "true");
    emailInput.focus();
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Enviando..." : SUBMIT_TEXT;
  }

  // Inicializa EmailJS con la Public Key (solo si la librería cargó y hay configuración)
  if (typeof emailjs !== "undefined" && isConfigured()) {
    emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearMessage();

    const email = emailInput.value.trim();

    // 1) Validación del correo
    if (email === "") {
      showMessage("error", "Escribe tu correo electrónico.");
      markInvalid();
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      showMessage("error", "El correo no tiene un formato válido. Ejemplo: nombre@dominio.com");
      markInvalid();
      return;
    }

    // 2) Comprobaciones previas al envío
    if (typeof emailjs === "undefined") {
      showMessage("error", "No se pudo cargar la librería de EmailJS. Revisa tu conexión a internet.");
      return;
    }

    if (!isConfigured()) {
      showMessage("error", "Falta configurar EmailJS: completa Public Key, Service ID y Template ID en config.js.");
      return;
    }

    // 3) Envío con EmailJS
    setLoading(true);

    try {
      // "to_email" debe coincidir con la variable {{to_email}} de la plantilla en EmailJS
      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
        to_email: email
      });

      showMessage("success", "¡Listo! Te enviamos un correo de bienvenida a " + email + ".");
      form.reset();
    } catch (error) {
      // El detalle técnico queda en la consola del navegador (F12) para depurar
      console.error("Error de EmailJS:", error);
      showMessage("error", "No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.");
    } finally {
      setLoading(false);
    }
  });
})();
