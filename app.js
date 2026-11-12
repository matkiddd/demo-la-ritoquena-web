// Reserva: arma el enlace al motor Cloudbeds en español con las fechas elegidas.
// Restricción del cliente: la disponibilidad real vive en Cloudbeds; la web nunca la inventa.
const CLOUDBEDS = 'https://hotels.cloudbeds.com/es/reservation/8ATgzL';

const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const sumarDias = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const fechasValidas = (llegada, salida, hoy) => Boolean(llegada && salida && llegada >= hoy && salida > llegada);

function urlReserva(checkin, checkout, adults) {
  const q = new URLSearchParams({ checkin, checkout, adults, currency: 'clp' });
  return `${CLOUDBEDS}?${q}`;
}

const form = document.getElementById('form-reserva');
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
  if (!fechasValidas(entrada.value, salida.value, hoy)) {
    error.textContent = 'Revisa las fechas: la llegada no puede ser anterior a hoy y la salida debe ser posterior a la llegada.';
    error.hidden = false;
    return;
  }
  window.open(urlReserva(entrada.value, salida.value, adultos.value), '_blank', 'noopener');
});

// "Ver disponibilidad" de cada habitación: solo ajusta los huéspedes; la habitación se elige en Cloudbeds.
document.querySelectorAll('[data-adultos]').forEach(a => a.addEventListener('click', () => {
  adultos.value = a.dataset.adultos;
  setTimeout(() => entrada.focus({ preventScroll: true }), 500);
}));

// Cabecera fija al salir de la portada (también al saltar a #reservar, justo debajo);
// la barra del celular se esconde cuando se ve el formulario.
const cab = document.getElementById('cab');
const barra = document.getElementById('barra-movil');
new IntersectionObserver(([e]) => cab.classList.toggle('fija', !e.isIntersecting), { rootMargin: '-100px 0px 0px 0px' })
  .observe(document.querySelector('.portada'));
new IntersectionObserver(([e]) => barra.classList.toggle('oculta', e.isIntersecting))
  .observe(document.getElementById('reservar'));

// Menú a pantalla completa: fuera del tabulado cuando está cerrado (hidden), Escape cierra y el foco vuelve al botón.
const btnMenu = document.querySelector('.menu-btn');
const panel = document.getElementById('menu');
function abrirMenu() {
  panel.hidden = false;
  document.body.classList.add('menu-abierto');
  btnMenu.setAttribute('aria-expanded', 'true');
  panel.querySelector('nav a').focus();
}
function cerrarMenu(devolverFoco = true) {
  if (panel.hidden) return;
  panel.hidden = true;
  document.body.classList.remove('menu-abierto');
  btnMenu.setAttribute('aria-expanded', 'false');
  if (devolverFoco) btnMenu.focus();
}
btnMenu.addEventListener('click', abrirMenu);
panel.querySelector('.menu-cerrar').addEventListener('click', () => cerrarMenu());
panel.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => cerrarMenu(false)));
document.addEventListener('keydown', e => {
  if (panel.hidden) return;
  if (e.key === 'Escape') return cerrarMenu();
  if (e.key !== 'Tab') return;
  const focos = panel.querySelectorAll('a, button');
  const primero = focos[0], ultimo = focos[focos.length - 1];
  if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
  else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
});

// Galerías de habitaciones: botones anterior/siguiente, flechas del teclado y contador.
document.querySelectorAll('[data-galeria]').forEach(g => {
  const fotos = [...g.querySelectorAll('.gal-marco img')];
  const cont = g.querySelector('.gal-cont');
  let i = 0;
  const ir = n => {
    fotos[i].hidden = true;
    i = (n + fotos.length) % fotos.length;
    fotos[i].hidden = false;
    cont.textContent = `${i + 1} / ${fotos.length}`;
  };
  g.querySelector('.gal-ant').addEventListener('click', () => ir(i - 1));
  g.querySelector('.gal-sig').addEventListener('click', () => ir(i + 1));
  g.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') ir(i - 1);
    if (e.key === 'ArrowRight') ir(i + 1);
  });
});

// Aparición suave de los bloques al bajar. Sin JS o con "reducir movimiento", todo queda visible desde el inicio.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const verBloque = new IntersectionObserver(entradas => entradas.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visto');
    verBloque.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('main section:not(.portada):not(.reserva) .contenedor > *').forEach(el => {
    el.classList.add('revelar');
    verBloque.observe(el);
  });
}

// Autocomprobación (se ve en la consola del navegador).
console.assert(
  urlReserva('2026-12-01', '2026-12-03', '2') === `${CLOUDBEDS}?checkin=2026-12-01&checkout=2026-12-03&adults=2&currency=clp`,
  'urlReserva arma mal el enlace a Cloudbeds'
);
console.assert(sumarDias('2026-12-31', 1) === '2027-01-01', 'sumarDias falla al cambiar de año');
console.assert(sumarDias('2026-11-30', 1) === '2026-12-01', 'sumarDias falla al cambiar de mes');
console.assert(!fechasValidas('2026-11-10', '2026-11-12', '2026-11-11'), 'acepta una llegada pasada');
console.assert(!fechasValidas('2026-12-05', '2026-12-05', '2026-11-11'), 'acepta salida igual a la llegada');
console.assert(!fechasValidas('2026-12-05', '2026-12-04', '2026-11-11'), 'acepta salida anterior a la llegada');
console.assert(fechasValidas('2026-12-31', '2027-01-02', '2026-11-11'), 'rechaza un rango válido con cambio de año');
