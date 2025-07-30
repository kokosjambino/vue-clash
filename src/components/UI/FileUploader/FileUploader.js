import BaseClass from '../../BaseClass.js';

/**
 * Класс для загрузки одного файла
 */
class FileUploader extends BaseClass {
  constructor(options = {}) {
    super();
    
    this.file = null;
    this.acceptedTypes = options.acceptedTypes || '*/*';
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB по умолчанию
    this.previewSize = options.previewSize || { width: 100, height: 100 };
    
    // Элементы DOM
    this.container = null;
    this.input = null;
    this.preview = null;
    this.fileName = null;
    this.deleteBtn = null;
  }

  /**
   * Настройка компонента
   */
  setup() {
    super.setup();
    this.bindEvents();
  }

  /**
   * Привязка событий
   */
  bindEvents() {
    this.onEvents('fileSelect', this.handleFileSelect.bind(this));
    this.onEvents('fileDelete', this.handleFileDelete.bind(this));
    this.onEvents('fileEdit', this.handleFileEdit.bind(this));
  }

  /**
   * Создание DOM элементов
   * @param {HTMLElement} container - контейнер для размещения
   */
  render(container) {
    this.container = container;
    
    const html = `
      <div class="file-uploader">
        <input type="file" class="file-input" accept="${this.acceptedTypes}" style="display: none;">
        <div class="file-preview" style="display: none;">
          <div class="preview-content"></div>
          <button type="button" class="delete-btn">×</button>
        </div>
        <div class="file-dropzone">
          <span class="dropzone-text">Нажмите для выбора файла или перетащите сюда</span>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Получение ссылок на элементы
    this.input = container.querySelector('.file-input');
    this.preview = container.querySelector('.file-preview');
    this.previewContent = container.querySelector('.preview-content');
    this.deleteBtn = container.querySelector('.delete-btn');
    this.dropzone = container.querySelector('.file-dropzone');
    
    // Привязка DOM событий
    this.bindDOMEvents();
  }

  /**
   * Привязка DOM событий
   */
  bindDOMEvents() {
    // Клик по dropzone
    this.dropzone.addEventListener('click', () => {
      this.input.click();
    });

    // Изменение файла
    this.input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.emit('fileSelect', file);
      }
    });

    // Удаление файла
    this.deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.emit('fileDelete');
    });

    // Клик по превью для редактирования
    this.preview.addEventListener('click', () => {
      this.emit('fileEdit');
    });

    // Drag & Drop
    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('dragover');
    });

    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('dragover');
    });

    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.emit('fileSelect', files[0]);
      }
    });
  }

  /**
   * Обработка выбора файла
   * @param {File} file - выбранный файл
   */
  handleFileSelect(file) {
    if (!this.validateFile(file)) {
      return;
    }

    this.file = file;
    this.showPreview(file);
    this.emit('change', { file, action: 'add' });
  }

  /**
   * Обработка удаления файла
   */
  handleFileDelete() {
    const oldFile = this.file;
    this.file = null;
    this.hidePreview();
    this.input.value = '';
    this.emit('change', { file: oldFile, action: 'delete' });
  }

  /**
   * Обработка редактирования файла
   */
  handleFileEdit() {
    this.input.click();
  }

  /**
   * Валидация файла
   * @param {File} file - файл для валидации
   * @returns {boolean} результат валидации
   */
  validateFile(file) {
    // Проверка размера
    if (file.size > this.maxSize) {
      this.emit('error', {
        type: 'size',
        message: `Файл слишком большой. Максимальный размер: ${this.formatFileSize(this.maxSize)}`
      });
      return false;
    }

    // Проверка типа (если указаны конкретные типы)
    if (this.acceptedTypes !== '*/*') {
      const acceptedTypesArray = this.acceptedTypes.split(',').map(type => type.trim());
      const isValidType = acceptedTypesArray.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        this.emit('error', {
          type: 'type',
          message: `Неподдерживаемый тип файла. Допустимые типы: ${this.acceptedTypes}`
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Показ превью файла
   * @param {File} file - файл для превью
   */
  showPreview(file) {
    this.dropzone.style.display = 'none';
    this.preview.style.display = 'flex';

    if (file.type.startsWith('image/')) {
      this.showImagePreview(file);
    } else {
      this.showFilePreview(file);
    }
  }

  /**
   * Показ превью изображения
   * @param {File} file - файл изображения
   */
  showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewContent.innerHTML = `
        <img src="${e.target.result}" 
             alt="${file.name}" 
             style="max-width: ${this.previewSize.width}px; max-height: ${this.previewSize.height}px; object-fit: cover;">
      `;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Показ превью документа
   * @param {File} file - файл документа
   */
  showFilePreview(file) {
    const fileExtension = this.getFileExtension(file.name);
    this.previewContent.innerHTML = `
      <div class="file-info">
        <div class="file-icon">${fileExtension.toUpperCase()}</div>
        <div class="file-details">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${this.formatFileSize(file.size)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Скрытие превью
   */
  hidePreview() {
    this.preview.style.display = 'none';
    this.dropzone.style.display = 'flex';
    this.previewContent.innerHTML = '';
  }

  /**
   * Получение расширения файла
   * @param {string} fileName - имя файла
   * @returns {string} расширение файла
   */
  getFileExtension(fileName) {
    return fileName.split('.').pop() || '';
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
   * Получение текущего файла
   * @returns {File|null} текущий файл
   */
  getFile() {
    return this.file;
  }

  /**
   * Установка файла программно
   * @param {File} file - файл для установки
   */
  setFile(file) {
    if (file && this.validateFile(file)) {
      this.handleFileSelect(file);
    }
  }

  /**
   * Очистка файла
   */
  clear() {
    this.handleFileDelete();
  }
}

export default FileUploader;