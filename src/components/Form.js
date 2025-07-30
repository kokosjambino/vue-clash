import BaseClass from './BaseClass.js';

/**
 * Класс для работы с формами
 */
class Form extends BaseClass {
  constructor() {
    super();
    this.formData = new FormData();
    this.fields = new Map();
    this.validators = new Map();
  }

  /**
   * Настройка формы
   */
  setup() {
    super.setup();
    this.bindEvents();
  }

  /**
   * Привязка событий формы
   */
  bindEvents() {
    // Основные события формы
    this.onEvents('submit', this.handleSubmit.bind(this));
    this.onEvents('reset', this.handleReset.bind(this));
    this.onEvents('fieldChange', this.handleFieldChange.bind(this));
  }

  /**
   * Добавление поля в форму
   * @param {string} name - имя поля
   * @param {*} value - значение поля
   */
  addField(name, value) {
    this.fields.set(name, value);
    this.formData.set(name, value);
  }

  /**
   * Получение значения поля
   * @param {string} name - имя поля
   * @returns {*} значение поля
   */
  getField(name) {
    return this.fields.get(name);
  }

  /**
   * Установка значения поля
   * @param {string} name - имя поля
   * @param {*} value - новое значение
   */
  setField(name, value) {
    this.fields.set(name, value);
    this.formData.set(name, value);
    this.emit('fieldChange', { name, value });
  }

  /**
   * Добавление валидатора для поля
   * @param {string} fieldName - имя поля
   * @param {Function} validator - функция валидации
   */
  addValidator(fieldName, validator) {
    if (!this.validators.has(fieldName)) {
      this.validators.set(fieldName, []);
    }
    this.validators.get(fieldName).push(validator);
  }

  /**
   * Валидация поля
   * @param {string} fieldName - имя поля
   * @returns {boolean} результат валидации
   */
  validateField(fieldName) {
    const value = this.getField(fieldName);
    const fieldValidators = this.validators.get(fieldName) || [];
    
    return fieldValidators.every(validator => validator(value));
  }

  /**
   * Валидация всей формы
   * @returns {boolean} результат валидации
   */
  validate() {
    let isValid = true;
    for (const fieldName of this.fields.keys()) {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    }
    return isValid;
  }

  /**
   * Обработка отправки формы
   * @param {Event} event - событие отправки
   */
  handleSubmit(event) {
    if (event) event.preventDefault();
    
    if (this.validate()) {
      this.emit('validSubmit', this.getFormData());
    } else {
      this.emit('invalidSubmit', this.getFormData());
    }
  }

  /**
   * Обработка сброса формы
   */
  handleReset() {
    this.fields.clear();
    this.formData = new FormData();
    this.emit('reset');
  }

  /**
   * Обработка изменения поля
   * @param {Object} data - данные изменения
   */
  handleFieldChange(data) {
    console.log(`Field ${data.name} changed to:`, data.value);
  }

  /**
   * Получение данных формы
   * @returns {Object} данные формы
   */
  getFormData() {
    const data = {};
    for (const [key, value] of this.fields) {
      data[key] = value;
    }
    return data;
  }

  /**
   * Получение FormData объекта
   * @returns {FormData} объект FormData
   */
  getFormDataObject() {
    return this.formData;
  }
}

export default Form;