// Pegá aquí la URL CSV publicada de Google Sheets.
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQnf-O1352ZftvdB37wF5t6jwzD-AJPrOUC47lMTxYDO_J5QAGjM5OtpFNPSGndRxeHemsDfltxEw7/pub?gid=1178124590&single=true&output=csv";
// Número internacional sin +, espacios ni guiones. Ejemplo: 549358XXXXXXXX.
const WHATSAPP_NUMBER = "";

const LOCAL_CSV_URL = "data/menu.csv";
const CATEGORIES = [
  { name: "Café caliente", subtitle: "Café seleccionado y preparado al momento." },
  { name: "Café frío", subtitle: "Para disfrutar en cualquier momento." },
  { name: "Signatures", subtitle: "Creaciones únicas, hechas para vos." },
  { name: "Extras", subtitle: "" },
  { name: "Brunch", subtitle: "Ingredientes frescos, combinaciones que enamoran y el mejor café para acompañar." },
  { name: "Agregá a tu brunch", subtitle: "" },
  { name: "Sandwiches", subtitle: "Clásicos que nunca fallan." },
  { name: "Waffles", subtitle: "Dulzuras que acompañan." },
  { name: "Smoothies", subtitle: "Puro sabor, naturalmente." },
  { name: "Batidos", subtitle: "Naturales y refrescantes." },
  { name: "Lemonades", subtitle: "Livianas y llenas de sabor." },
  { name: "Fresh Juices", subtitle: "Exprimidos al momento." },
];

const nav = document.querySelector("#category-nav");
const sections = document.querySelector("#menu-sections");
const status = document.querySelector("#menu-status");
const whatsappLink = document.querySelector("#whatsapp-link");

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field.trim());
    if (row.some((cell) => cell !== "")) rows.push(row);
  }
  if (rows.length < 2) throw new Error("El CSV no contiene productos.");

  const headers = rows[0].map((header) => header.toLowerCase());
  const required = ["categoria", "nombre", "descripcion", "precio", "mas_pedido", "disponible", "orden"];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Faltan columnas en el CSV: ${missing.join(", ")}.`);

  return rows.slice(1).map((cells, index) => {
    const record = Object.fromEntries(headers.map((header, column) => [header, cells[column] || ""]));
    const price = Number(record.precio.replace(/[^\d-]/g, ""));
    const order = Number(record.orden);
    const categoryExists = CATEGORIES.some((category) => category.name.toLocaleLowerCase("es-AR") === record.categoria.toLocaleLowerCase("es-AR"));
    if (!record.categoria || !categoryExists || !record.nombre || !Number.isFinite(price) || price < 0 || !Number.isFinite(order) || order < 0) {
      throw new Error(`Hay datos inválidos en la fila ${index + 2} del CSV.`);
    }

    const parseFlag = (value, defaultValue, field) => {
      if (!value) return defaultValue;
      if (/^(si|sí|true|1|x)$/i.test(value)) return true;
      if (/^(no|false|0)$/i.test(value)) return false;
      throw new Error(`El valor de ${field} no es válido en la fila ${index + 2}.`);
    };

    return {
      ...record,
      precio: price,
      orden: order,
      mas_pedido: parseFlag(record.mas_pedido, false, "mas_pedido"),
      disponible: parseFlag(record.disponible, true, "disponible"),
    };
  });
}

async function loadCSV(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar el CSV (${response.status}).`);
  return parseCSV(await response.text());
}

function makeTag(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function formatPrice(price) {
  return `$${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(price)}`;
}

function renderMenu(products) {
  const visibleProducts = products.filter((product) => product.disponible);
  const fragment = document.createDocumentFragment();
  const navFragment = document.createDocumentFragment();
  const observedSections = [];

  CATEGORIES.forEach((category, categoryIndex) => {
    const items = visibleProducts
      .filter((product) => product.categoria.trim().toLocaleLowerCase("es-AR") === category.name.toLocaleLowerCase("es-AR"))
      .sort((first, second) => first.orden - second.orden);
    if (!items.length) return;

    const sectionId = `categoria-${categoryIndex + 1}`;
    const link = document.createElement("a");
    link.href = `#${sectionId}`;
    link.textContent = category.name;
    navFragment.append(link);

    const section = makeTag("section", "menu-section");
    section.id = sectionId;
    section.setAttribute("aria-labelledby", `${sectionId}-titulo`);

    const heading = makeTag("h2", "menu-section__heading", category.name);
    heading.id = `${sectionId}-titulo`;
    section.append(heading);
    if (category.subtitle) section.append(makeTag("p", "menu-section__subtitle", category.subtitle));

    const list = makeTag("ul", "menu-items");
    items.forEach((product) => {
      const item = makeTag("li", "menu-item");
      const main = makeTag("div", "menu-item__main");
      const name = makeTag("h3", "menu-item__name", product.nombre);
      if (product.mas_pedido) {
        const badge = makeTag("span", "badge");
        badge.append(makeTag("span", "badge__star", "★"));
        badge.append(document.createTextNode("Más pedido"));
        name.append(badge);
      }
      main.append(name);
      if (product.descripcion) main.append(makeTag("p", "menu-item__description", product.descripcion));
      item.append(main, makeTag("span", "menu-item__price", formatPrice(product.precio)));
      list.append(item);
    });

    section.append(list);
    fragment.append(section);
    observedSections.push({ section, link });
  });

  if (!fragment.childNodes.length) throw new Error("No hay productos disponibles para mostrar.");
  sections.replaceChildren(fragment);
  nav.replaceChildren(navFragment);

  const observer = new IntersectionObserver((entries) => {
    const current = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
    if (!current) return;
    observedSections.forEach(({ section, link }) => {
      if (section === current.target) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-25% 0px -65% 0px", threshold: [0, 0.2, 0.5, 1] });

  observedSections.forEach(({ section }) => observer.observe(section));
}

async function init() {
  if (WHATSAPP_NUMBER) {
    whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, Narcizo's Coffee-Bar")}`;
  }

  try {
    let products;
    if (SHEET_CSV_URL.trim()) {
      try {
        products = await loadCSV(SHEET_CSV_URL.trim());
        status.textContent = "Carta actualizada.";
      } catch (error) {
        console.warn("No se pudo usar el CSV publicado; se intentará la copia local.", error);
        products = await loadCSV(LOCAL_CSV_URL);
        status.textContent = "Mostrando la carta de respaldo.";
      }
    } else {
      products = await loadCSV(LOCAL_CSV_URL);
      status.textContent = "Mostrando la carta.";
    }
    renderMenu(products);
  } catch (error) {
    console.error("No se pudo cargar la carta.", error);
    status.classList.add("menu-status--error");
    status.textContent = "No pudimos cargar la carta. Revisá tu conexión e intentá nuevamente.";
  }
}

init();
