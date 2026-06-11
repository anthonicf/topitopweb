/**
 * OBSERVER Pattern - Dispatches events when categories or products are updated.
 * Clean Code: Single Responsibility for event distribution, decouples UI updates.
 */
class CategoryChangeObserver {
  constructor() {
    this.subscribers = [];
    
    // Escuchar cambios de localStorage entre pestañas/ventanas del mismo origen
    window.addEventListener('storage', (event) => {
      if (event.key === 'topitop_categories' || event.key === 'topitop_products') {
        this.notify('storage_update', null);
      }
    });
  }

  /**
   * Suscribe una función callback a los cambios. Soporta:
   * 1. subscribe(callback) -> Recibe (event, data)
   * 2. subscribe(eventName, callback) -> Se ejecuta sólo para eventName y recibe data
   */
  subscribe(eventOrCallback, callback) {
    if (typeof eventOrCallback === 'function') {
      this.subscribers.push(eventOrCallback);
    } else if (typeof eventOrCallback === 'string' && typeof callback === 'function') {
      this.subscribers.push((event, data) => {
        if (event === eventOrCallback) {
          callback(data);
        }
      });
    }
  }

  /**
   * Notifica a todos los suscriptores de un evento y sus datos.
   * @param {string} event 
   * @param {Object} data 
   */
  notify(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (err) {
        console.error('Error en callback de CategoryChangeObserver:', err);
      }
    });
  }
}

export const categoryObserver = new CategoryChangeObserver();
