import HomeSectionTopController from '../../controllers/HomeSectionTopController.js';
import HomeSectionSearchController from '../../controllers/HomeSectionSearchController.js';
import HomeSectionKidsController from '../../controllers/HomeSectionKidsController.js';
import AdminAuthController from '../../controllers/AdminAuthController.js';
import { bindImagePreview } from '../../utils/imagePreview.js';

// VIEW layer - Admin dashboard main presentation coordinator
const authController = new AdminAuthController();
const topController = new HomeSectionTopController();
const searchController = new HomeSectionSearchController();
const kidsController = new HomeSectionKidsController();

let activeSection = 'top'; // 'top' | 'search' | 'kids'
let editingItemId = null; // null cuando estamos agregando

const SELECTORS = {
  sectionTitle: 'section-title',
  contentContainer: 'content-container',
  addItemBtn: 'add-item-btn',
  logoutBtn: 'logout-btn',
  toastContainer: 'toast-container',
  modalContainer: 'modal-container',
  sidebarMenuItems: '.sidebar-menu .menu-item'
};

document.addEventListener('DOMContentLoaded', () => {
  setupSidebarNavigation();
  setupGlobalActions();
  loadActiveSection();
});

/**
 * Muestra una notificación temporal en pantalla (Toast).
 * Clean Code: Responsabilidad única, temporizador autocontenido.
 */
function showToast(message, isError = false) {
  const container = document.getElementById(SELECTORS.toastContainer);
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
  toast.innerHTML = `
    <i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Autoeliminación del toast tras 4 segundos
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
}

/**
 * Escucha y maneja la navegación del Sidebar lateral.
 */
function setupSidebarNavigation() {
  const menuItems = document.querySelectorAll(SELECTORS.sidebarMenuItems);
  
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      activeSection = item.dataset.section;
      updateHeaderTitle();
      loadActiveSection();
    });
  });
}

/**
 * Actualiza el título y subtítulo de la cabecera según la sección seleccionada.
 */
function updateHeaderTitle() {
  const titleEl = document.getElementById(SELECTORS.sectionTitle);
  const descEl = titleEl.nextElementSibling;

  const titles = {
    top: { text: 'Sección "Lo más TOP"', desc: 'Edita los productos destacados de la página de inicio.' },
    search: { text: 'Sección "Lo más buscado"', desc: 'Gestiona los enlaces de categorías de calzado y accesorios.' },
    kids: { text: 'Sección "Kids TOP"', desc: 'Organiza la galería de fotos de la colección infantil.' }
  };

  titleEl.textContent = titles[activeSection].text;
  descEl.textContent = titles[activeSection].desc;
}

/**
 * Registra acciones de agregar ítem y cerrar sesión.
 */
function setupGlobalActions() {
  document.getElementById(SELECTORS.addItemBtn).addEventListener('click', () => {
    openFormModal();
  });

  document.getElementById(SELECTORS.logoutBtn).addEventListener('click', async () => {
    if (confirm('¿Está seguro de que desea cerrar la sesión administrativa?')) {
      await authController.logout();
      window.location.replace('./login.html');
    }
  });
}

/**
 * Carga e inyecta la plantilla y los datos de la sección activa.
 */
async function loadActiveSection() {
  const container = document.getElementById(SELECTORS.contentContainer);
  container.innerHTML = `
    <div class="loading-overlay">
      <i class="fa-solid fa-circle-notch loading-spinner"></i>
    </div>
  `;

  try {
    const templatePath = `./partials/${activeSection}Table.html`;
    const response = await fetch(templatePath);
    if (!response.ok) throw new Error('No se pudo cargar la plantilla de la tabla.');
    
    container.innerHTML = await response.text();
    await renderTableData();
  } catch (error) {
    showToast(`Error al cargar sección: ${error.message}`, true);
  }
}

/**
 * Obtiene el controlador asíncrono para la sección actual.
 */
function getActiveController() {
  const controllers = {
    top: topController,
    search: searchController,
    kids: kidsController
  };
  return controllers[activeSection];
}

/**
 * Renderiza los datos en la tabla correspondiente.
 */
async function renderTableData() {
  const controller = getActiveController();
  const items = await controller.getAllItems();

  const renderers = {
    top: renderTopRows,
    search: renderSearchRows,
    kids: renderKidsRows
  };

  renderers[activeSection](items);
}

/**
 * Genera el badge de estado activo/inactivo.
 * @param {boolean} isActive 
 */
function getStatusBadgeHtml(isActive) {
  return isActive 
    ? '<span class="badge badge-active">Activo</span>' 
    : '<span class="badge badge-inactive">Oculto</span>';
}

/**
 * Genera el botón de toggle de visibilidad.
 * @param {boolean} isActive 
 */
function getToggleBtnHtml(isActive) {
  const icon = isActive ? 'fa-eye-slash' : 'fa-eye';
  const label = isActive ? 'Ocultar' : 'Mostrar';
  return `<button class="btn-action btn-toggle" title="${label}"><i class="fa-solid ${icon}"></i></button>`;
}

/**
 * Agrega los manejadores de eventos comunes (editar, eliminar, visibilidad) a una fila de tabla.
 * @param {HTMLElement} rowElement 
 * @param {string} itemId 
 */
function bindRowActionEvents(rowElement, itemId) {
  const controller = getActiveController();

  rowElement.querySelector('.btn-toggle').addEventListener('click', async () => {
    try {
      await controller.toggleVisibility(itemId);
      showToast('Visibilidad de item actualizada.');
      loadActiveSection();
    } catch (e) {
      showToast(e.message, true);
    }
  });

  rowElement.querySelector('.btn-edit').addEventListener('click', () => {
    openFormModal(itemId);
  });

  rowElement.querySelector('.btn-delete').addEventListener('click', async () => {
    if (confirm('¿Está seguro de que desea eliminar este elemento de forma permanente?')) {
      try {
        await controller.deleteItem(itemId);
        showToast('Elemento eliminado exitosamente.');
        loadActiveSection();
      } catch (e) {
        showToast(e.message, true);
      }
    }
  });
}

/**
 * Renderiza las filas de la tabla de productos TOP.
 */
function renderTopRows(items) {
  const tbody = document.getElementById('top-table-body');
  tbody.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('tr');
    if (!item.activo) row.className = 'inactive';

    const discountText = item.descuento > 0 ? `-${item.descuento}%` : 'Sin dcto.';
    row.innerHTML = `
      <td class="admin-td-image"><img src="../../../${item.urlImagen}" class="admin-table-thumbnail" alt="${item.nombre}"></td>
      <td class="admin-td" style="font-weight: 600;">${item.nombre}</td>
      <td class="admin-td">${item.color}</td>
      <td class="admin-td" style="font-weight: 500;">S/ ${item.precio.toFixed(2)}</td>
      <td class="admin-td"><span style="color: ${item.descuento > 0 ? '#10b981' : 'var(--text-muted)'};">${discountText}</span></td>
      <td class="admin-td" style="text-transform: capitalize;">${item.genero}</td>
      <td class="admin-td">${getStatusBadgeHtml(item.activo)}</td>
      <td class="admin-td actions-cell">
        ${getToggleBtnHtml(item.activo)}
        <button class="btn-action btn-edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-action btn-action-delete btn-delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    bindRowActionEvents(row, item.id);
    tbody.appendChild(row);
  });
}

/**
 * Renderiza las filas de la tabla "Lo más buscado".
 */
function renderSearchRows(items) {
  const tbody = document.getElementById('search-table-body');
  tbody.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('tr');
    if (!item.activo) row.className = 'inactive';

    row.innerHTML = `
      <td class="admin-td-image"><img src="../../../${item.urlImagen}" class="admin-table-thumbnail" alt="Categoría"></td>
      <td class="admin-td" style="font-weight: 600;">${item.categoria}</td>
      <td class="admin-td">${item.subcategoria}</td>
      <td class="admin-td">${getStatusBadgeHtml(item.activo)}</td>
      <td class="admin-td actions-cell">
        ${getToggleBtnHtml(item.activo)}
        <button class="btn-action btn-edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-action btn-action-delete btn-delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    bindRowActionEvents(row, item.id);
    tbody.appendChild(row);
  });
}

/**
 * Renderiza las filas de la tabla de la galería Kids TOP.
 */
function renderKidsRows(items) {
  const tbody = document.getElementById('kids-table-body');
  tbody.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('tr');
    if (!item.activo) row.className = 'inactive';

    row.innerHTML = `
      <td class="admin-td-image"><img src="../../../${item.urlImagen}" class="admin-table-thumbnail" alt="Galería Kids"></td>
      <td class="admin-td" style="font-weight: 600;">Posición ${item.orden}</td>
      <td class="admin-td">${getStatusBadgeHtml(item.activo)}</td>
      <td class="admin-td actions-cell">
        ${getToggleBtnHtml(item.activo)}
        <button class="btn-action btn-edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-action btn-action-delete btn-delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    bindRowActionEvents(row, item.id);
    tbody.appendChild(row);
  });
}

/**
 * Carga e inicializa el modal del formulario CRUD.
 * @param {string|null} itemId Identificador si es edición, null si es agregar.
 */
async function openFormModal(itemId = null) {
  editingItemId = itemId;
  const container = document.getElementById(SELECTORS.modalContainer);

  try {
    const response = await fetch('./partials/itemFormModal.html');
    if (!response.ok) throw new Error('No se pudo cargar el modal del formulario.');
    
    container.innerHTML = await response.text();
    setupModalElements(itemId);
  } catch (error) {
    showToast(`Error al abrir modal: ${error.message}`, true);
  }
}

/**
 * Configura los inputs y eventos dentro de la instancia modal recién cargada.
 */
function setupModalElements(itemId) {
  const modal = document.getElementById('item-modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const form = document.getElementById('item-form');
  
  titleEl.textContent = itemId ? 'Editar Elemento' : 'Agregar Nuevo Elemento';

  // Mostrar los inputs de la sección actual
  document.getElementById(`fields-${activeSection}`).style.display = 'block';

  // Enlazar vista previa de imagen en tiempo real
  const urlInput = document.getElementById('form-url-imagen');
  const previewImg = document.getElementById('form-img-preview');
  bindImagePreview(urlInput, previewImg);

  // Carga de datos si es edición
  if (itemId) {
    populateFormForEdit(itemId, previewImg);
  }

  // Cerrar modal
  const closeModal = () => modal.remove();
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Manejo de guardado
  form.addEventListener('submit', (e) => handleFormSubmit(e, closeModal));
}

/**
 * Llena el formulario con los datos actuales del item a editar.
 */
async function populateFormForEdit(itemId, previewImg) {
  const controller = getActiveController();
  const item = await controller.getItemById(itemId);

  document.getElementById('form-url-imagen').value = item.urlImagen;
  previewImg.src = `../../../${item.urlImagen}`;
  document.getElementById('form-activo').checked = item.activo;

  if (activeSection === 'top') {
    document.getElementById('form-nombre').value = item.nombre;
    document.getElementById('form-color').value = item.color;
    document.getElementById('form-precio').value = item.precio;
    document.getElementById('form-descuento').value = item.descuento;
    document.getElementById('form-genero').value = item.genero;
  } else if (activeSection === 'search') {
    document.getElementById('form-categoria').value = item.categoria;
    document.getElementById('form-subcategoria').value = item.subcategoria;
  } else if (activeSection === 'kids') {
    document.getElementById('form-orden').value = item.orden;
  }
}

/**
 * Lee los datos de los inputs del formulario adaptado y los agrupa en un objeto.
 */
function serializeFormFields() {
  const formData = {
    urlImagen: document.getElementById('form-url-imagen').value.trim(),
    activo: document.getElementById('form-activo').checked
  };

  if (activeSection === 'top') {
    formData.nombre = document.getElementById('form-nombre').value.trim();
    formData.color = document.getElementById('form-color').value.trim();
    formData.precio = Number(document.getElementById('form-precio').value);
    formData.descuento = Number(document.getElementById('form-descuento').value);
    formData.genero = document.getElementById('form-genero').value;
  } else if (activeSection === 'search') {
    formData.categoria = document.getElementById('form-categoria').value;
    formData.subcategoria = document.getElementById('form-subcategoria').value;
  } else if (activeSection === 'kids') {
    formData.orden = Number(document.getElementById('form-orden').value);
  }

  return formData;
}

/**
 * Procesa el submit de creación o actualización del formulario.
 */
async function handleFormSubmit(event, closeCallback) {
  event.preventDefault();
  const controller = getActiveController();
  const payload = serializeFormFields();

  try {
    if (editingItemId) {
      await controller.updateItem(editingItemId, payload);
      showToast('Elemento actualizado con éxito.');
    } else {
      await controller.createItem(payload);
      showToast('Elemento creado con éxito.');
    }

    closeCallback();
    loadActiveSection();
  } catch (error) {
    showToast(error.message, true);
  }
}
