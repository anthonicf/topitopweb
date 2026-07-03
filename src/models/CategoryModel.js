/**
 * MODEL layer - Represents a category within a collection (e.g. Camisas de lino, Pantalones).
 * Clean Code: Implements SRP, clear attribute names, and precise serialization.
 */
export default class CategoryModel {
  constructor({
    id = '',
    nombre = '',
    descripcion = '',
    urlImagenPortada = '',
    collectionId = '',
    orden = 0,
    activo = true,
    slug = ''
  } = {}) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.urlImagenPortada = urlImagenPortada;
    this.collectionId = collectionId;
    this.orden = Number(orden);
    this.activo = Boolean(activo);
    this.slug = slug || this.generateSlug(nombre);
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  validate() {
    const errors = {};
    if (!this.nombre.trim()) errors.nombre = 'El nombre de la categoría es obligatorio.';
    if (!this.collectionId) errors.collectionId = 'La colección es obligatoria.';
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
      urlImagenPortada: this.urlImagenPortada,
      collectionId: this.collectionId,
      orden: this.orden,
      activo: this.activo,
      slug: this.slug
    };
  }

  static fromJSON(json) {
    return new CategoryModel(json);
  }
}
