// Reserva: arma el enlace al motor Cloudbeds en español con las fechas elegidas.
// Restricción del cliente: la disponibilidad real vive en Cloudbeds; la web nunca la inventa.
const CLOUDBEDS = 'https://hotels.cloudbeds.com/es/reservation/8ATgzL';

const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const sumarDias = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };

function urlReserva(checkin, checkout, adults) {
  const q = new URLSearchParams({ checkin, checkout, adults, currency: 'clp' });
  return `${CLOUDBEDS}?${q}`;
}

const form = document.getElementById('reservar');
const entrada = document.getElementById('checkin');
const salida = document.getElementById('checkout');
const adultos = document.getElementById('adults');
const error = document.getElementById('error-fechas');

const hoy = iso(new Date());
entrada.min = hoy;
entrada.value = sumarDias(hoy, 1);
salida.min = sumarDias(entrada.value, 1);
salida.value = sumarDias(entrada.value, 2);

entrada.addEventListener('change', () => {
  if (!entrada.value) return;
  salida.min = sumarDias(entrada.value, 1);
  if (!salida.value || salida.value <= entrada.value) salida.value = sumarDias(entrada.value, 1);
});

form.addEventListener('submit', e => {
  e.preventDefault();
  error.hidden = true;
  if (!entrada.value || !salida.value || entrada.value < hoy || salida.value <= entrada.value) {
    error.textContent = 'Revise las fechas: la salida debe ser posterior a la llegada y la llegada no puede ser anterior a hoy.';
    error.hidden = false;
    return;
  }
  window.open(urlReserva(entrada.value, salida.value, adultos.value), '_blank', 'noopener');
});

// "Ver fechas" de cada habitación: lleva al formulario con los huéspedes de esa habitación.
document.querySelectorAll('[data-ir-reserva]').forEach(a => a.addEventListener('click', () => {
  adultos.value = a.dataset.irReserva;
  setTimeout(() => entrada.focus({ preventScroll: true }), 400);
}));

// Cabecera fija y barra de reserva en celular al bajar de la portada.
const cabecera = document.getElementById('cabecera');
const barra = document.querySelector('.barra-movil');
new IntersectionObserver(([e]) => {
  cabecera.classList.toggle('fija', !e.isIntersecting);
}, { rootMargin: '-80px 0px 0px 0px' }).observe(document.querySelector('.portada-txt'));
new IntersectionObserver(([e]) => {
  barra.classList.toggle('visible', !e.isIntersecting && e.boundingClientRect.top < 0);
}).observe(form);

// Menú en celular.
const btnMenu = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
const cerrarMenu = () => { menu.classList.remove('abierto'); cabecera.classList.remove('menu-abierto'); btnMenu.setAttribute('aria-expanded', 'false'); btnMenu.setAttribute('aria-label', 'Abrir menú'); };
btnMenu.addEventListener('click', () => {
  const abrir = !menu.classList.contains('abierto');
  menu.classList.toggle('abierto', abrir);
  cabecera.classList.toggle('menu-abierto', abrir);
  btnMenu.setAttribute('aria-expanded', String(abrir));
  btnMenu.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrarMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

// Autocomprobación del enlace (se ve en la consola del navegador).
console.assert(
  urlReserva('2026-12-01', '2026-12-03', '2') === `${CLOUDBEDS}?checkin=2026-12-01&checkout=2026-12-03&adults=2&currency=clp`,
  'urlReserva arma mal el enlace a Cloudbeds'
);
console.assert(sumarDias('2026-12-31', 1) === '2027-01-01', 'sumarDias falla al cambiar de año');
