/* Mis gastos — web app
   Lee tus movimientos desde tu planilla de Google (el script "Mis gastos") y los muestra como una app.
   Hecho por Facundo Burgos · @facuuuburgos */
'use strict';

const VERSION = '1.0.0';
const PLANILLA = 'https://docs.google.com/spreadsheets/d/1lTUp5c3YC7W_cGC-nuNI-y2ov4PR3kuiK0ygVX6-8Ac/edit';
const INICIO_NORMAL = '2026-09'; // "lo normal" = promedio de los últimos 3 meses completos desde acá
const INICIO_DATOS = '2026-06';
const FIJAS = ['Gastos comunes', 'Muay Thai', 'Gimnasio', 'Suscripciones', 'Cuentas y servicios', 'Peluquería', 'Psicóloga'];
const SIN_RASTRO = ['Efectivo (retiros)', 'Transferencias', 'Prex (sin detalle)', 'Otros / sin identificar'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESC = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/* ---------------- íconos ---------------- */
const P = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  car: '<path d="M5 17h14M6 17v2M18 17v2M4 13l2-5a2 2 0 0 1 2-1h8a2 2 0 0 1 2 1l2 5v4H4z"/><circle cx="8" cy="14" r=".6"/><circle cx="16" cy="14" r=".6"/>',
  bag: '<path d="M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0"/>',
  cart: '<circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/><path d="M3 4h2l2.5 11h10.5l2-8H6.3"/>',
  fork: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M17 3c-2 2-2 6 0 8v10"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  game: '<path d="M6 9h12a4 4 0 0 1 3.8 5.2l-.9 2.7a2 2 0 0 1-3.4.7L15 15H9l-2.5 2.6a2 2 0 0 1-3.4-.7l-.9-2.7A4 4 0 0 1 6 9zM8 11v3M6.5 12.5h3"/><circle cx="16" cy="12" r=".6"/>',
  gym: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  paw: '<circle cx="7" cy="10" r="1.6"/><circle cx="11" cy="6.5" r="1.6"/><circle cx="15" cy="6.5" r="1.6"/><circle cx="18" cy="10" r="1.6"/><path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 2-4 2s-4 0-4-2z"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H3zM14 6v12"/>',
  health: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  fuel: '<path d="M4 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M3 20h12M4 10h10M14 8l3 2v7a1.5 1.5 0 0 0 3 0V9l-3-3"/>',
  shop: '<path d="M4 8h16l-1.5 11a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM8 8V6a4 4 0 0 1 8 0v2"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM9 21v-6h6v6"/>',
  fist: '<path d="M7 11V7a1.5 1.5 0 0 1 3 0v4M10 10V6a1.5 1.5 0 0 1 3 0v4M13 10V7a1.5 1.5 0 0 1 3 0v4M16 10a1.5 1.5 0 0 1 3 0v3a7 7 0 0 1-7 7h-1a5 5 0 0 1-5-5v-3a1.5 1.5 0 0 1 3 0"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
  dot: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4M12 16h.01"/>',
  up: '<path d="M4 17l6-6 4 4 6-6M14 9h6v6"/>',
  down: '<path d="M4 7l6 6 4-4 6 6M14 15h6V9"/>',
  coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7M9 14v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.7-2.7-3-6-3"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  plane: '<path d="M10.5 13.5L3 11l1.5-1.5 8 1L17 6a2.1 2.1 0 0 1 3 3l-4.5 4.5 1 8L15 23l-2.5-7.5L9 19v3l-2 1-1-4-4-1 1-2h3z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3 8 4s0 4 4 4zM12 8s1.5-5 4-4 0 4-4 4z"/>',
  in: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
  family: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21v-2a6 6 0 0 1 12 0v2M14 21v-1a4 4 0 0 1 8 0v1"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7"/>',
  shirt: '<path d="M8 3l4 3 4-3 5 4-3 4-2-1v11H8V10l-2 1-3-4z"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  share: '<path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
  sheet: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  gem: '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 18M15 3l-3 18"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M12 20h.01"/>'
};
const ic = (n, cls) => `<svg ${cls ? `class="${cls}"` : ''} viewBox="0 0 24 24" ${P} aria-hidden="true">${ICON[n] || ICON.dot}</svg>`;

/* categorías: nombre para mostrar, ícono, grupo para la distribución */
const CAT = {
  'Uber / Cabify': ['Transporte', 'car', 'Transporte'], 'ANCAP (estación)': ['ANCAP', 'fuel', 'Transporte'],
  'Delivery': ['Delivery', 'bag', 'Comida'], 'Súper y almacén': ['Súper y almacén', 'cart', 'Comida'], 'Comer afuera': ['Comer afuera', 'fork', 'Comida'],
  'Gastos comunes': ['Gastos comunes', 'home', 'Vivienda'], 'Cuentas y servicios': ['Cuentas y servicios', 'receipt', 'Vivienda'], 'Hogar': ['Hogar', 'home', 'Vivienda'],
  'Suscripciones': ['Suscripciones', 'play', 'Ocio'], 'Videojuegos': ['Videojuegos', 'game', 'Ocio'], 'Salidas y entradas': ['Salidas', 'ticket', 'Ocio'], 'Viajes': ['Viajes', 'plane', 'Ocio'],
  'Música / trabajo': ['Música y trabajo', 'music', 'Otros'],
  'Gimnasio': ['Gimnasio', 'gym', 'Salud'], 'Muay Thai': ['Muay thai', 'fist', 'Salud'], 'Peluquería': ['Peluquería', 'scissors', 'Salud'], 'Salud y farmacia': ['Salud', 'health', 'Salud'], 'Psicóloga': ['Psicóloga', 'brain', 'Salud'],
  'Mascotas': ['Mascotas', 'paw', 'Otros'], 'Compras': ['Compras', 'shop', 'Otros'], 'Ropa': ['Ropa', 'shirt', 'Otros'], 'Educación': ['Educación', 'book', 'Otros'], 'Regalos': ['Regalos', 'gift', 'Otros'], 'Familia': ['Familia', 'family', 'Otros'],
  'Efectivo (retiros)': ['Efectivo', 'cash', 'Otros'], 'Prex (sin detalle)': ['Prex', 'card', 'Otros'], 'Transferencias': ['Transferencias', 'swap', 'Otros'], 'Otros / sin identificar': ['Otros', 'dot', 'Otros'],
  'Pago de tarjeta': ['Pago de tarjeta', 'receipt', 'Otros'], 'Rechazado': ['Rechazado', 'x', 'Otros'], 'Ingreso': ['Ingreso', 'in', 'Otros']
};
const GRUPOS = [['Vivienda', 'var(--c1)'], ['Comida', 'var(--c3)'], ['Transporte', 'var(--c2)'], ['Salud', 'var(--c4)'], ['Ocio', 'var(--c6)'], ['Otros', 'var(--c5)']];
const catN = (c) => (CAT[c] || [c])[0];
const catI = (c) => (CAT[c] || [0, 'dot'])[1];
const catG = (c) => (CAT[c] || [0, 0, 'Otros'])[2];

/* ---------------- utilidades ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 });
const money = (v) => (v < 0 ? '-$ ' : '$ ') + fmt.format(Math.abs(Math.round(v)));
const moneyS = (v) => (v > 0 ? '+$ ' : v < 0 ? '-$ ' : '$ ') + fmt.format(Math.abs(Math.round(v)));
const pct = (v) => (Math.round(v * 100)) + '%';
const sum = (a, f) => a.reduce((s, x) => s + (f ? f(x) : x), 0);
const mean = (a, f) => (a.length ? sum(a, f) / a.length : 0);
const r100 = (v) => Math.round(v / 100) * 100;
const r1000 = (v) => Math.round(v / 1000) * 1000;
const mesNombre = (ym) => MESES[+ym.slice(5, 7) - 1] + ' ' + ym.slice(0, 4);
const mesSolo = (ym) => MESES[+ym.slice(5, 7) - 1];
const mesCorto = (ym) => MESC[+ym.slice(5, 7) - 1];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const diasMes = (ym) => new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0).getDate();
const mesAnt = (ym) => { let y = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1; if (!m) { m = 12; y--; } return y + '-' + String(m).padStart(2, '0'); };
const mesSig = (ym) => { let y = +ym.slice(0, 4), m = +ym.slice(5, 7) + 1; if (m > 12) { m = 1; y++; } return y + '-' + String(m).padStart(2, '0'); };
const hoyUY = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 16).replace('T', ' ');
const limpiar = (c) => {
  const m = String(c).toUpperCase();
  if (/PEDIDOSYA/.test(m)) return /ENVIO| E$/.test(m) ? 'PedidosYa · envío' : /PROPINA| P$/.test(m) ? 'PedidosYa · propina' : 'PedidosYa';
  if (/UBER/.test(m)) return 'Uber'; if (/CABIFY/.test(m)) return 'Cabify';
  if (/APPLE/.test(m)) return 'Apple'; if (/SPOTIFY/.test(m)) return 'Spotify'; if (/HBO/.test(m)) return 'HBO Max';
  if (/ANTHROPIC/.test(m)) return 'Claude'; if (/PARAMOUNT/.test(m)) return 'Paramount+'; if (/SMARTFIT/.test(m)) return 'Smart Fit';
  if (/RETIRO/.test(m)) return 'Retiro de efectivo';
  return String(c).replace(/^DLO\*|^MERPAGO\*/i, '').replace(/\s+VIS\d$/i, '').toLowerCase().replace(/(^|\s)\S/g, (s) => s.toUpperCase());
};

/* ---------------- guardado local ---------------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('mg-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('mg-' + k, JSON.stringify(v)); } catch (e) { /* sin espacio */ } }
};
const prefs = Object.assign({ ahorro: 20, extra: 0, nombre: 'Facu', nivel: 'ideal' }, LS.get('prefs', {}));
const guardarPrefs = () => LS.set('prefs', prefs);
const sim = Object.assign({ aumento: 0, uber: 0, deli: 0, afuera: 0, fijo: 0, subs: [] }, LS.get('sim', {}));
const guardarSim = () => LS.set('sim', sim);

/* ---------------- estado ---------------- */
const S = { raw: null, rows: [], ing: [], obj: [], dolar: 40.2, hoy: hoyUY(), mes: null, tab: 'inicio', periodo: 6, filtro: 'todos', busca: '', abiertos: {}, planTab: 'calc', simTab: 'esc', cargando: false, error: '', at: 0 };

function preparar(raw) {
  S.raw = raw;
  S.dolar = +raw.dolar || 40.2;
  S.hoy = String(raw.hoy || hoyUY());
  const rows = (raw.movimientos || []).map((r) => ({
    id: String(r.id), fecha: String(r.fecha || '').slice(0, 16), mes: String(r.mes || r.fecha || '').slice(0, 7), banco: String(r.banco || ''), tipo: String(r.tipo || ''),
    comercio: String(r.comercio || ''), cat: String(r.categoria || ''), moneda: String(r.moneda || 'UYU'), monto: +r.monto || 0, gasto: +r.gasto_uyu || 0,
    puntual: +r.puntual ? 1 : 0, frecuencia: String(r.frecuencia || ''), fijoDesde: String(r.fijo_desde || ''), nota: String(r.a_revisar || '')
  })).filter((r) => r.mes.length === 7);
  S.rows = rows;
  S.ing = rows.filter((r) => r.tipo === 'Ingreso').map((r) => Object.assign({}, r, { valor: r.monto * (r.moneda === 'USD' ? S.dolar : 1) }));
  S.obj = (raw.objetivos || []).map((o) => ({ id: String(o.id), nombre: String(o.nombre || 'Objetivo'), meta: +o.meta || 0, tengo: +o.tengo || 0, fecha: String(o.fecha || ''), icono: String(o.icono || 'coins') }));
  S.registro = raw.registro || [];
  const mh = S.hoy.slice(0, 7);
  if (!S.mes || !mesesDisponibles().includes(S.mes)) S.mes = mesesDisponibles().includes(mh) ? mh : mesesDisponibles().slice(-1)[0];
}

/* ---------------- cálculos ---------------- */
const mesHoy = () => S.hoy.slice(0, 7);
const mesesDisponibles = () => [...new Set(S.rows.filter((r) => r.gasto !== 0 || r.tipo === 'Ingreso').map((r) => r.mes))].filter((m) => m >= INICIO_DATOS && m <= mesHoy()).sort();
const deMes = (m) => S.rows.filter((r) => r.mes === m);
const gastoDe = (rs) => sum(rs, (r) => r.gasto);
const habitual = (r) => !r.puntual;
const esFijo = (r) => (r.frecuencia ? r.frecuencia === 'Fijo' : FIJAS.includes(r.cat));
const claveFijo = (r) => (r.tipo === 'Transferencia' || FIJAS.includes(r.cat) ? r.cat : r.comercio);
const ingresosDe = (m) => sum(S.ing.filter((r) => r.mes === m), (r) => r.valor);
const wiseDe = (m) => sum(S.ing.filter((r) => r.mes === m && r.banco === 'Wise'), (r) => r.valor);

function ctx(m) {
  const enCurso = m === mesHoy();
  const dm = diasMes(m);
  const dia = enCurso ? Math.max(1, +S.hoy.slice(8, 10)) : dm;
  const completos = mesesDisponibles().filter((x) => x < m && x >= INICIO_NORMAL).slice(-3);
  return { m, enCurso, dm, dia, completos };
}
function proyFijos(c) {
  const hab = deMes(c.m).filter((r) => habitual(r) && esFijo(r));
  let total = gastoDe(hab);
  if (!c.enCurso) return total;
  const claves = [...new Set(S.rows.filter((r) => c.completos.includes(r.mes) && esFijo(r) && r.gasto > 0).map(claveFijo))];
  claves.forEach((k) => {
    const prom = mean(c.completos, (m) => gastoDe(deMes(m).filter((r) => habitual(r) && esFijo(r) && claveFijo(r) === k)));
    total += Math.max(0, prom - gastoDe(hab.filter((r) => claveFijo(r) === k)));
  });
  return total;
}
const proyVariable = (c) => { const v = gastoDe(deMes(c.m).filter((r) => habitual(r) && !esFijo(r))); return c.enCurso ? v / c.dia * c.dm : v; };
const proyHabitual = (c) => proyFijos(c) + proyVariable(c);

function resumen(m) {
  const c = ctx(m);
  const rs = deMes(m);
  const gastado = gastoDe(rs);
  const hab = gastoDe(rs.filter(habitual));
  const puntual = gastado - hab;
  const proyeccion = c.enCurso ? proyHabitual(c) + puntual : gastado;
  const normal = mean(c.completos, (x) => gastoDe(deMes(x).filter(habitual)));
  const ant = mesAnt(m);
  const antMismo = gastoDe(deMes(ant).filter((r) => +r.fecha.slice(8, 10) <= c.dia));
  const variacion = antMismo ? gastado / antMismo - 1 : 0;
  const ingresos = ingresosDe(m);
  return { m, c, gastado, hab, puntual, proyeccion, normal, variacion, ingresos, wise: wiseDe(m), saldo: ingresos - gastado, diario: hab / c.dia };
}

function categorias(m) {
  const c = ctx(m);
  const cats = [...new Set(S.rows.filter((r) => r.gasto > 0 && (r.mes === m || c.completos.includes(r.mes))).map((r) => r.cat))];
  return cats.map((cat) => {
    const de = (x) => gastoDe(deMes(x).filter((r) => r.cat === cat && habitual(r)));
    const promedio = mean(c.completos, de);
    const este = de(m);
    const proyectado = !c.enCurso ? este : FIJAS.includes(cat) ? Math.max(este, promedio) : este / c.dia * c.dm;
    return { cat, promedio, este, proyectado };
  }).filter((r) => r.promedio > 0 || r.este > 0).sort((a, b) => b.este - a.este);
}

function fijosLista(m) {
  const c = ctx(m);
  const meses = c.completos.length ? c.completos : [mesAnt(m)];
  const v = S.rows.filter((r) => habitual(r) && esFijo(r) && r.gasto > 0);
  const nombre = (r) => (FIJAS.includes(r.cat) && r.cat !== 'Suscripciones' && r.cat !== 'Cuentas y servicios' ? r.cat : limpiar(r.comercio));
  const g = {};
  v.forEach((r) => { const k = nombre(r); (g[k] = g[k] || []).push(r); });
  const desde2 = mesAnt(mesAnt(m));
  return Object.entries(g).map(([gasto, rs]) => {
    const desde = rs.map((r) => r.fijoDesde).filter(Boolean).sort()[0] || '';
    return { gasto, cat: rs[0].cat, porMes: sum(rs.filter((r) => meses.includes(r.mes)), (r) => r.gasto) / meses.length, desde, nuevo: !!(desde && desde >= desde2 && !FIJAS.includes(rs[0].cat)) };
  }).filter((r) => r.porMes > 0 || r.nuevo).sort((a, b) => b.porMes - a.porMes);
}

function suscripciones(m) {
  const c = ctx(m);
  const n = (x) => (/spotify/i.test(x) ? 'Spotify' : /apple/i.test(x) ? 'Apple (iCloud y apps)' : /hbo/i.test(x) ? 'HBO Max' : /anthropic/i.test(x) ? 'Claude' : /paramount/i.test(x) ? 'Paramount+' : 'Otra');
  const g = {};
  S.rows.filter((r) => c.completos.includes(r.mes) && r.cat === 'Suscripciones').forEach((r) => { g[n(r.comercio)] = (g[n(r.comercio)] || 0) + r.gasto; });
  return Object.entries(g).map(([s, t]) => ({ s, porMes: t / Math.max(1, c.completos.length) })).filter((r) => r.porMes > 0).sort((a, b) => b.porMes - a.porMes);
}

const catProm = (m, cat) => (categorias(m).find((r) => r.cat === cat) || { promedio: 0 }).promedio;
const ingresoPromedio = () => {
  const c = ctx(mesHoy());
  const ms = mesesDisponibles().filter((x) => x < mesHoy() && ingresosDe(x) > 0).slice(-3);
  return ms.length ? mean(ms, ingresosDe) : ingresosDe(c.m);
};
const mesesHasta = (ym) => { if (!ym) return null; const n = (+ym.slice(0, 4) - +S.hoy.slice(0, 4)) * 12 + (+ym.slice(5, 7) - +S.hoy.slice(5, 7)); return Math.max(1, n); };
const aporteObjetivos = () => sum(S.obj, (o) => Math.max(0, o.meta - o.tengo) / (mesesHasta(o.fecha) || 12));

function niveles() {
  const m = mesHoy();
  const r = resumen(m);
  const H = r.normal + Math.max(0, +prefs.extra || 0);
  const fijos = sum(fijosLista(m), (x) => x.porMes);
  const esenciales = ['Súper y almacén', 'Salud y farmacia', 'Uber / Cabify', 'ANCAP (estación)'].reduce((a, k) => a + catProm(m, k), 0);
  const p = Math.min(80, Math.max(0, +prefs.ahorro || 0)) / 100;
  return {
    H, p,
    minimo: { v: r1000(fijos + esenciales + Math.max(0, +prefs.extra || 0)), n: 'Mínimo', s: 'Solo cubrir', lineas: [['Gastos fijos', fijos], ['Súper, salud y transporte', esenciales]] },
    comodo: { v: r1000(H), n: 'Cómodo', s: 'Disfrutar', lineas: [['Tu gasto normal', H]] },
    ideal: { v: r1000(H / (1 - p)), n: 'Ideal', s: 'Ahorrar', lineas: [['Gastos mensuales', H], [`Ahorro (${Math.round(p * 100)}%)`, H / (1 - p) - H]] },
    objetivo: { v: r1000(H + aporteObjetivos()), n: 'Objetivo', s: 'Cumplir metas', lineas: [['Gastos mensuales', H], ['Para tus objetivos', aporteObjetivos()]] }
  };
}

function simular() {
  const m = mesHoy();
  const r = resumen(m);
  const ingreso = ingresoPromedio();
  const subsAll = suscripciones(m);
  const recorte = catProm(m, 'Uber / Cabify') * sim.uber / 100 + catProm(m, 'Delivery') * sim.deli / 100 + catProm(m, 'Comer afuera') * sim.afuera / 100
    + sum(subsAll.filter((x) => sim.subs.includes(x.s)), (x) => x.porMes);
  const gastoHoy = r.normal + Math.max(0, +prefs.extra || 0);
  const gastoNuevo = gastoHoy - recorte;
  const ingresoNuevo = ingreso + sim.aumento;
  const ahorroHoy = ingreso - gastoHoy;
  const ahorroNuevo = ingresoNuevo - gastoNuevo;
  return { ingreso, ingresoNuevo, gastoHoy, gastoNuevo, recorte, ahorroHoy, ahorroNuevo, apartar: sim.fijo, tasa: ingresoNuevo ? ahorroNuevo / ingresoNuevo : 0 };
}

function salud() {
  const ms = mesesDisponibles().filter((x) => x < mesHoy()).slice(-3);
  const ing = mean(ms, ingresosDe), gas = mean(ms, (x) => gastoDe(deMes(x)));
  const tasa = ing ? (ing - gas) / ing : 0;
  const fijos = sum(fijosLista(mesHoy()), (x) => x.porMes);
  const varMeses = ms.map((x) => gastoDe(deMes(x).filter((r) => habitual(r) && !esFijo(r))));
  const vProm = mean(varMeses);
  const swing = vProm ? (Math.max(...varMeses) - Math.min(...varMeses)) / 2 / vProm : 0;
  const rastro = gas ? mean(ms, (x) => gastoDe(deMes(x).filter((r) => SIN_RASTRO.includes(r.cat)))) / gas : 0;
  const r = resumen(mesHoy());
  const tend = r.normal ? r.proyeccion / r.normal - 1 : 0;
  const lin = (v, malo, bueno) => Math.max(0, Math.min(1, (v - malo) / (bueno - malo)));
  const partes = [
    ['Capacidad de ahorro', `Ahorrás el ${pct(Math.max(0, tasa))} de lo que ganás (ideal: 20% o más)`, lin(tasa, 0, 0.2), 35],
    ['Gastos fijos vs. ingresos', `Tus fijos son el ${pct(ing ? fijos / ing : 0)} de tus ingresos (ideal: 40% o menos)`, lin(ing ? fijos / ing : 1, 0.8, 0.4), 20],
    ['Estabilidad', `Tus gastos variables se mueven ±${pct(swing)} de un mes a otro`, lin(swing, 0.5, 0.1), 15],
    ['Plata rastreada', `${pct(rastro)} de tus gastos es efectivo o transferencias sin nombre`, lin(rastro, 0.2, 0), 15],
    ['Este mes', r.normal ? `Vas a cerrar ${tend >= 0 ? pct(tend) + ' arriba' : pct(-tend) + ' abajo'} de tu normal` : 'Todavía no hay meses para comparar', lin(tend, 0.3, 0), 15]
  ];
  const puntaje = Math.round(sum(partes, (p) => p[2] * p[3]));
  const etiqueta = puntaje >= 80 ? 'Excelente' : puntaje >= 60 ? 'Bien' : puntaje >= 40 ? 'Regular' : 'Para mejorar';
  return { puntaje, etiqueta, partes, tasa };
}

function rango() {
  const todos = mesesDisponibles();
  const n = S.periodo === 0 ? todos.length : S.periodo;
  return todos.slice(-n);
}

/* ---------------- gráficos (SVG a mano) ---------------- */
function sparkline(m) {
  const c = ctx(m);
  const rs = deMes(m).filter((r) => r.gasto !== 0);
  const ant = deMes(mesAnt(m)).filter((r) => r.gasto !== 0);
  const acum = (lista, dias) => { const out = []; let s = 0; for (let d = 1; d <= dias; d++) { s += sum(lista.filter((r) => +r.fecha.slice(8, 10) === d), (r) => r.gasto); out.push(s); } return out; };
  const a = acum(rs, c.dia), b = acum(ant, diasMes(mesAnt(m)));
  const max = Math.max(...a, ...b, 1);
  const W = 200, H = 90;
  const path = (arr, n) => arr.map((v, i) => `${i ? 'L' : 'M'}${(i / (n - 1 || 1) * W).toFixed(1)},${(H - v / max * (H - 6) - 3).toFixed(1)}`).join('');
  const pa = path(a, c.dm);
  const lastX = ((a.length - 1) / (c.dm - 1 || 1) * W).toFixed(1);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="gsp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd38d" stop-opacity=".28"/><stop offset="1" stop-color="#5fd38d" stop-opacity="0"/></linearGradient></defs>
    ${b.length ? `<path d="${path(b, diasMes(mesAnt(m)))}" fill="none" stroke="#5d6561" stroke-width="1.4" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/>` : ''}
    <path d="${pa}L${lastX},${H}L0,${H}Z" fill="url(#gsp)"/>
    <path d="${pa}" fill="none" stroke="#5fd38d" stroke-width="2.2" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

function donut(partes) {
  const total = sum(partes, (p) => p.v) || 1;
  const R = 46, C = 2 * Math.PI * R;
  let off = 0;
  const segs = partes.map((p) => { const l = p.v / total * C; const s = `<circle cx="59" cy="59" r="${R}" fill="none" stroke="${p.color}" stroke-width="18" stroke-dasharray="${Math.max(0, l - 2).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 59 59)"/>`; off += l; return s; }).join('');
  return `<svg viewBox="0 0 118 118" width="118" height="118" aria-hidden="true">${segs}</svg>`;
}

function lineas(el, series, labels, opts = {}) {
  const W = el.clientWidth || 340, H = opts.h || 190, m = { t: 18, r: 12, b: 26, l: 34 };
  const vals = series.flatMap((s) => s.v.filter((x) => x != null));
  const max = Math.max(...vals, 1) * 1.12;
  const step = Math.pow(10, Math.floor(Math.log10(max / 3)));
  const tick = Math.ceil(max / 3 / step) * step;
  const x = (i) => m.l + (labels.length < 2 ? (W - m.l - m.r) / 2 : i / (labels.length - 1) * (W - m.l - m.r));
  const y = (v) => H - m.b - v / (tick * 3) * (H - m.t - m.b);
  let g = '';
  for (let i = 0; i <= 3; i++) g += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(tick * i)}" y2="${y(tick * i)}" stroke="#232826"/><text x="${m.l - 6}" y="${y(tick * i) + 4}" text-anchor="end">${tick * i >= 1000 ? Math.round(tick * i / 1000) + 'k' : tick * i}</text>`;
  labels.forEach((l, i) => { g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`; });
  series.forEach((s) => {
    const pts = s.v.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean);
    g += `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('')}" fill="none" stroke="${s.color}" stroke-width="2.4" ${s.dash ? 'stroke-dasharray="5 5"' : ''}/>`;
    s.v.forEach((v, i) => { if (v != null) g += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${s.hueco && s.hueco[i] ? '#141716' : s.color}" stroke="${s.color}" stroke-width="2" data-tip="${esc(labels[i] + ' · ' + s.n + ': ' + money(v))}"/>`; });
  });
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${esc(opts.label || 'Gráfico')}">${g}</svg>${opts.extra || ''}`;
  tooltips(el);
}
function tooltips(el) {
  let tip = null;
  el.querySelectorAll('[data-tip]').forEach((c) => {
    const show = () => { if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; el.appendChild(tip); } tip.textContent = c.dataset.tip; const b = c.getBoundingClientRect(), e = el.getBoundingClientRect(); tip.style.left = (b.left - e.left + b.width / 2) + 'px'; tip.style.top = (b.top - e.top) + 'px'; tip.hidden = false; };
    c.addEventListener('pointerenter', show); c.addEventListener('click', show);
    c.addEventListener('pointerleave', () => { if (tip) tip.hidden = true; });
  });
}

/* ---------------- pantallas ---------------- */
const estadoHTML = () => {
  const viejo = Date.now() - S.at > 30 * 60e3;
  return `<div class="estado ${viejo ? 'viejo' : ''}"><span class="dot"></span>${S.cargando ? 'Actualizando…' : S.error ? esc(S.error) : 'Actualizado ' + haceCuanto(S.at)}</div>`;
};
function haceCuanto(t) {
  if (!t) return '';
  const s = (Date.now() - t) / 1000;
  if (s < 90) return 'recién'; if (s < 3600) return `hace ${Math.round(s / 60)} min`; if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return `hace ${Math.round(s / 86400)} días`;
}

function vInicio() {
  const el = $('#s-inicio');
  const m = S.mes, r = resumen(m), c = r.c;
  const meses = mesesDisponibles().slice().reverse();
  const sube = r.variacion > 0;
  const proyVsNormal = r.normal ? r.proyeccion / r.normal - 1 : 0;
  const lim = Math.max(r.proyeccion, r.normal, r.gastado, 1) * 1.04;
  const colBar = r.normal && r.proyeccion > r.normal * 1.05 ? 'var(--amber)' : 'var(--green)';
  const cats = categorias(m);
  const grupos = GRUPOS.map(([g, color]) => ({ g, color, v: sum(cats.filter((x) => catG(x.cat) === g), (x) => x.este) })).filter((x) => x.v > 0);
  const totalG = sum(grupos, (x) => x.v) || 1;
  const n = niveles();
  el.innerHTML = `
    <div class="head">
      <div><h1>Hola ${esc(prefs.nombre)} 👋</h1><p>Acá está tu situación financiera de ${mesSolo(m)}.</p></div>
      <label class="chip" style="position:relative">${cap(mesCorto(m))} ${m.slice(0, 4)} ${ic('chev')}
        <select id="selMes" style="position:absolute;inset:0;opacity:0" aria-label="Elegir mes">${meses.map((x) => `<option value="${x}" ${x === m ? 'selected' : ''}>${cap(mesNombre(x))}</option>`).join('')}</select>
      </label>
    </div>

    <div class="card hero">
      ${sparkline(m)}
      <div class="title">${ic('trend')}${c.enCurso ? 'Gasto del mes' : 'Gastaste en ' + mesSolo(m)}</div>
      <div class="big" style="position:relative">${money(r.gastado)}</div>
      <span class="trend ${sube ? 'red' : 'green'}">${ic(sube ? 'up' : 'down')}${pct(Math.abs(r.variacion))}</span> <span class="muted small">vs. ${mesSolo(mesAnt(m))}${c.enCurso ? ' a esta altura' : ''}</span>
      <div class="bar" aria-hidden="true">
        ${c.enCurso ? `<i style="width:${Math.min(100, r.proyeccion / lim * 100)}%;background:${colBar};opacity:.28"></i>` : ''}
        <i style="width:${Math.min(100, r.gastado / lim * 100)}%;background:${colBar}"></i>
        ${r.normal ? `<b style="left:calc(${Math.min(100, r.normal / lim * 100)}% - 1px)"></b>` : ''}
      </div>
      <div class="split">
        <div><p class="label">${c.enCurso ? 'Proyección' : 'Lo normal'}</p><p class="mid">${money(c.enCurso ? r.proyeccion : r.normal)}</p>
          ${c.enCurso && r.normal ? `<p class="small ${proyVsNormal > 0.05 ? 'amber' : 'green'}" style="margin:2px 0 0">${proyVsNormal >= 0 ? '+' : ''}${pct(proyVsNormal)} vs. tu normal</p>` : ''}</div>
        <div><p class="label">${c.enCurso ? 'Saldo disponible' : 'Te sobró'}</p><p class="mid ${r.saldo >= 0 ? 'green' : 'red'}">${money(r.saldo)}</p>
          <p class="small muted" style="margin:2px 0 0">ingresos menos gastos</p></div>
      </div>
    </div>

    <div class="row2">
      <div class="card tight" data-go="plan"><p class="label">Ingresos del mes</p><p class="mid green">${money(r.ingresos)}</p><p class="xs muted" style="margin:4px 0 0">${r.wise ? money(r.wise) + ' por Wise' : 'anotalos en la planilla'}</p></div>
      <div class="card tight" data-go="plan"><p class="label">Sueldo ideal</p><p class="mid">${money(n.ideal.v)}</p><p class="xs muted" style="margin:4px 0 0">para ahorrar el ${prefs.ahorro}%</p></div>
    </div>

    <div class="card" data-go="analisis" style="cursor:pointer">
      <h2>Distribución de gastos <span class="link">${ic('right', '')}</span></h2>
      ${grupos.length ? `<div class="donut">${donut(grupos)}<div class="leg">${grupos.sort((a, b) => b.v - a.v).map((g) => `<div><i style="background:${g.color}"></i><span>${g.g}</span><span class="muted num">${pct(g.v / totalG)}</span></div>`).join('')}</div></div>` : '<p class="vacio">Todavía no hay gastos este mes.</p>'}
    </div>

    <div class="card"><h2>Alertas y recomendaciones</h2><div id="alertas">${alertasHTML(m)}</div></div>
    ${estadoHTML()}
  `;
  el.querySelector('.hero .spark').style.cssText = 'position:absolute;right:0;top:40px;width:42%;height:62px;opacity:.9';
  $('#selMes').addEventListener('change', (e) => { S.mes = e.target.value; render(); });
}

function alertasHTML(m) {
  const cats = categorias(m);
  const c = ctx(m);
  const out = [];
  if (c.enCurso) {
    cats.filter((r) => !SIN_RASTRO.includes(r.cat) && r.promedio > 0 && r.proyectado - r.promedio > Math.max(1000, r.promedio * 0.4))
      .sort((a, b) => (b.proyectado - b.promedio) - (a.proyectado - a.promedio)).slice(0, 2)
      .forEach((r) => out.push(['up', '', `${catN(r.cat)} viene alto`, `Vas camino a ${money(r.proyectado)} este mes; lo normal son ${money(r.promedio)}. Son ${money(r.proyectado - r.promedio)} de más.`, ['Ver detalle', `cat:${r.cat}`]]));
    cats.filter((r) => r.promedio > 1500 && r.proyectado < r.promedio * 0.6 && !FIJAS.includes(r.cat) && !SIN_RASTRO.includes(r.cat)).slice(0, 1)
      .forEach((r) => out.push(['down', 'ok', `Bien con ${catN(r.cat).toLowerCase()}`, `Vas a ${money(r.proyectado)}, menos que tu promedio de ${money(r.promedio)}.`, null]));
  }
  fijosLista(m).filter((r) => r.nuevo).slice(0, 1).forEach((r) => out.unshift(['cal', '', `Nuevo gasto fijo: ${r.gasto}`, `Se repite todos los meses desde ${mesSolo(r.desde)}: unos ${money(r.porMes)} por mes.`, ['Ver tus fijos', 'go:fijos']]));
  const sr = mean(c.completos, (x) => gastoDe(deMes(x).filter((r) => SIN_RASTRO.includes(r.cat))));
  if (sr > 3000) out.push(['cash', 'bad', 'Plata sin rastrear', `${money(sr)} por mes entre efectivo, Prex y transferencias sin nombre.`, ['Ver detalle', 'go:analisis:rastro']]);
  if (!out.length) out.push(['check', 'ok', 'Todo en orden', 'Ninguna categoría está muy por encima de lo normal.', null]);
  return out.map(([i, k, t, d, a]) => `<div class="alert"><div class="ico ${k}">${ic(i === 'up' ? 'bulb' : i)}</div><div class="grow"><p class="t">${esc(t)}</p><p class="d">${esc(d)}</p>${a ? `<button class="lnk" data-accion="${esc(a[1])}">${a[0]} →</button>` : ''}</div></div>`).join('');
}

function vMovimientos() {
  const el = $('#s-movimientos');
  const f = S.filtro, q = S.busca.trim().toLowerCase();
  let rs = S.rows.filter((r) => r.tipo !== 'Rechazado' && !/-ef$/.test(r.id) && r.mes >= INICIO_DATOS);
  if (f === 'gastos') rs = rs.filter((r) => r.gasto > 0);
  if (f === 'ingresos') rs = rs.filter((r) => r.tipo === 'Ingreso');
  if (f === 'fijos') rs = rs.filter((r) => r.gasto > 0 && esFijo(r));
  if (q) rs = rs.filter((r) => (limpiar(r.comercio) + ' ' + catN(r.cat) + ' ' + r.comercio).toLowerCase().includes(q));
  rs.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const meses = [...new Set(rs.map((r) => r.mes))];
  if (S.abiertos[mesHoy()] == null) S.abiertos[mesHoy()] = true;
  el.innerHTML = `
    <div class="head"><h1>Movimientos</h1><button class="iconbtn" id="btnBuscar" aria-label="Buscar">${ic('search')}</button></div>
    <div class="search ${S.buscando || q ? 'on' : ''}"><input class="input" id="inBuscar" placeholder="Buscar comercio o categoría" value="${esc(S.busca)}"></div>
    <div class="chips">${[['todos', 'Todos'], ['gastos', 'Gastos'], ['ingresos', 'Ingresos'], ['fijos', 'Fijos']].map(([k, t]) => `<button class="chip ${f === k ? 'on' : ''}" data-filtro="${k}">${t}</button>`).join('')}</div>
    ${meses.length ? meses.map((m) => {
      const lista = rs.filter((r) => r.mes === m);
      const gas = sum(lista, (r) => r.gasto);
      const ingM = sum(lista.filter((r) => r.tipo === 'Ingreso'), (r) => r.monto * (r.moneda === 'USD' ? S.dolar : 1));
      const abierto = q || S.abiertos[m];
      return `<div><div class="mesgrp ${abierto ? '' : 'cerrado'}" data-mes="${m}"><span>${cap(mesNombre(m))}</span><span class="num" style="display:flex;gap:6px;align-items:center">${f === 'ingresos' ? '<span class="green">+' + money(ingM) + '</span>' : '-' + money(gas)}${ic('chev')}</span></div>
        ${abierto ? `<div class="card tight">${lista.map(itemMov).join('')}</div>` : ''}</div>`;
    }).join('') : '<p class="vacio">No hay movimientos con ese filtro.</p>'}
    ${estadoHTML()}`;
  const ib = $('#inBuscar');
  $('#btnBuscar').addEventListener('click', () => { S.buscando = !S.buscando; vMovimientos(); if (S.buscando) $('#inBuscar').focus(); });
  ib.addEventListener('input', () => { S.busca = ib.value; const pos = ib.selectionStart; vMovimientos(); const n = $('#inBuscar'); n.focus(); n.setSelectionRange(pos, pos); });
}
function itemMov(r) {
  const ing = r.tipo === 'Ingreso';
  const pago = r.tipo === 'Pago de tarjeta';
  const valor = ing ? r.monto * (r.moneda === 'USD' ? S.dolar : 1) : r.gasto;
  const d = r.fecha.slice(0, 10);
  const fecha = `${+d.slice(8, 10)} ${MESC[+d.slice(5, 7) - 1]}`;
  return `<div class="item" data-mov="${esc(r.id)}" style="cursor:pointer"><div class="tile ${ing ? 'g' : ''}">${ic(catI(r.cat))}</div>
    <div class="grow"><p class="t1">${esc(ing ? r.comercio : limpiar(r.comercio))}</p><p class="t2">${fecha} · ${esc(catN(r.cat))}${r.puntual ? ' · puntual' : ''}</p></div>
    <div class="amt ${ing || valor < 0 ? 'green' : ''}">${ing ? '+' + money(valor).replace('$ ', '$ ') : pago ? money(r.monto * (r.moneda === 'USD' ? S.dolar : 1)) : valor < 0 ? '+' + money(-valor) : '-' + money(valor).replace('$ ', '$ ')}
      ${r.moneda === 'USD' ? `<small>US$ ${r.monto.toFixed(2).replace('.', ',')}</small>` : pago ? '<small>no suma</small>' : ''}</div></div>`;
}

function vAnalisis() {
  const el = $('#s-analisis');
  const meses = rango();
  const comp = meses.filter((x) => x < mesHoy());
  const base = comp.length ? comp : meses;
  const cats = {};
  S.rows.filter((r) => base.includes(r.mes) && r.gasto > 0 && habitual(r)).forEach((r) => { cats[r.cat] = (cats[r.cat] || 0) + r.gasto; });
  const lista = Object.entries(cats).map(([cat, t]) => ({ cat, prom: t / base.length })).sort((a, b) => b.prom - a.prom);
  const totalC = sum(lista, (x) => x.prom) || 1;
  const colores = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c6)', 'var(--c5)'];
  // insight
  const u = comp.slice(-2);
  let insight = '';
  if (u.length === 2) {
    const a = gastoDe(deMes(u[0]).filter(habitual)), b = gastoDe(deMes(u[1]).filter(habitual));
    const ch = a ? b / a - 1 : 0;
    insight = ch <= 0 ? `En ${mesSolo(u[1])} gastaste ${pct(-ch)} menos que en ${mesSolo(u[0])}. ¡Vas por buen camino!` : `En ${mesSolo(u[1])} gastaste ${pct(ch)} más que en ${mesSolo(u[0])}. Mirá qué categorías subieron.`;
  }
  // fijos y variables
  const fv = base.map((x) => ({ m: x, f: gastoDe(deMes(x).filter((r) => habitual(r) && esFijo(r))), v: gastoDe(deMes(x).filter((r) => habitual(r) && !esFijo(r))) }));
  const vmin = Math.min(...fv.map((x) => x.v)), vmax = Math.max(...fv.map((x) => x.v)), vprom = mean(fv, (x) => x.v);
  const swing = vprom ? (vmax - vmin) / 2 / vprom : 0;
  // fluctuación
  const fl = lista.filter((x) => !FIJAS.includes(x.cat)).slice(0, 8).map((x) => {
    const por = base.map((m) => gastoDe(deMes(m).filter((r) => r.cat === x.cat && habitual(r) && !esFijo(r))));
    const c = ctx(mesHoy());
    const este = gastoDe(deMes(mesHoy()).filter((r) => r.cat === x.cat && habitual(r) && !esFijo(r))) / c.dia * c.dm;
    return { cat: x.cat, min: Math.min(...por), max: Math.max(...por), este };
  });
  const flMax = Math.max(...fl.map((x) => Math.max(x.max, x.este)), 1);
  // sin rastrear
  const tr = {};
  S.rows.filter((r) => base.includes(r.mes) && r.cat === 'Transferencias').forEach((r) => { tr[r.comercio] = tr[r.comercio] || { n: 0, t: 0 }; tr[r.comercio].n++; tr[r.comercio].t += r.gasto; });
  const ef = mean(base, (m) => gastoDe(deMes(m).filter((r) => r.cat === 'Efectivo (retiros)' || r.cat === 'Prex (sin detalle)')));

  el.innerHTML = `
    <div class="head"><div><h1>Análisis</h1><p>Entendé tus hábitos y encontrá oportunidades de mejora.</p></div></div>
    <div class="seg">${[[3, '3M'], [6, '6M'], [12, '12M'], [0, 'Todo']].map(([v, t]) => `<button class="${S.periodo === v ? 'on' : ''}" data-periodo="${v}">${t}</button>`).join('')}</div>

    <div class="card"><h2>Gastos vs. ingresos</h2>
      <div class="leg" style="grid-auto-flow:column;justify-content:start;gap:16px;margin:-4px 0 8px"><div><i style="background:var(--c4)"></i><span>Gastos</span></div><div><i style="background:var(--green)"></i><span>Ingresos</span></div></div>
      <div class="chart" id="chGI"></div>
      <p class="xs muted" style="margin:6px 0 0">* mes en curso: el gasto es la proyección a fin de mes.</p></div>

    <div class="card"><h2>Gastos por categoría <span class="link">promedio por mes</span></h2>
      ${lista.slice(0, 9).map((x, i) => `<div class="catbar" data-cat="${esc(x.cat)}"><span class="n">${esc(catN(x.cat))}</span><span class="track"><i style="width:${(x.prom / lista[0].prom * 100).toFixed(1)}%;background:${colores[i % colores.length]}"></i></span><span class="p">${pct(x.prom / totalC)}</span><span class="v">${money(x.prom)}</span></div>`).join('')}
      <p class="xs muted" style="margin:8px 0 0">Tocá una categoría para ver el detalle.</p></div>

    ${insight ? `<div class="card tight" style="display:flex;gap:12px;align-items:center"><div class="tile sm g">${ic('spark')}</div><div><p class="t1" style="white-space:normal">Insight</p><p class="small muted" style="margin:2px 0 0">${esc(insight)}</p></div></div>` : ''}

    <div class="card"><h2>Fijos y variables</h2>
      <div class="kv"><span><i style="background:var(--c4)"></i>Fijos por mes</span><b class="num">${money(mean(fv, (x) => x.f))}</b></div>
      <div class="kv"><span><i style="background:var(--c3)"></i>Variables por mes</span><b class="num">${money(vprom)}</b></div>
      <p class="small muted" style="margin:6px 0 0">Tus variables se mueven ±${pct(swing)}: de ${money(vmin)} a ${money(vmax)}. Ahí es donde podés ahorrar.</p>
      <div class="bars" style="height:120px;margin-top:8px">${fv.map((x) => { const t = Math.max(...fv.map((y) => y.f + y.v), 1); return `<div><span class="num">${Math.round((x.f + x.v) / 1000)}k</span><span style="display:flex;flex-direction:column;width:100%;max-width:34px;height:${((x.f + x.v) / t * 80).toFixed(0)}px"><i style="flex:${x.v};background:var(--c3);border-radius:8px 8px 0 0"></i><i style="flex:${x.f};background:var(--c4);border-radius:0 0 4px 4px"></i></span>${mesCorto(x.m)}</div>`; }).join('')}</div></div>

    <div class="card" id="fluct"><h2>Cuánto varía cada gasto</h2>
      <p class="small muted" style="margin:-6px 0 8px">La barra va del mes más bajo al más alto; el punto es este mes.</p>
      ${fl.map((x) => `<div class="item" data-cat="${esc(x.cat)}" style="cursor:pointer"><div class="tile sm">${ic(catI(x.cat))}</div><div class="grow"><p class="t1">${esc(catN(x.cat))}</p>
        <div style="position:relative;height:8px;border-radius:8px;background:var(--tile);margin-top:6px"><i style="position:absolute;top:0;bottom:0;border-radius:8px;background:var(--c3);opacity:.5;left:${(x.min / flMax * 100).toFixed(1)}%;width:${Math.max(1.5, (x.max - x.min) / flMax * 100).toFixed(1)}%"></i><b style="position:absolute;top:50%;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);left:${Math.min(100, x.este / flMax * 100).toFixed(1)}%;background:${x.este > x.max && x.max > 0 ? 'var(--red)' : 'var(--fg)'}"></b></div>
        <p class="t2">entre ${money(x.min)} y ${money(x.max)}</p></div><div class="amt ${x.este > x.max && x.max > 0 ? 'red' : ''}">${money(x.este)}<small>este mes</small></div></div>`).join('')}</div>

    <div class="card" id="rastro"><h2>Plata sin rastrear</h2>
      <div class="row2"><div><p class="label">Efectivo y Prex / mes</p><p class="mid">${money(ef)}</p></div><div><p class="label">Transferencias / mes</p><p class="mid">${money(sum(Object.values(tr), (x) => x.t) / base.length)}</p></div></div>
      ${Object.entries(tr).sort((a, b) => b[1].t - a[1].t).map(([k, v]) => `<div class="item"><div class="tile sm">${ic('swap')}</div><div class="grow"><p class="t1">${esc(k)}</p><p class="t2">${v.n} ${v.n === 1 ? 'vez' : 'veces'}</p></div><div class="amt">${money(v.t)}</div></div>`).join('')}
      <p class="xs muted" style="margin:8px 0 0">Para ponerle nombre a una cuenta, escribila en la hoja "Cuentas" de tu planilla.</p></div>
    ${estadoHTML()}`;
  const mh = mesHoy();
  const labels = meses.map((x) => cap(mesCorto(x)) + (x === mh ? '*' : ''));
  lineas($('#chGI'), [
    { n: 'Gastos', color: 'var(--c4)', v: meses.map((x) => (x === mh ? resumen(x).proyeccion : gastoDe(deMes(x)))), hueco: meses.map((x) => x === mh) },
    { n: 'Ingresos', color: '#5fd38d', v: meses.map((x) => ingresosDe(x) || null), hueco: meses.map((x) => x === mh) }
  ], labels, { label: 'Gastos e ingresos por mes' });
}

function sheetCategoria(cat) {
  const meses = rango();
  const comp = meses.filter((x) => x < mesHoy());
  const base = comp.length ? comp : meses;
  const rs = S.rows.filter((r) => meses.includes(r.mes) && r.cat === cat && r.gasto > 0);
  const porMes = meses.map((m) => ({ m, t: gastoDe(rs.filter((r) => r.mes === m)) }));
  const maxM = Math.max(...porMes.map((x) => x.t), 1);
  const com = {};
  rs.forEach((r) => { const k = limpiar(r.comercio); com[k] = com[k] || { n: 0, t: 0 }; com[k].n++; com[k].t += r.gasto; });
  const dias = [0, 0, 0, 0, 0, 0, 0];
  rs.forEach((r) => { dias[new Date(r.fecha.slice(0, 10) + 'T12:00:00').getDay()] += r.gasto; });
  const dMax = dias.indexOf(Math.max(...dias));
  const prom = sum(rs.filter((r) => base.includes(r.mes)), (r) => r.gasto) / base.length;
  const ultimo = porMes.filter((x) => x.m < mesHoy()).slice(-1)[0];
  hoja(`<div style="display:flex;gap:12px;align-items:center"><div class="tile">${ic(catI(cat))}</div><div><h3>${esc(catN(cat))}</h3><p class="small muted" style="margin:0">Últimos ${meses.length} meses</p></div></div>
    <div class="row2" style="margin-top:14px"><div class="card tight"><p class="label">Promedio por mes</p><p class="mid">${money(prom)}</p></div><div class="card tight"><p class="label">Compras</p><p class="mid">${rs.length}</p></div></div>
    <div class="row2" style="margin-top:12px"><div class="card tight"><p class="label">Ticket promedio</p><p class="mid">${money(rs.length ? sum(rs, (r) => r.gasto) / rs.length : 0)}</p></div><div class="card tight"><p class="label">Día que más gastás</p><p class="mid">${rs.length ? cap(DIAS[dMax]) : '—'}</p></div></div>
    ${ultimo && prom ? `<p class="small ${ultimo.t > prom ? 'amber' : 'green'}" style="margin:12px 0 0">En ${mesSolo(ultimo.m)} gastaste ${money(ultimo.t)}: ${ultimo.t > prom ? pct(ultimo.t / prom - 1) + ' más' : pct(1 - ultimo.t / prom) + ' menos'} que tu promedio.</p>` : ''}
    <p class="label" style="margin:16px 0 0">Evolución</p>
    <div class="bars">${porMes.map((x) => `<div><span class="num">${x.t >= 1000 ? Math.round(x.t / 1000) + 'k' : Math.round(x.t)}</span><i style="height:${(x.t / maxM * 72).toFixed(0)}px;${x.m === mesHoy() ? 'opacity:.5' : ''}"></i>${mesCorto(x.m)}</div>`).join('')}</div>
    <p class="label" style="margin:16px 0 4px">Dónde</p>
    ${Object.entries(com).sort((a, b) => b[1].t - a[1].t).slice(0, 8).map(([k, v]) => `<div class="item"><div class="grow"><p class="t1">${esc(k)}</p><p class="t2">${v.n} ${v.n === 1 ? 'vez' : 'veces'}</p></div><div class="amt">${money(v.t)}</div></div>`).join('') || '<p class="muted small">Sin compras en este período.</p>'}
    <button class="btn s" style="margin-top:14px" data-cerrar>Cerrar</button>`);
}

function sheetMov(id) {
  const r = S.rows.find((x) => x.id === id); if (!r) return;
  const ing = r.tipo === 'Ingreso';
  hoja(`<div style="display:flex;gap:12px;align-items:center"><div class="tile ${ing ? 'g' : ''}">${ic(catI(r.cat))}</div><div class="grow"><h3 style="margin:0">${esc(ing ? r.comercio : limpiar(r.comercio))}</h3><p class="small muted" style="margin:2px 0 0">${esc(r.comercio)}</p></div></div>
    <div style="margin-top:14px">
      <div class="kv"><span class="muted">Monto</span><b class="num ${ing ? 'green' : ''}">${r.moneda === 'USD' ? 'US$ ' + r.monto.toFixed(2).replace('.', ',') + ' · ' : ''}${money(ing ? r.monto * (r.moneda === 'USD' ? S.dolar : 1) : r.gasto || r.monto)}</b></div>
      <div class="kv"><span class="muted">Fecha</span><span>${esc(r.fecha)}</span></div>
      <div class="kv"><span class="muted">Categoría</span><span>${esc(catN(r.cat))}</span></div>
      <div class="kv"><span class="muted">Cuenta</span><span>${esc(r.banco)}</span></div>
      <div class="kv"><span class="muted">Tipo</span><span>${esc(r.tipo)}${r.frecuencia ? ' · ' + esc(r.frecuencia) : ''}</span></div>
      ${r.nota ? `<div class="kv"><span class="muted">Nota</span><span>${esc(r.nota)}</span></div>` : ''}
    </div>
    <p class="small muted">Para cambiar la categoría, cambiala en la hoja "Movimientos" de tu planilla: el script aprende y corrige los parecidos.</p>
    <a class="btn s" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${PLANILLA}" target="_blank" rel="noopener">Abrir la planilla</a>
    <button class="btn s" style="margin-top:10px" data-cerrar>Cerrar</button>`);
}

function vPlan() {
  const el = $('#s-plan');
  el.innerHTML = `
    <div class="subhead"><h1>Plan</h1></div>
    <div class="tabs">${[['calc', 'Calculadora'], ['sim', 'Simulador'], ['obj', 'Objetivos']].map(([k, t]) => `<button class="${S.planTab === k ? 'on' : ''}" data-plantab="${k}">${t}</button>`).join('')}</div>
    <div id="planBody" style="display:flex;flex-direction:column;gap:14px"></div>`;
  ({ calc: vCalc, sim: vSim, obj: vObj })[S.planTab]();
}

function vCalc() {
  const n = niveles();
  const sel = n[prefs.nivel] || n.ideal;
  const ing = ingresoPromedio();
  const dif = ing - sel.v;
  const b = $('#planBody');
  b.innerHTML = `
    <div class="card"><h2 style="margin-bottom:2px">Tu sueldo ${prefs.nivel === 'minimo' ? 'mínimo' : prefs.nivel === 'comodo' ? 'cómodo' : prefs.nivel === 'objetivo' ? 'para tus objetivos' : 'ideal'}</h2>
      <p class="small muted" style="margin:0">${prefs.nivel === 'ideal' ? `Para cubrir tus gastos y ahorrar un ${prefs.ahorro}%.` : prefs.nivel === 'minimo' ? 'Para cubrir solo lo necesario.' : prefs.nivel === 'comodo' ? 'Para vivir como hoy, sin ahorrar.' : 'Para vivir como hoy y cumplir tus objetivos a tiempo.'}</p>
      <div class="ideal">${money(sel.v)}</div>
      ${sel.lineas.map(([k, v], i) => `<div class="kv"><span><i style="background:${i ? 'var(--green)' : 'var(--fg)'}"></i>${k}</span><span class="num">${money(v)}</span></div>`).join('')}
      <div class="okbox ${dif >= 0 ? '' : 'bad'}">${ic(dif >= 0 ? 'check' : 'info')}<span>${ing ? (dif >= 0 ? `Con tu ingreso promedio (${money(ing)}) ya llegás: te sobran ${money(dif)} por mes.` : `Con tu ingreso promedio (${money(ing)}) te faltan ${money(-dif)} por mes para llegar.`) : 'Anotá tus ingresos en la planilla para comparar.'}</span></div>
    </div>
    <p class="label" style="margin:0 2px">¿Qué nivel buscás?</p>
    <div class="niveles">${['minimo', 'comodo', 'ideal', 'objetivo'].map((k) => `<button class="nivel ${prefs.nivel === k ? 'on' : ''}" data-nivel="${k}"><b>${n[k].n}</b><small>${n[k].s}</small></button>`).join('')}</div>
    <div class="card"><h2>Ajustes</h2>
      <p class="label">Quiero ahorrar</p>
      <div class="chips" style="margin-top:8px">${[10, 15, 20, 30].map((v) => `<button class="chip ${+prefs.ahorro === v ? 'on' : ''}" data-ahorro="${v}">${v}%</button>`).join('')}</div>
      <label class="field">Gastos que no pasan por tus cuentas (alquiler, etc.)<input class="input" id="inExtra" type="number" inputmode="numeric" min="0" step="any" value="${+prefs.extra || 0}"></label>
    </div>
    <div class="card"><h2>Simulá un cambio</h2>
      <p class="small muted" style="margin:-6px 0 10px">¿Qué pasa si gano ${money(10000)} más?</p>
      ${(() => { const s = simular(); const extra = 10000; const t1 = s.ingreso ? s.ahorroHoy / s.ingreso : 0; const t2 = (s.ahorroHoy + extra) / (s.ingreso + extra); return `<div class="okbox">${ic('trend')}<span>Tus gastos seguirían igual: pasarías de ahorrar ${money(s.ahorroHoy)} (${pct(Math.max(0, t1))}) a ${money(s.ahorroHoy + extra)} por mes (${pct(Math.max(0, t2))} de tus ingresos).</span></div>`; })()}
      <button class="lnk" data-plantab="sim">Probar otros cambios →</button>
    </div>`;
  $('#inExtra').addEventListener('change', (e) => { prefs.extra = Math.max(0, +e.target.value || 0); guardarPrefs(); vCalc(); });
}

function rangeHTML(id, t, v, min, max, step, fmtV) {
  return `<div class="slider"><div class="top"><span>${t}</span><b id="${id}V">${fmtV(v)}</b></div><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${v}" style="--p:${((v - min) / (max - min) * 100).toFixed(1)}%"></div>`;
}
function vSim() {
  const b = $('#planBody');
  const subs = suscripciones(mesHoy());
  const esc_ = LS.get('escenarios', []);
  b.innerHTML = `
    <div class="seg">${[['esc', 'Escenarios'], ['cmp', 'Comparar']].map(([k, t]) => `<button class="${S.simTab === k ? 'on' : ''}" data-simtab="${k}">${t}</button>`).join('')}</div>
    <div id="simBody" style="display:flex;flex-direction:column;gap:14px"></div>`;
  const sb = $('#simBody');
  if (S.simTab === 'cmp') {
    const base = simular();
    sb.innerHTML = `<div class="card"><h2>Tus escenarios</h2>
      <div class="item"><div class="tile sm">${ic('home')}</div><div class="grow"><p class="t1">Situación actual</p><p class="t2">Ingreso ${money(base.ingreso)} · gasto ${money(base.gastoHoy)}</p></div><div class="amt ${base.ahorroHoy >= 0 ? 'green' : 'red'}">${money(base.ahorroHoy)}<small>ahorro/mes</small></div></div>
      ${esc_.map((e, i) => { const r = e.r; return `<div class="item"><div class="tile sm g">${ic('spark')}</div><div class="grow"><p class="t1">${esc(e.nombre)}</p><p class="t2">Ingreso ${money(r.ingresoNuevo)} · gasto ${money(r.gastoNuevo)}</p></div><div class="amt ${r.ahorroNuevo >= 0 ? 'green' : 'red'}">${money(r.ahorroNuevo)}<small>${moneyS(r.ahorroNuevo - base.ahorroHoy)}</small></div></div>
        <div style="display:flex;gap:8px;margin:-2px 0 8px 46px"><button class="chip" data-esc-usar="${i}">Usar</button><button class="chip" data-esc-borrar="${i}">${ic('trash')}Borrar</button></div>`; }).join('') || '<p class="small muted">Todavía no guardaste escenarios. Armá uno en "Escenarios" y tocá "Guardar escenario".</p>'}
    </div>`;
    return;
  }
  const r = simular();
  sb.innerHTML = `
    <div class="card"><h2>¿Qué querés probar?</h2>
      ${rangeHTML('rAum', 'Aumentar ingresos', sim.aumento, 0, 40000, 1000, (v) => '+' + money(v))}
      ${rangeHTML('rUber', 'Reducir Uber y Cabify', sim.uber, 0, 100, 10, (v) => (v ? '-' + v + '%' : '0%'))}
      ${rangeHTML('rDeli', 'Reducir delivery', sim.deli, 0, 100, 10, (v) => (v ? '-' + v + '%' : '0%'))}
      ${rangeHTML('rAfuera', 'Reducir comer afuera', sim.afuera, 0, 100, 10, (v) => (v ? '-' + v + '%' : '0%'))}
      ${rangeHTML('rFijo', 'Apartar un monto fijo', sim.fijo, 0, 30000, 1000, money)}
      <p class="label" style="margin:12px 0 4px">Eliminar suscripciones</p>
      ${subs.map((x) => `<div class="kv"><span>${esc(x.s)} <span class="muted small">${money(x.porMes)}</span></span><label class="toggle"><input type="checkbox" data-sub="${esc(x.s)}" ${sim.subs.includes(x.s) ? 'checked' : ''}><span></span></label></div>`).join('')}
    </div>
    <div class="card"><h2 style="display:flex;justify-content:flex-start;gap:8px">${ic('spark').replace('<svg', '<svg style="width:18px;height:18px;color:var(--green)"')}Resultado estimado</h2>
      <div class="row2"><div><p class="label">Gasto mensual</p><p class="mid">${money(r.gastoNuevo)}</p><p class="xs muted" style="margin:2px 0 0">hoy ${money(r.gastoHoy)}</p></div>
        <div><p class="label">Ahorro mensual</p><p class="mid ${r.ahorroNuevo >= 0 ? 'green' : 'red'}">${money(r.ahorroNuevo)}</p><p class="xs muted" style="margin:2px 0 0">hoy ${money(r.ahorroHoy)}</p></div></div>
      <div class="okbox ${r.ahorroNuevo >= 0 ? '' : 'bad'}">${ic('trend')}<span>${r.ahorroNuevo >= 0 ? `Esto te permitiría ahorrar el ${pct(r.tasa)} de tus ingresos: ${money((r.ahorroNuevo - r.ahorroHoy) * 12)} más por año.` : `Con estos números gastarías más de lo que ganás.`}${r.apartar ? ` Si apartás ${money(r.apartar)} fijos, te quedan ${money(r.ahorroNuevo - r.apartar)} libres.` : ''}</span></div>
    </div>
    <button class="btn p" id="btnGuardarEsc">Guardar escenario</button>
    <button class="btn s" id="btnReset">Volver a cero</button>`;
  const bind = (id, k) => { const i = $('#' + id); i.addEventListener('input', () => { sim[k] = +i.value; i.style.setProperty('--p', ((i.value - i.min) / (i.max - i.min) * 100) + '%'); guardarSim(); actualizarSim(); }); };
  bind('rAum', 'aumento'); bind('rUber', 'uber'); bind('rDeli', 'deli'); bind('rAfuera', 'afuera'); bind('rFijo', 'fijo');
  sb.querySelectorAll('[data-sub]').forEach((c) => c.addEventListener('change', () => { const s = c.dataset.sub; sim.subs = c.checked ? [...new Set([...sim.subs, s])] : sim.subs.filter((x) => x !== s); guardarSim(); actualizarSim(); }));
  $('#btnGuardarEsc').addEventListener('click', () => hoja(`<h3>Guardar escenario</h3><label class="field">Nombre<input class="input" id="inEsc" maxlength="40" placeholder="Ej: plan de ahorro agresivo"></label><button class="btn p" style="margin-top:14px" id="okEsc">Guardar</button><button class="btn s" style="margin-top:10px" data-cerrar>Cancelar</button>`, () => {
    $('#inEsc').focus();
    $('#okEsc').addEventListener('click', () => { const nombre = $('#inEsc').value.trim() || 'Escenario ' + (LS.get('escenarios', []).length + 1); const l = LS.get('escenarios', []); l.push({ nombre, sim: JSON.parse(JSON.stringify(sim)), r: simular() }); LS.set('escenarios', l); cerrarHoja(); toast('Escenario guardado'); S.simTab = 'cmp'; vSim(); });
  }));
  $('#btnReset').addEventListener('click', () => { Object.assign(sim, { aumento: 0, uber: 0, deli: 0, afuera: 0, fijo: 0, subs: [] }); guardarSim(); vSim(); });
}
let simT = null;
function actualizarSim() {
  // actualiza solo los números (sin redibujar los sliders)
  clearTimeout(simT);
  simT = setTimeout(() => {
    const y = window.scrollY;
    const vals = { rAumV: '+' + money(sim.aumento), rUberV: sim.uber ? '-' + sim.uber + '%' : '0%', rDeliV: sim.deli ? '-' + sim.deli + '%' : '0%', rAfueraV: sim.afuera ? '-' + sim.afuera + '%' : '0%', rFijoV: money(sim.fijo) };
    Object.entries(vals).forEach(([k, v]) => { const e = $('#' + k); if (e) e.textContent = v; });
    const r = simular();
    const cards = $('#simBody').querySelectorAll('.card');
    const tmp = document.createElement('div');
    tmp.innerHTML = `<div class="card"><h2 style="display:flex;justify-content:flex-start;gap:8px">${ic('spark').replace('<svg', '<svg style="width:18px;height:18px;color:var(--green)"')}Resultado estimado</h2>
      <div class="row2"><div><p class="label">Gasto mensual</p><p class="mid">${money(r.gastoNuevo)}</p><p class="xs muted" style="margin:2px 0 0">hoy ${money(r.gastoHoy)}</p></div>
        <div><p class="label">Ahorro mensual</p><p class="mid ${r.ahorroNuevo >= 0 ? 'green' : 'red'}">${money(r.ahorroNuevo)}</p><p class="xs muted" style="margin:2px 0 0">hoy ${money(r.ahorroHoy)}</p></div></div>
      <div class="okbox ${r.ahorroNuevo >= 0 ? '' : 'bad'}">${ic('trend')}<span>${r.ahorroNuevo >= 0 ? `Esto te permitiría ahorrar el ${pct(r.tasa)} de tus ingresos: ${money((r.ahorroNuevo - r.ahorroHoy) * 12)} más por año.` : 'Con estos números gastarías más de lo que ganás.'}${r.apartar ? ` Si apartás ${money(r.apartar)} fijos, te quedan ${money(r.ahorroNuevo - r.apartar)} libres.` : ''}</span></div></div>`;
    if (cards[1]) cards[1].replaceWith(tmp.firstChild);
    window.scrollTo(0, y);
  }, 30);
}

function ringHTML(o, size = 84) {
  const p = o.meta ? Math.min(1, o.tengo / o.meta) : 0;
  const R = 36, C = 2 * Math.PI * R;
  return `<div class="ring"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="${R}" fill="none" stroke="#1d2220" stroke-width="7"/><circle cx="42" cy="42" r="${R}" fill="none" stroke="#5fd38d" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 42 42)"/></svg><span class="ic">${ic(o.icono)}</span><span class="pc">${Math.round(p * 100)}%</span></div>`;
}
function vObj() {
  const b = $('#planBody');
  const s = simular();
  const sobra = Math.max(0, s.ahorroHoy);
  const pend = S.obj.filter((o) => o.tengo < o.meta);
  const porObj = pend.length ? sobra / pend.length : 0;
  const hist = mesesDisponibles().filter((x) => x < mesHoy()).slice(-6).map((m) => ({ m, v: ingresosDe(m) - gastoDe(deMes(m)) }));
  const hMax = Math.max(...hist.map((x) => Math.abs(x.v)), 1);
  const faltaTotal = sum(pend, (o) => o.meta - o.tengo);
  const mesesTotal = sobra > 0 ? Math.ceil(faltaTotal / sobra) : null;
  b.innerHTML = `
    <div class="subhead" style="padding-top:2px"><h1 style="font-size:20px">Mis objetivos</h1><button class="iconbtn" id="btnNuevoObj" aria-label="Nuevo objetivo">${ic('target').replace(ICON.target, '<path d="M12 5v14M5 12h14"/>')}</button></div>
    ${S.obj.map((o) => {
      const falta = Math.max(0, o.meta - o.tengo);
      let txt;
      if (!falta) txt = '<span class="green">¡Lo lograste!</span>';
      else if (o.fecha) { const nec = Math.ceil(falta / mesesHasta(o.fecha) / 100) * 100; txt = `<span class="${nec <= porObj ? 'green' : 'amber'}">Para ${mesSolo(o.fecha)} ${o.fecha.slice(0, 4)}: ${money(nec)}/mes</span>`; }
      else txt = porObj > 0 ? `Lo lográs en ~${Math.ceil(falta / porObj)} meses` : '<span class="amber">Con lo que te sobra hoy no alcanza</span>';
      return `<div class="card goal" data-obj="${esc(o.id)}">${ringHTML(o)}<div><p class="t1" style="font-size:16px;white-space:normal">${esc(o.nombre)}</p><p class="small" style="margin:6px 0 0">${ic('coins').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px;color:var(--green)"')} <b class="num">${money(o.tengo)}</b> <span class="muted">de ${money(o.meta)}</span></p><p class="xs muted" style="margin:6px 0 0">${txt}</p></div></div>`;
    }).join('')}
    <button class="addbtn" id="btnNuevoObj2">+ Crear nuevo objetivo</button>
    <div class="card"><h2>Tu progreso</h2><p class="small muted" style="margin:-6px 0 0">Lo que te sobró cada mes (ingresos menos gastos)</p>
      <div class="bars" style="height:130px">${hist.map((x) => `<div><span class="num ${x.v < 0 ? 'red' : ''}">${x.v >= 0 ? '' : '-'}${Math.round(Math.abs(x.v) / 1000)}k</span><i class="${x.v < 0 ? 'neg' : ''}" style="height:${(Math.abs(x.v) / hMax * 80).toFixed(0)}px"></i>${mesCorto(x.m)}</div>`).join('')}</div>
      <div class="okbox ${mesesTotal ? '' : 'bad'}" style="margin-top:14px">${ic('trend')}<span>${mesesTotal ? `Ahorrando ${money(sobra)} por mes, cumplís todos tus objetivos en ~${mesesTotal} meses.` : 'Hoy no te sobra plata para tus objetivos. Probá el simulador para ver qué cambiar.'}</span></div>
    </div>
    <p class="xs muted" style="margin:0 4px">Tus objetivos se guardan en la hoja "Objetivos" de tu planilla, así los ves en todos tus dispositivos.</p>`;
  $('#btnNuevoObj').addEventListener('click', () => formObj(null));
  $('#btnNuevoObj2').addEventListener('click', () => formObj(null));
}

function formObj(o) {
  const iconos = [['car', 'Auto'], ['home', 'Casa'], ['plane', 'Viaje'], ['shield', 'Emergencias'], ['music', 'Música'], ['gift', 'Regalo'], ['coins', 'Otro']];
  hoja(`<h3>${o ? 'Editar objetivo' : 'Nuevo objetivo'}</h3>
    <form id="fObj">
      <label class="field">Nombre<input class="input" name="nombre" maxlength="40" required value="${o ? esc(o.nombre) : ''}" placeholder="Ej: fondo de emergencia"></label>
      <div class="row2"><label class="field">¿Cuánto necesitás?<input class="input" name="meta" type="number" inputmode="numeric" min="1" step="any" required value="${o ? o.meta : ''}"></label>
        <label class="field">¿Cuánto tenés ya?<input class="input" name="tengo" type="number" inputmode="numeric" min="0" step="any" value="${o ? o.tengo : 0}"></label></div>
      <label class="field">¿Para cuándo? (opcional)<input class="input" name="fecha" type="month" value="${o ? esc(o.fecha) : ''}"></label>
      <p class="label" style="margin:14px 0 8px">Ícono</p>
      <div class="chips" style="flex-wrap:wrap">${iconos.map(([k, t]) => `<label class="chip ${(o ? o.icono : 'coins') === k ? 'on' : ''}"><input type="radio" name="icono" value="${k}" ${(o ? o.icono : 'coins') === k ? 'checked' : ''} hidden>${ic(k)}${t}</label>`).join('')}</div>
      <button class="btn p" style="margin-top:18px" type="submit">Guardar</button>
      ${o ? '<button class="btn d" style="margin-top:10px" type="button" id="bBorrar">Borrar objetivo</button>' : ''}
      <button class="btn s" style="margin-top:10px" type="button" data-cerrar>Cancelar</button>
      <p class="small red" id="errObj" hidden></p>
    </form>`, () => {
    const f = $('#fObj');
    f.querySelectorAll('input[name=icono]').forEach((r) => r.addEventListener('change', () => { f.querySelectorAll('.chips .chip').forEach((c) => c.classList.toggle('on', c.querySelector('input').checked)); }));
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = new FormData(f);
      const obj = { id: o ? o.id : 'o' + Date.now().toString(36), nombre: String(d.get('nombre')).trim(), meta: Math.round(+d.get('meta') || 0), tengo: Math.round(+d.get('tengo') || 0), fecha: String(d.get('fecha') || ''), icono: String(d.get('icono') || 'coins') };
      await guardarObjetivo('guardar', obj);
    });
    const bb = $('#bBorrar');
    if (bb) bb.addEventListener('click', async () => { if (!bb.dataset.ok) { bb.dataset.ok = 1; bb.textContent = '¿Seguro? Tocá de nuevo para borrar'; return; } await guardarObjetivo('borrar', o); });
  });
}

async function guardarObjetivo(accion, obj) {
  const con = LS.get('conexion', null);
  const err = $('#errObj');
  const antes = S.obj.slice();
  if (accion === 'borrar') S.obj = S.obj.filter((x) => x.id !== obj.id);
  else { const i = S.obj.findIndex((x) => x.id === obj.id); if (i >= 0) S.obj[i] = obj; else S.obj.push(obj); }
  if (!con || con.demo) { cerrarHoja(); render(); toast('Guardado en este dispositivo'); return; }
  try {
    const res = await fetch(con.u, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ k: con.k, accion, objetivo: obj }) });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error || 'error');
    if (S.raw) { S.raw.objetivos = S.obj; LS.set('cache', S.raw); }
    cerrarHoja(); render(); toast(accion === 'borrar' ? 'Objetivo borrado' : 'Objetivo guardado');
  } catch (e) {
    S.obj = antes;
    if (err) { err.hidden = false; err.textContent = 'No se pudo guardar. Revisá tu conexión y probá de nuevo.'; }
  }
}

function vMas() {
  const el = $('#s-mas');
  const s = salud();
  el.innerHTML = `
    <div class="head"><h1>Más</h1></div>
    <div class="card perfil"><div class="avatar">${esc(prefs.nombre.charAt(0).toUpperCase())}</div><div class="grow"><p class="t1" style="font-size:17px">Facu Burgos</p><p class="t2">@facuuuburgos</p></div></div>
    <div class="card tight menu">
      ${[['informe', 'spark', 'Informe financiero'], ['fijos', 'cal', 'Gastos fijos'], ['salud', 'shield', 'Salud financiera'], ['calculo', 'info', 'Cómo se calcula'], ['conexion', 'wifi', 'Conexión y actualización']].map(([k, i, t]) => `<div class="item" data-go="${k}"><div class="tile sm">${ic(i)}</div><div class="grow"><p class="t1">${t}</p></div>${ic('right', 'ch')}</div>`).join('')}
      <a class="item" href="${PLANILLA}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none"><div class="tile sm">${ic('sheet')}</div><div class="grow"><p class="t1">Abrir mi planilla</p></div>${ic('right', 'ch')}</a>
    </div>
    <div class="card salud" data-go="salud" style="cursor:pointer">
      <div style="display:flex;gap:12px;align-items:center"><div class="tile sm g">${ic('gem')}</div><div class="grow"><p class="label">Tu salud financiera</p><p class="t1 green" style="font-size:18px">${s.etiqueta} <span class="muted small num">${s.puntaje}/100</span></p></div></div>
      <div class="meter"><i style="width:${s.puntaje}%"></i></div>
      <p class="small muted" style="margin:0">Tocá para ver de qué depende.</p>
    </div>
    <p class="credit">Mis gastos ${VERSION} · Hecho por Facundo Burgos · @facuuuburgos</p>`;
}

function vInforme() {
  const el = $('#s-informe');
  const m = S.mes, r = resumen(m);
  const cats = categorias(m);
  const total = sum(cats, (x) => x.este) || 1;
  const top = cats[0];
  const ant = resumen(mesAnt(m));
  const ch = ant.gastado ? r.proyeccion / ant.gastado - 1 : 0;
  const ahorro = r.ingresos - r.gastado;
  const tasa = r.ingresos ? ahorro / r.ingresos : 0;
  const nEste = (cat) => deMes(m).filter((r) => r.cat === cat && r.gasto > 0).length;
  const subio = cats.filter((x) => x.promedio > 1500 && x.proyectado - x.promedio > 1000 && nEste(x.cat) >= 3 && !SIN_RASTRO.includes(x.cat)).sort((a, b) => (b.proyectado / b.promedio) - (a.proyectado / a.promedio))[0];
  const bajo = cats.filter((x) => x.promedio > 1000 && x.este > 0 && !FIJAS.includes(x.cat) && !SIN_RASTRO.includes(x.cat)).sort((a, b) => (a.proyectado / a.promedio) - (b.proyectado / b.promedio))[0];
  const puntos = [];
  if (top) puntos.push(`${catN(top.cat)} fue tu categoría más alta (${pct(top.este / total)}).`);
  if (bajo && bajo.proyectado < bajo.promedio) puntos.push(`Tus gastos en ${catN(bajo.cat).toLowerCase()} bajaron ${pct(1 - bajo.proyectado / bajo.promedio)}.`);
  if (r.c.enCurso && r.normal) puntos.push(r.proyeccion <= r.normal * 1.05 ? 'Tu proyección se mantiene en línea con lo normal.' : `Tu proyección está ${pct(r.proyeccion / r.normal - 1)} arriba de lo normal.`);
  const resumenTxt = `${r.c.enCurso ? 'Vas camino a gastar' : 'Gastaste'} ${ch <= 0 ? pct(-ch) + ' menos' : pct(ch) + ' más'} que el mes pasado${tasa > 0 ? ` y ${tasa >= 0.15 ? 'mantenés un buen nivel de ahorro' : 'estás ahorrando algo'}` : ''}.`;
  const mejorar = subio && subio.proyectado > subio.promedio * 1.15 ? `intentá limitar los gastos de ${catN(subio.cat).toLowerCase()}: vas ${pct(subio.proyectado / subio.promedio - 1)} arriba de tu promedio.` : 'seguí así y sumá lo que te sobre a tus objetivos.';
  el.innerHTML = `
    <div class="subhead"><button class="back" data-go="mas" aria-label="Volver">${ic('left')}</button><h1>Informe financiero</h1><button class="iconbtn" id="btnShare" aria-label="Compartir">${ic('share')}</button></div>
    <div class="card"><h2 style="justify-content:flex-start">${ic('spark').replace('<svg', '<svg style="width:18px;height:18px;color:var(--amber)"')} Resumen de ${mesSolo(m)}</h2>
      <p class="small muted" style="margin:-4px 0 14px">${esc(resumenTxt)}</p>
      <div class="row2"><div><p class="mid">${money(r.gastado)}</p><p class="label">Gasto total</p></div><div><p class="mid">${money(r.ingresos)}</p><p class="label">Ingresos</p></div></div>
      <hr class="sep">
      <div class="row2"><div><p class="mid ${ahorro >= 0 ? '' : 'red'}">${money(ahorro)}</p><p class="label">Ahorro real</p></div><div><p class="mid">${pct(Math.max(0, tasa))}</p><p class="label">Tasa de ahorro</p></div></div>
    </div>
    <div class="card"><h2>Puntos clave</h2><ul class="checks">${puntos.map((p) => `<li>${ic('check')}<span>${esc(p)}</span></li>`).join('')}</ul></div>
    <div class="card tight" style="display:flex;gap:12px;align-items:center"><div class="tile sm g">${ic('bars' in ICON ? 'bars' : 'trend')}</div><p class="small" style="margin:0">Para mejorar aún más: ${esc(mejorar)}</p></div>`;
  $('#btnShare').addEventListener('click', async () => {
    const t = `Mis gastos · ${cap(mesNombre(m))}\nGasto: ${money(r.gastado)}\nIngresos: ${money(r.ingresos)}\nAhorro: ${money(ahorro)} (${pct(Math.max(0, tasa))})\n${puntos.join('\n')}`;
    try { if (navigator.share) await navigator.share({ title: 'Informe financiero', text: t }); else { await navigator.clipboard.writeText(t); toast('Copiado'); } } catch (e) { /* cancelado */ }
  });
}

function vSalud() {
  const el = $('#s-salud');
  const s = salud();
  el.innerHTML = `
    <div class="subhead"><button class="back" data-go="mas" aria-label="Volver">${ic('left')}</button><h1>Salud financiera</h1></div>
    <div class="card salud"><p class="label">Tu puntaje</p><p class="big green">${s.puntaje}<span class="muted" style="font-size:20px">/100</span></p><p class="t1">${s.etiqueta}</p><div class="meter"><i style="width:${s.puntaje}%"></i></div></div>
    <div class="card"><h2>De qué depende</h2>${s.partes.map(([t, d, v, w]) => `<div class="item"><div class="grow"><p class="t1">${t} <span class="muted xs">(${w}%)</span></p><p class="t2" style="white-space:normal">${esc(d)}</p><div class="meter" style="height:5px;border-radius:5px;background:var(--tile);overflow:hidden;margin-top:6px"><i style="display:block;height:100%;width:${Math.round(v * 100)}%;background:${v >= 0.6 ? 'var(--green)' : v >= 0.3 ? 'var(--amber)' : 'var(--red)'}"></i></div></div><div class="amt">${Math.round(v * 100)}</div></div>`).join('')}</div>
    <p class="xs muted" style="margin:0 4px">Usa tus últimos 3 meses completos. No es un puntaje de banco: es una guía para ver si vas mejorando.</p>`;
}

function vFijos() {
  const el = $('#s-fijos');
  const l = fijosLista(mesHoy());
  el.innerHTML = `
    <div class="subhead"><button class="back" data-go="mas" aria-label="Volver">${ic('left')}</button><h1>Gastos fijos</h1></div>
    <div class="card"><p class="label">Ya comprometido cada mes</p><p class="big">${money(sum(l, (x) => x.porMes))}</p>
      <p class="small muted" style="margin:0">${ingresoPromedio() ? `Es el ${pct(sum(l, (x) => x.porMes) / ingresoPromedio())} de tu ingreso promedio, antes de empezar el mes.` : ''}</p></div>
    <div class="card tight">${l.map((x) => `<div class="item"><div class="tile sm">${ic(catI(x.cat))}</div><div class="grow"><p class="t1">${esc(x.gasto)}</p><p class="t2">${x.nuevo ? 'Nuevo · fijo desde ' + mesSolo(x.desde) : esc(catN(x.cat))}</p></div><div class="amt">${money(x.porMes)}</div></div>`).join('')}</div>
    <p class="xs muted" style="margin:0 4px">Cuando algo nuevo se repite 3 de los últimos 4 meses con montos parecidos, aparece acá solo.</p>`;
}

function vCalculo() {
  $('#s-calculo').innerHTML = `
    <div class="subhead"><button class="back" data-go="mas" aria-label="Volver">${ic('left')}</button><h1>Cómo se calcula</h1></div>
    <div class="card small" style="line-height:1.55">
      <p><b>Gasto</b> = compras con débito y crédito menos devoluciones, más transferencias, efectivo y pagos de cuentas. No cuentan los rechazos ni los pagos de tarjeta (serían las mismas compras dos veces).</p>
      <p><b>Lo normal</b> = promedio de tus últimos 3 meses completos, sin compras puntuales como GTA o Resident Evil.</p>
      <p><b>Proyección</b> = tus fijos como siempre + tus gastos variables al ritmo que vas este mes.</p>
      <p><b>Fijos</b> = gastos comunes, muay thai, gimnasio, suscripciones, cuentas, peluquería, psicóloga y cualquier cosa que se repita 3 de los últimos 4 meses con montos parecidos.</p>
      <p><b>Ingresos</b> = pagos de Better World por Wise (automático) + lo que anotás en la hoja "Gastos fijos".</p>
      <p><b>Dólares</b> se pasan a pesos con la cotización del día en que llega cada aviso.</p>
      <p style="margin-bottom:0">Tu planilla se actualiza sola cada 15 minutos con tus mails de Itaú, Santander y Wise. Esta app lee la planilla cada vez que la abrís.</p>
    </div>`;
}

function vConexion() {
  const con = LS.get('conexion', null);
  $('#s-conexion').innerHTML = `
    <div class="subhead">${S.raw ? `<button class="back" data-go="mas" aria-label="Volver">${ic('left')}</button>` : ''}<h1>Conexión</h1></div>
    <div class="card">
      <p class="small muted" style="margin-top:0">La app lee tus datos desde tu planilla de Google. Para conectarla, abrí el enlace de conexión que te pasé una sola vez, o pegá la dirección y la clave acá.</p>
      <label class="field">Dirección de la planilla (termina en /exec)<input class="input" id="inU" value="${con && !con.demo ? esc(con.u) : ''}" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off"></label>
      <label class="field">Clave<input class="input" id="inK" value="${con && !con.demo ? esc(con.k) : ''}" autocomplete="off"></label>
      <button class="btn p" style="margin-top:16px" id="btnCon">Conectar</button>
      ${S.raw ? `<button class="btn s" style="margin-top:10px" id="btnAct">${ic('refresh').replace('<svg', '<svg style="width:16px;height:16px;vertical-align:-3px;margin-right:6px"')}Actualizar ahora</button>` : ''}
      <p class="small muted" id="conEstado" style="margin:12px 0 0">${S.at ? 'Última actualización: ' + haceCuanto(S.at) : ''}${S.error ? ' · ' + esc(S.error) : ''}</p>
    </div>
    <p class="xs muted" style="margin:0 4px">La clave se guarda solo en este dispositivo. Sin ella nadie puede leer tus datos.</p>`;
  $('#btnCon').addEventListener('click', () => {
    const u = $('#inU').value.trim(), k = $('#inK').value.trim();
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(u) || !k) { $('#conEstado').textContent = 'Revisá la dirección y la clave.'; return; }
    LS.set('conexion', { u, k }); cargar(true);
  });
  const ba = $('#btnAct'); if (ba) ba.addEventListener('click', () => cargar(true));
}

/* ---------------- navegación, hojas, avisos ---------------- */
const PANT = { inicio: vInicio, movimientos: vMovimientos, analisis: vAnalisis, plan: vPlan, mas: vMas, informe: vInforme, salud: vSalud, fijos: vFijos, calculo: vCalculo, conexion: vConexion };
const NAVTAB = { informe: 'mas', salud: 'mas', fijos: 'mas', calculo: 'mas', conexion: 'mas' };
function ir(tab, ancla) {
  S.tab = tab;
  document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.id !== 's-' + tab; });
  document.querySelectorAll('.nav button').forEach((b) => b.classList.toggle('on', b.dataset.go === (NAVTAB[tab] || tab)));
  render();
  window.scrollTo(0, 0);
  if (ancla) setTimeout(() => { const t = document.getElementById(ancla); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  history.replaceState(null, '', '#' + tab);
}
function render() {
  if (!S.raw) { document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.id !== 's-conexion'; }); vConexion(); return; }
  const f = PANT[S.tab] || vInicio;
  try { f(); } catch (e) { console.error(e); $('#s-' + S.tab).innerHTML = `<div class="card"><p>Algo salió mal al dibujar esta pantalla.</p><p class="small muted">${esc(e.message)}</p></div>`; }
}

let hojaAbierta = null;
function hoja(html, alAbrir) {
  cerrarHoja();
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog');
  sh.innerHTML = '<div class="grab"></div>' + html;
  bg.addEventListener('click', cerrarHoja);
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-cerrar]')) cerrarHoja(); });
  document.body.append(bg, sh);
  hojaAbierta = [bg, sh];
  if (alAbrir) alAbrir(sh);
}
function cerrarHoja() { if (hojaAbierta) { hojaAbierta.forEach((e) => e.remove()); hojaAbierta = null; } }

function toast(t, ms = 2600) {
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.append(d);
  setTimeout(() => d.remove(), ms);
}

document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g && !e.target.closest('select')) { ir(g.dataset.go); return; }
  const a = e.target.closest('[data-accion]');
  if (a) { const v = a.dataset.accion; if (v.startsWith('cat:')) sheetCategoria(v.slice(4)); else { const [, tab, ancla] = v.split(':'); ir(tab, ancla); } return; }
  const c = e.target.closest('[data-cat]');
  if (c) { sheetCategoria(c.dataset.cat); return; }
  const mv = e.target.closest('[data-mov]');
  if (mv) { sheetMov(mv.dataset.mov); return; }
  const mg = e.target.closest('[data-mes]');
  if (mg) { S.abiertos[mg.dataset.mes] = !S.abiertos[mg.dataset.mes]; vMovimientos(); return; }
  const fl = e.target.closest('[data-filtro]');
  if (fl) { S.filtro = fl.dataset.filtro; vMovimientos(); return; }
  const pe = e.target.closest('[data-periodo]');
  if (pe) { S.periodo = +pe.dataset.periodo; vAnalisis(); return; }
  const pt = e.target.closest('[data-plantab]');
  if (pt) { S.planTab = pt.dataset.plantab; if (S.tab !== 'plan') ir('plan'); else vPlan(); window.scrollTo(0, 0); return; }
  const st = e.target.closest('[data-simtab]');
  if (st) { S.simTab = st.dataset.simtab; vSim(); return; }
  const nv = e.target.closest('[data-nivel]');
  if (nv) { prefs.nivel = nv.dataset.nivel; guardarPrefs(); vCalc(); return; }
  const ah = e.target.closest('[data-ahorro]');
  if (ah) { prefs.ahorro = +ah.dataset.ahorro; guardarPrefs(); vCalc(); return; }
  const ob = e.target.closest('[data-obj]');
  if (ob) { formObj(S.obj.find((o) => o.id === ob.dataset.obj)); return; }
  const eu = e.target.closest('[data-esc-usar]');
  if (eu) { const l = LS.get('escenarios', []); const x = l[+eu.dataset.escUsar]; if (x) { Object.assign(sim, x.sim); guardarSim(); S.simTab = 'esc'; vSim(); toast('Escenario cargado'); } return; }
  const eb = e.target.closest('[data-esc-borrar]');
  if (eb) { const l = LS.get('escenarios', []); l.splice(+eb.dataset.escBorrar, 1); LS.set('escenarios', l); vSim(); return; }
});

/* ---------------- datos ---------------- */
async function cargar(forzar) {
  const con = LS.get('conexion', null);
  if (!con) { render(); return; }
  if (con.demo) return;
  if (S.cargando) return;
  if (!forzar && Date.now() - S.at < 2 * 60e3) return;
  S.cargando = true; S.error = '';
  pintarEstado();
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 30000);
    const res = await fetch(con.u + (con.u.includes('?') ? '&' : '?') + 'k=' + encodeURIComponent(con.k) + '&t=' + Date.now(), { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(t);
    const j = await res.json();
    if (j.error === 'clave') throw new Error('La clave no es correcta');
    if (!j.movimientos) throw new Error('Respuesta inesperada');
    LS.set('cache', j); LS.set('cacheAt', Date.now());
    S.at = Date.now();
    preparar(j);
    if (S.tab === 'conexion') S.tab = 'inicio';
    S.cargando = false;
    ir(S.tab);
    if (forzar) toast('Datos actualizados');
  } catch (e) {
    S.cargando = false;
    S.error = e.name === 'AbortError' ? 'Sin conexión' : (e.message || 'Sin conexión');
    if (!S.raw) render(); else pintarEstado();
  }
}
function pintarEstado() { document.querySelectorAll('.estado').forEach((e) => { const d = document.createElement('div'); d.innerHTML = estadoHTML(); e.replaceWith(d.firstChild); }); }

/* ---------------- actualizaciones de la app ---------------- */
async function buscarVersion() {
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    const j = await r.json();
    if (j.v && j.v !== VERSION) {
      sessionStorage.setItem('mg-actualizada', j.v);
      if (navigator.serviceWorker) { const reg = await navigator.serviceWorker.getRegistration(); if (reg) await reg.update(); }
      location.reload();
    }
  } catch (e) { /* sin red */ }
}

/* ---------------- arranque ---------------- */
(function iniciar() {
  // sin zoom (pinch y doble toque)
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  let ultimoToque = 0;
  document.addEventListener('touchend', (e) => { const t = Date.now(); if (t - ultimoToque < 320 && !e.target.closest('input,select,textarea')) e.preventDefault(); ultimoToque = t; }, { passive: false });
  document.addEventListener('touchmove', (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });

  // enlace de conexión: #u=...&k=...
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get('u') && h.get('k')) { LS.set('conexion', { u: h.get('u'), k: h.get('k') }); history.replaceState(null, '', location.pathname); }

  const ver = sessionStorage.getItem('mg-actualizada');
  if (ver && ver === VERSION) { sessionStorage.removeItem('mg-actualizada'); setTimeout(() => toast('La app se actualizó a la versión ' + VERSION), 400); }

  const cache = LS.get('cache', null);
  if (cache) { S.at = LS.get('cacheAt', 0); preparar(cache); }
  const tab = location.hash.slice(1);
  S.tab = PANT[tab] ? tab : 'inicio';
  if (cache) ir(S.tab); else render();
  cargar(true).then(() => { if (S.raw && !cache) toast('¡Listo! Ya tenés tus datos.'); });
  buscarVersion();

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { buscarVersion(); cargar(false); } });
  window.addEventListener('focus', () => buscarVersion());
  setInterval(() => pintarEstado(), 60e3);
  window.addEventListener('resize', () => { if (S.tab === 'analisis') vAnalisis(); });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
