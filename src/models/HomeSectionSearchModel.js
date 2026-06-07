import { isNonEmptyString, isValidImageUrl } from '../utils/validators.js';

/**
 * MODEL layer - Represents a search category in "Lo más buscado" section.
 * Clean Code: Implements validation logic and strict options arrays.
 */
export default class HomeSectionSearchModel {
  constructor({ id = null, categoria = '', subcategoria = '', urlImagen = '', activo = true } = {}) {
    this.id = id;
    this.categoria = categoria; // 'Accesorios' | 'Calzados'
    this.subcategoria = subcategoria; // 'Mujer Top' | 'Hombre Top' | 'Kid Top'
    this.urlImagen = urlImagen;
    this.activo = Boolean(activo);
  }

  /**
   * Valida la integridad del modelo.
   * @returns {{ isValid: boolean, errors: Object }}
   */
  validate() {
    const errors = {};

    const validCategorias = ['Accesorios', 'Calzados'];
    if (!validCategorias.includes(this.categoria)) {
      errors.categoria = 'La categoría debe ser Accesorios o Calzados.';
    }

    const validSubcategorias = ['Mujer Top', 'Hombre Top', 'Kid Top'];
    if (!validSubcategorias.includes(this.subcategoria)) {
      errors.subcategoria = 'La subcategoría seleccionada no es válida.';
    }

    if (!isValidImageUrl(this.urlImagen)) {
      errors.urlImagen = 'La URL de la imagen no es válida o no corresponde a una extensión de imagen común.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Serializa el objeto a JSON plano.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      categoria: this.categoria,
      subcategoria: this.subcategoria,
      urlImagen: this.urlImagen,
      activo: this.activo
    };
  }

  /**
   * Deserializa JSON plano a una instancia.
   * @param {Object} json 
   * @returns {HomeSectionSearchModel}
   */
  static fromJSON(json) {
    return new HomeSectionSearchModel(json);
  }
}
