/**
 * PRODUCT DATA SERVICE (Data Access / Adapter Layer)
 * Clean Code Principle: Single Responsibility Principle (SRP) & Adapter Pattern.
 * This module is the single source of product details. It provides a standard
 * interface to fetch products by ID, returning a unified contract regardless of
 * whether the product comes from hardcoded mock data or various local storage repos.
 */

const NIKO_JACKET = {
  id: "3207945",
  coleccion: "Topitop hombre",
  nombre: "Casaca Hombre Niko Marron Roble",
  codigo: "3207945",
  precioActual: 119.95,
  precioOriginal: 239.90,
  descuentoPorcentaje: 50,
  tallasDisponibles: ["M", "L", "XL"],
  tallasNoDisponibles: ["S"],
  imagenes: [
    "img/productos/niko-marron-1.png",
    "img/productos/niko-marron-2.png",
    "img/productos/niko-marron-3.png",
    "img/productos/niko-marron-4.png"
  ],
  descripcion: "Casaca de gamuza sintética con cierre frontal y solapa con botones metálicos a presión. Cuenta con bolsillos laterales y un calce semi-ajustado ideal para el otoño.",
  informacionModelo: "El modelo mide 1.85m y usa talla M."
};

/**
 * Maps a generic ProductRepository product to the detail view contract.
 */
function mapCatalogProduct(product) {
  const isBase64 = product.urlImagen.startsWith('data:image/');
  const isAbsolute = product.urlImagen.includes('://') || product.urlImagen.startsWith('//');
  // Since details page is under /producto-detalle/, we go up one level to reach the root images path
  const imageSrc = (isBase64 || isAbsolute) ? product.urlImagen : `../${product.urlImagen}`;

  // Build a dummy gallery using the main image
  const imagenes = product.galeriaImagenes && product.galeriaImagenes.length > 0
    ? product.galeriaImagenes.map(img => (img.includes('://') || img.startsWith('data:')) ? img : `../${img}`)
    : [imageSrc, imageSrc, imageSrc];

  return {
    id: product.id,
    coleccion: `Topitop ${product.collectionId || 'colección'}`,
    nombre: product.nombre,
    codigo: product.id.replace('prod-', ''),
    precioActual: product.precio,
    precioOriginal: product.precioOriginal || product.precio,
    descuentoPorcentaje: product.descuento || 0,
    tallasDisponibles: product.tallas && product.tallas.length > 0 ? product.tallas : ["S", "M", "L"],
    tallasNoDisponibles: ["XS"],
    imagenes: imagenes,
    descripcion: product.descripcion || "Prenda de alta calidad con acabados premium, confeccionada con los mejores materiales de la colección Topitop.",
    informacionModelo: `El modelo viste esta prenda en talla ${product.tallas ? product.tallas[0] : 'M'}.`
  };
}

/**
 * Maps a home section top product to the detail view contract.
 */
function mapHomeTopProduct(product) {
  const isAbsolute = product.urlImagen.includes('://') || product.urlImagen.startsWith('//');
  const imageSrc = isAbsolute ? product.urlImagen : `../${product.urlImagen}`;

  const discount = Number(product.descuento) || 0;
  const precioOriginal = discount > 0 ? Math.round(product.precio / (1 - discount / 100)) : product.precio;

  return {
    id: product.id,
    coleccion: `Topitop ${product.genero || 'colección'}`,
    nombre: product.nombre,
    codigo: product.id.replace('top-', ''),
    precioActual: product.precio,
    precioOriginal: precioOriginal,
    descuentoPorcentaje: discount,
    tallasDisponibles: ["S", "M", "L"],
    tallasNoDisponibles: ["XL"],
    imagenes: [imageSrc, imageSrc, imageSrc],
    descripcion: `Prenda premium de nuestra sección destacada. Diseñada para lucir un estilo moderno con el sello de calidad de Topitop.`,
    informacionModelo: "El modelo mide 1.78m y viste la talla M."
  };
}

/**
 * Obtiene los detalles de un producto buscando en el mock o en los repositorios de LocalStorage.
 * @param {string} id - El identificador único del producto.
 * @returns {Object|null} El producto formateado o null si no se encuentra.
 */
export function obtenerProductoPorId(id) {
  if (!id) return null;

  // 1. Check if it matches the Niko mock jacket
  if (id === NIKO_JACKET.id) {
    return NIKO_JACKET;
  }

  // 2. Check if it's from the Home section top
  if (id.startsWith('top-')) {
    const data = localStorage.getItem('topitop_home_section_top');
    if (data) {
      const list = JSON.parse(data);
      const found = list.find(item => item.id === id);
      if (found) {
        return mapHomeTopProduct(found);
      }
    }
  }

  // 3. Check if it's from the general products list (localStorage catalog)
  const data = localStorage.getItem('topitop_products');
  if (data) {
    const list = JSON.parse(data);
    const found = list.find(item => item.id === id);
    if (found) {
      return mapCatalogProduct(found);
    }
  }

  return null;
}
