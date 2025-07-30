/**
 * Базовый класс для всех компонентов
 */
class BaseClass {
  constructor() {
    this.events = new Map();
  }

  /**
   * Настройка компонента
   */
  setup() {
    // Базовая настройка компонента
    console.log(`Setting up ${this.constructor.name}`);
  }

  /**
   * Обработка событий
   * @param {string} eventName - название события
   * @param {Function} callback - функция обратного вызова
   */
  onEvents(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(callback);
  }

  /**
   * Вызов события
   * @param {string} eventName - название события
   * @param {*} data - данные события
   */
  emit(eventName, data) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(callback => callback(data));
    }
  }

  /**
   * Удаление обработчика события
   * @param {string} eventName - название события
   * @param {Function} callback - функция обратного вызова
   */
  off(eventName, callback) {
    if (this.events.has(eventName)) {
      const callbacks = this.events.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

export default BaseClass;