/**
 * MODEL layer - Represents a shopping collection (e.g. HombreTop, MujerTop, KidsTop).
 * Clean Code: Implements SRP, clear attribute names, and precise serialization.
 */
export default class CollectionModel {
  constructor({ id = '', nombre = '', descripcion = '', activo = true, orden = 0 } = {}) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.activo = Boolean(activo);
    this.orden = Number(orden);
  }

  validate() {
    const errors = {};
    if (!this.id) errors.id = 'El ID de la colección es obligatorio.';
    if (!this.nombre.trim()) errors.nombre = 'El nombre de la colección es obligatorio.';
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
      activo: this.activo,
      orden: this.orden
    };
  }

  static fromJSON(json) {
    return new CollectionModel(json);
  }
}
