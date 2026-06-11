import CollectionModel from '../models/CollectionModel.js';

const STORAGE_KEY = 'topitop_collections';

const DEFAULT_COLLECTIONS = [
  { id: 'hombre', nombre: 'HombreTop', descripcion: 'Colección de moda masculina con las últimas tendencias.', activo: true, orden: 1 },
  { id: 'mujer', nombre: 'MujerTop', descripcion: 'Colección de moda femenina premium.', activo: true, orden: 2 },
  { id: 'kids', nombre: 'KidsTop', descripcion: 'Colección infantil divertida y cómoda.', activo: true, orden: 3 }
];

/**
 * REPOSITORY Pattern - Manages Collection persistence and data access.
 * Clean Code: Handles storage abstraction and provides clean interface.
 */
export default class CollectionRepository {
  static _loadAll() {
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COLLECTIONS));
      data = JSON.stringify(DEFAULT_COLLECTIONS);
    }
    const list = JSON.parse(data);
    return list.map(item => CollectionModel.fromJSON(item));
  }

  static _saveAll(collections) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections.map(c => c.toJSON())));
  }

  static async findAll() {
    return this._loadAll().sort((a, b) => a.orden - b.orden);
  }

  static async findById(collectionId) {
    const list = this._loadAll();
    const found = list.find(item => item.id === collectionId);
    return found || null;
  }

  static async update(collectionId, data) {
    const list = this._loadAll();
    const index = list.findIndex(item => item.id === collectionId);
    if (index === -1) throw new Error(`Colección con ID ${collectionId} no encontrada.`);

    const updated = new CollectionModel({ ...list[index].toJSON(), ...data, id: collectionId });
    
    const { isValid, errors } = updated.validate();
    if (!isValid) throw new Error(`Validación fallida: ${Object.values(errors).join(' ')}`);

    list[index] = updated;
    this._saveAll(list);
    return updated;
  }
}
