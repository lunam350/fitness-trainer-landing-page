/* ============================================================
   FITCORE STUDIO — script.js
   Índice de este archivo:
   1. Menú hamburguesa (móvil)
   2. Calculadora de IMC
   3. Acordeón de preguntas frecuentes (FAQ)
   4. Validación del formulario de contacto
   ============================================================ */


/* ============================================================
   1. MENÚ HAMBURGUESA
   Idea: el botón alterna (toggle) una clase "is-open" tanto en
   el botón como en el menú. El CSS ya sabe cómo mostrar/ocultar
   y animar esos estados; JS solo decide CUÁNDO aplicarlos.
   ============================================================ */
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

navToggle.addEventListener("click", () => {
  // classList.toggle() añade la clase si no la tiene, o la quita si ya la tiene
  const abierto = navMenu.classList.toggle("is-open");
  navToggle.classList.toggle("is-open");

  // Actualizamos aria-expanded para que lectores de pantalla sepan el estado del menú
  navToggle.setAttribute("aria-expanded", abierto);
});

// Al hacer clic en un enlace del menú (en móvil), lo cerramos automáticamente
const navLinks = document.querySelectorAll(".navbar__link");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});


/* ============================================================
   2. CALCULADORA DE IMC
   Fórmula: IMC = peso (kg) / (estatura en metros)^2
   ============================================================ */
const bmiForm = document.getElementById("bmiForm");
const pesoInput = document.getElementById("peso");
const estaturaInput = document.getElementById("estatura");
const bmiResult = document.getElementById("bmiResult");

bmiForm.addEventListener("submit", (evento) => {
  // Evitamos que el formulario recargue la página (comportamiento por defecto de un <form>)
  evento.preventDefault();

  // Number() convierte el texto del input a número. Si el campo está vacío, da NaN.
  const peso = Number(pesoInput.value);
  const estatura = Number(estaturaInput.value);

  // --- Validación ---
  const pesoValido = pesoInput.value.trim() !== "" && peso > 0;
  const estaturaValida = estaturaInput.value.trim() !== "" && estatura > 0;

  if (!pesoValido || !estaturaValida) {
    mostrarResultadoIMC({
      valido: false,
      mensaje: "Por favor ingresa un peso y una estatura válidos (mayores a 0).",
    });
    return; // detenemos la función aquí, no seguimos calculando
  }

  // Convertimos la estatura de centímetros a metros antes de calcular
  const estaturaEnMetros = estatura / 100;
  const imc = peso / (estaturaEnMetros * estaturaEnMetros);

  // Determinamos la categoría según rangos estándar de IMC
  let categoria = "";
  let claseCategoria = "";
  let mensaje = "";

  if (imc < 18.5) {
    categoria = "Bajo peso";
    claseCategoria = "bmi__result-category--bajo";
    mensaje = "Estás por debajo del rango recomendado. Considera aumentar tu ingesta calórica junto a entrenamiento de fuerza.";
  } else if (imc < 25) {
    categoria = "Peso normal";
    claseCategoria = "bmi__result-category--normal";
    mensaje = "¡Estás dentro del rango saludable! Sigue así con una rutina constante.";
  } else if (imc < 30) {
    categoria = "Sobrepeso";
    claseCategoria = "bmi__result-category--sobrepeso";
    mensaje = "Estás por encima del rango recomendado. Un plan de entrenamiento y nutrición puede ayudarte a mejorar.";
  } else {
    categoria = "Obesidad";
    claseCategoria = "bmi__result-category--obesidad";
    mensaje = "Tu IMC indica obesidad. Te recomendamos empezar un plan guiado y, de ser posible, consultar a un profesional de salud.";
  }

  mostrarResultadoIMC({
    valido: true,
    imc: imc.toFixed(1), // redondeamos a 1 decimal
    categoria,
    claseCategoria,
    mensaje,
  });
});

// Función encargada de pintar el resultado (o el error) dentro de #bmiResult
function mostrarResultadoIMC(datos) {
  if (!datos.valido) {
    bmiResult.innerHTML = `<p class="bmi__result-message">${datos.mensaje}</p>`;
    bmiResult.classList.add("is-visible");
    return;
  }

  // template literal (backticks) nos permite insertar HTML con variables fácilmente
  bmiResult.innerHTML = `
    <p class="bmi__result-value">${datos.imc}</p>
    <p class="bmi__result-category ${datos.claseCategoria}">${datos.categoria}</p>
    <p class="bmi__result-message">${datos.mensaje}</p>
  `;

  bmiResult.classList.add("is-visible");
}


/* ============================================================
   3. ACORDEÓN FAQ
   Cada pregunta es un <button>. Al hacer clic, mostramos u
   ocultamos su respuesta y cerramos las demás (comportamiento
   de acordeón clásico: solo una respuesta abierta a la vez).
   ============================================================ */
const faqQuestions = document.querySelectorAll(".faq-item__question");

faqQuestions.forEach((boton) => {
  boton.addEventListener("click", () => {
    // .closest() busca hacia arriba en el HTML el primer ancestro con esa clase
    const faqItem = boton.closest(".faq-item");
    const yaEstabaAbierto = faqItem.classList.contains("is-open");

    // Primero cerramos todas las preguntas...
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector(".faq-item__question").setAttribute("aria-expanded", "false");
    });

    // ...y si la que clickeamos NO estaba abierta, la abrimos
    if (!yaEstabaAbierto) {
      faqItem.classList.add("is-open");
      boton.setAttribute("aria-expanded", "true");
    }
  });
});


/* ============================================================
   4. VALIDACIÓN DEL FORMULARIO DE CONTACTO
   Reglas:
   - Nombre: obligatorio
   - Email: obligatorio + formato válido
   - Mensaje: obligatorio
   No se envía a ningún servidor: solo simulamos el éxito.
   ============================================================ */
const contactForm = document.getElementById("contactForm");
const nombreInput = document.getElementById("nombre");
const emailInput = document.getElementById("email");
const mensajeInput = document.getElementById("mensaje");
const contactSuccess = document.getElementById("contactSuccess");

// Expresión regular simple para validar el formato básico de un email: algo@algo.algo
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

contactForm.addEventListener("submit", (evento) => {
  evento.preventDefault();

  // Limpiamos errores previos antes de volver a validar
  limpiarErrores();

  let formularioValido = true;

  if (nombreInput.value.trim() === "") {
    mostrarError(nombreInput, "errorNombre", "Por favor ingresa tu nombre.");
    formularioValido = false;
  }

  if (emailInput.value.trim() === "") {
    mostrarError(emailInput, "errorEmail", "Por favor ingresa tu email.");
    formularioValido = false;
  } else if (!EMAIL_REGEX.test(emailInput.value.trim())) {
    mostrarError(emailInput, "errorEmail", "Ingresa un email con un formato válido.");
    formularioValido = false;
  }

  if (mensajeInput.value.trim() === "") {
    mostrarError(mensajeInput, "errorMensaje", "Cuéntanos brevemente tu objetivo.");
    formularioValido = false;
  }

  // Si algún campo falló, no continuamos (no mostramos el mensaje de éxito)
  if (!formularioValido) {
    return;
  }

  // --- Éxito (ficticio, no se envía a ningún servidor) ---
  contactSuccess.textContent = "¡Gracias! Tu mensaje fue enviado correctamente. Te contactaremos pronto.";
  contactSuccess.classList.add("is-visible");

  contactForm.reset(); // limpia todos los campos del formulario
});

// Marca un campo como inválido: le agrega la clase de error y muestra el texto de ayuda
function mostrarError(input, idSpanError, mensaje) {
  input.classList.add("input-error");
  document.getElementById(idSpanError).textContent = mensaje;
}

// Quita todos los estados de error antes de una nueva validación
function limpiarErrores() {
  [nombreInput, emailInput, mensajeInput].forEach((input) => {
    input.classList.remove("input-error");
  });

  ["errorNombre", "errorEmail", "errorMensaje"].forEach((id) => {
    document.getElementById(id).textContent = "";
  });

  contactSuccess.classList.remove("is-visible");
}
