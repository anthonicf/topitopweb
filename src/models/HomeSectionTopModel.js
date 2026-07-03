import { 
  isNonEmptyString, 
  hasMinLength, 
  isPositiveNumber, 
  isValidDiscountPercentage, 
  isValidImageUrl 
} from '../utils/validators.js';

/**
 * MODEL layer - Represents a featured product in "Lo más TOP" section.
 * Clean Code: Implements SRP, clear attribute names, and precise validation.
 */
export default class HomeSectionTopModel {
  constructor({ id = null, nombre = '', color = '', precio = 0, descuento = 0, urlImagen = '', genero = 'mujer', activo = true } = {}) {
    this.id = id;
    this.nombre = nombre;
    this.color = color;
    this.precio = Number(precio);
    this.descuento = descuento ? Number(descuento) : 0;
    this.urlImagen = urlImagen;
    this.genero = genero; // 'mujer' | 'hombre' | 'kids'
    this.activo = Boolean(activo);
  }

  /**
   * Valida la integridad del modelo. Retorna un objeto con el estado y los errores.
   * @returns {{ isValid: boolean, errors: Object }}
   */
  validate() {
    const errors = {};

    if (!hasMinLength(this.nombre, 3)) {
      errors.nombre = 'El nombre de la prenda debe tener al menos 3 caracteres.';
    }

    if (!isNonEmptyString(this.color)) {
      errors.color = 'El color de la prenda es obligatorio.';
    }

    if (!isPositiveNumber(this.precio) || this.precio <= 0) {
      errors.precio = 'El precio debe ser un número positivo mayor a 0.';
    }

    if (!isValidDiscountPercentage(this.descuento)) {
      errors.descuento = 'El descuento debe ser un porcentaje válido entre 0 y 100.';
    }

    if (!isValidImageUrl(this.urlImagen)) {
      errors.urlImagen = 'La URL de la imagen no es válida o no corresponde a una extensión de imagen común.';
    }

    const validGeneros = ['mujer', 'hombre', 'kids'];
    if (!validGeneros.includes(this.genero)) {
      errors.genero = 'El género seleccionado no es válido.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Serializa el objeto a un formato JSON simple.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      color: this.color,
      precio: this.precio,
      descuento: this.descuento,
      urlImagen: this.urlImagen,
      genero: this.genero,
      activo: this.activo
    };
  }

  /**
   * Deserializa un objeto JSON plano a una instancia del Modelo.
   * @param {Object} json 
   * @returns {HomeSectionTopModel}
   */
  static fromJSON(json) {
    return new HomeSectionTopModel(json);
  }
}
