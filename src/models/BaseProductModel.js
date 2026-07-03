/**
 * MODEL layer - Base representation for all product entities in Topitop.
 * Clean Code: Implements SRP, clear attribute names, and precise serialization.
 */
export default class BaseProductModel {
  constructor({
    id = '',
    nombre = '',
    descripcion = '',
    precio = 0,
    precioOriginal = 0,
    descuento = 0,
    urlImagen = '',
    galeriaImagenes = [],
    colores = [],
    tallas = [],
    activo = true,
    destacado = false,
    categoryId = '',
    collectionId = '',
    creadoEn = null,
    actualizadoEn = null
  } = {}) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = Number(precio);
    this.precioOriginal = Number(precioOriginal);
    this.descuento = Number(descuento) || this.calculateDiscount(this.precioOriginal, this.precio);
    this.urlImagen = urlImagen;
    this.galeriaImagenes = Array.isArray(galeriaImagenes) ? galeriaImagenes : [];
    this.colores = Array.isArray(colores) ? colores : [];
    this.tallas = Array.isArray(tallas) ? tallas : [];
    this.activo = Boolean(activo);
    this.destacado = Boolean(destacado);
    this.categoryId = categoryId;
    this.collectionId = collectionId;
    this.creadoEn = creadoEn || new Date().toISOString();
    this.actualizadoEn = actualizadoEn || new Date().toISOString();
  }

  calculateDiscount(original, discounted) {
    if (!original || !discounted || original <= discounted) return 0;
    return Math.round(((original - discounted) / original) * 100);
  }

  validate(strategy) {
    const errors = {};

    if (!this.nombre.trim()) {
      errors.nombre = 'El nombre del producto es obligatorio.';
    }
    if (this.precioOriginal <= 0) {
      errors.precioOriginal = 'El precio original debe ser un número positivo mayor a 0.';
    }
    if (this.precio < 0) {
      errors.precio = 'El precio con descuento no puede ser negativo.';
    }
    if (this.precio > this.precioOriginal) {
      errors.precio = 'El precio con descuento no puede ser mayor al precio original.';
    }
    if (!this.urlImagen) {
      errors.urlImagen = 'La imagen principal del producto es obligatoria.';
    }
    if (!this.categoryId) {
      errors.categoryId = 'La categoría es obligatoria.';
    }
    if (!this.collectionId) {
      errors.collectionId = 'La colección es obligatoria.';
    }
    if (this.colores.length === 0) {
      errors.colores = 'Debe seleccionar al menos un color.';
    }

    // Apply specific strategy validation if provided
    if (strategy && typeof strategy.validate === 'function') {
      const strategyResult = strategy.validate(this);
      if (!strategyResult.isValid) {
        Object.assign(errors, strategyResult.errors);
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      precioOriginal: this.precioOriginal,
      descuento: this.descuento,
      urlImagen: this.urlImagen,
      galeriaImagenes: this.galeriaImagenes,
      colores: this.colores,
      tallas: this.tallas,
      activo: this.activo,
      destacado: this.destacado,
      categoryId: this.categoryId,
      collectionId: this.collectionId,
      creadoEn: this.creadoEn,
      actualizadoEn: this.actualizadoEn
    };
  }
}
