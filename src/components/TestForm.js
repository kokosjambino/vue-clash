import Form from './Form.js';
import FileUploader from './UI/FileUploader/FileUploader.js';
import MultiFileUploader from './UI/FileUploader/MultiFileUploader.js';

/**
 * Тестовая форма с загрузчиками файлов
 */
class TestForm extends Form {
  constructor() {
    super();
    
    // Загрузчики файлов
    this.avatarUploader = null;
    this.documentsUploader = null;
    
    // Контейнеры для загрузчиков
    this.avatarContainer = null;
    this.documentsContainer = null;
  }

  /**
   * Инициализация формы
   */
  init() {
    this.setup();
    this.createUploaders();
    this.bindFormEvents();
    
    console.log('TestForm initialized');
  }

  /**
   * Создание загрузчиков файлов
   */
  createUploaders() {
    // Одиночный загрузчик для аватара
    this.avatarUploader = new FileUploader({
      acceptedTypes: 'image/*',
      maxSize: 5 * 1024 * 1024, // 5MB
      previewSize: { width: 120, height: 120 }
    });

    // Множественный загрузчик для документов
    this.documentsUploader = new MultiFileUploader({
      acceptedTypes: '.pdf,.doc,.docx,.txt',
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      previewSize: { width: 60, height: 60 },
      allowDuplicates: false
    });

    // Настройка событий загрузчиков
    this.setupUploaderEvents();
  }

  /**
   * Настройка событий загрузчиков
   */
  setupUploaderEvents() {
    // События загрузчика аватара
    this.avatarUploader.onEvents('change', (data) => {
      this.setField('avatar', data.file);
      console.log('Avatar changed:', data);
    });

    this.avatarUploader.onEvents('error', (error) => {
      console.error('Avatar upload error:', error);
      this.emit('fieldError', { field: 'avatar', error });
    });

    // События загрузчика документов
    this.documentsUploader.onEvents('filesChange', (files) => {
      const fileObjects = files.map(item => item.file);
      this.setField('documents', fileObjects);
      console.log('Documents changed:', files);
    });

    this.documentsUploader.onEvents('error', (error) => {
      console.error('Documents upload error:', error);
      this.emit('fieldError', { field: 'documents', error });
    });
  }

  /**
   * Рендер формы в контейнер
   * @param {HTMLElement} container - контейнер для формы
   */
  render(container) {
    const html = `
      <div class="test-form">
        <h2>Тестовая форма с загрузкой файлов</h2>
        
        <div class="form-field">
          <label for="username">Имя пользователя:</label>
          <input type="text" id="username" name="username" placeholder="Введите имя пользователя">
        </div>
        
        <div class="form-field">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" placeholder="Введите email">
        </div>
        
        <div class="form-field">
          <label>Аватар:</label>
          <div class="avatar-uploader-container"></div>
        </div>
        
        <div class="form-field">
          <label>Документы:</label>
          <div class="documents-uploader-container"></div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="submit-btn">Отправить</button>
          <button type="button" class="reset-btn">Сбросить</button>
          <button type="button" class="preview-btn">Предпросмотр данных</button>
        </div>
        
        <div class="form-output" style="display: none;">
          <h3>Данные формы:</h3>
          <pre class="output-content"></pre>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Получение ссылок на элементы
    this.avatarContainer = container.querySelector('.avatar-uploader-container');
    this.documentsContainer = container.querySelector('.documents-uploader-container');
    this.outputDiv = container.querySelector('.form-output');
    this.outputContent = container.querySelector('.output-content');
    
    // Рендер загрузчиков
    this.avatarUploader.render(this.avatarContainer);
    this.documentsUploader.render(this.documentsContainer);
    
    // Настройка загрузчиков
    this.avatarUploader.setup();
    this.documentsUploader.setup();
    
    // Привязка событий формы
    this.bindDOMEvents(container);
  }

  /**
   * Привязка событий DOM
   * @param {HTMLElement} container - контейнер формы
   */
  bindDOMEvents(container) {
    // Поля ввода
    const usernameInput = container.querySelector('#username');
    const emailInput = container.querySelector('#email');
    
    usernameInput.addEventListener('input', (e) => {
      this.setField('username', e.target.value);
    });
    
    emailInput.addEventListener('input', (e) => {
      this.setField('email', e.target.value);
    });
    
    // Кнопки
    const submitBtn = container.querySelector('.submit-btn');
    const resetBtn = container.querySelector('.reset-btn');
    const previewBtn = container.querySelector('.preview-btn');
    
    submitBtn.addEventListener('click', () => {
      this.emit('submit');
    });
    
    resetBtn.addEventListener('click', () => {
      this.emit('reset');
    });
    
    previewBtn.addEventListener('click', () => {
      this.showPreview();
    });
  }

  /**
   * Привязка событий формы
   */
  bindFormEvents() {
    // Обработка отправки формы
    this.onEvents('validSubmit', (data) => {
      console.log('Form submitted successfully:', data);
      alert('Форма успешно отправлена! Проверьте консоль для просмотра данных.');
    });

    this.onEvents('invalidSubmit', (data) => {
      console.error('Form validation failed:', data);
      alert('Ошибка валидации формы! Проверьте заполненные поля.');
    });

    // Обработка сброса формы
    this.onEvents('reset', () => {
      this.resetForm();
    });

    // Обработка ошибок полей
    this.onEvents('fieldError', (data) => {
      console.error(`Field error in ${data.field}:`, data.error);
    });
  }

  /**
   * Сброс формы
   */
  resetForm() {
    // Очистка полей
    this.handleReset();
    
    // Очистка загрузчиков
    this.avatarUploader.clear();
    this.documentsUploader.clear();
    
    // Очистка полей ввода
    const inputs = document.querySelectorAll('#username, #email');
    inputs.forEach(input => input.value = '');
    
    // Скрытие предпросмотра
    this.outputDiv.style.display = 'none';
    
    console.log('Form reset');
  }

  /**
   * Показ предпросмотра данных
   */
  showPreview() {
    const formData = this.getFormData();
    
    // Подготовка данных для отображения
    const displayData = {
      username: formData.username || 'Не указано',
      email: formData.email || 'Не указано',
      avatar: formData.avatar ? {
        name: formData.avatar.name,
        size: this.formatFileSize(formData.avatar.size),
        type: formData.avatar.type
      } : 'Не загружен',
      documents: formData.documents ? formData.documents.map(file => ({
        name: file.name,
        size: this.formatFileSize(file.size),
        type: file.type
      })) : []
    };
    
    this.outputContent.textContent = JSON.stringify(displayData, null, 2);
    this.outputDiv.style.display = 'block';
  }

  /**
   * Форматирование размера файла
   * @param {number} bytes - размер в байтах
   * @returns {string} отформатированный размер
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Настройка валидаторов
   */
  setupValidators() {
    // Валидатор для имени пользователя
    this.addValidator('username', (value) => {
      if (!value || value.trim().length < 2) {
        return false;
      }
      return true;
    });

    // Валидатор для email
    this.addValidator('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    // Валидатор для аватара (опциональный)
    this.addValidator('avatar', (value) => {
      // Аватар не обязателен
      return true;
    });

    // Валидатор для документов (опциональный)
    this.addValidator('documents', (value) => {
      // Документы не обязательны
      return true;
    });
  }

  /**
   * Настройка формы с валидаторами
   */
  setup() {
    super.setup();
    this.setupValidators();
  }
}

export default TestForm;