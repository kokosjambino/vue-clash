import BaseClass from '../../BaseClass.js';
import FileUploader from './FileUploader.js';

/**
 * Класс для загрузки множественных файлов
 */
class MultiFileUploader extends BaseClass {
  constructor(options = {}) {
    super();
    
    this.files = new Map(); // Map<id, {uploader: FileUploader, file: File}>
    this.maxFiles = options.maxFiles || 10;
    this.acceptedTypes = options.acceptedTypes || '*/*';
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB по умолчанию
    this.previewSize = options.previewSize || { width: 80, height: 80 };
    this.allowDuplicates = options.allowDuplicates || false;
    
    // Элементы DOM
    this.container = null;
    this.addButton = null;
    this.filesList = null;
    this.fileCounter = null;
    
    // Счетчик для уникальных ID
    this.nextId = 1;
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
    this.onEvents('fileAdd', this.handleFileAdd.bind(this));
    this.onEvents('fileRemove', this.handleFileRemove.bind(this));
    this.onEvents('filesChange', this.handleFilesChange.bind(this));
  }

  /**
   * Создание DOM элементов
   * @param {HTMLElement} container - контейнер для размещения
   */
  render(container) {
    this.container = container;
    
    const html = `
      <div class="multi-file-uploader">
        <div class="uploader-header">
          <button type="button" class="add-file-btn">
            <span class="add-icon">+</span>
            <span class="add-text">Добавить файл</span>
          </button>
          <div class="file-counter">
            <span class="current-count">0</span>/<span class="max-count">${this.maxFiles}</span>
          </div>
        </div>
        <div class="files-list"></div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Получение ссылок на элементы
    this.addButton = container.querySelector('.add-file-btn');
    this.filesList = container.querySelector('.files-list');
    this.fileCounter = container.querySelector('.current-count');
    
    // Привязка DOM событий
    this.bindDOMEvents();
    this.updateCounter();
  }

  /**
   * Привязка DOM событий
   */
  bindDOMEvents() {
    this.addButton.addEventListener('click', () => {
      if (this.files.size < this.maxFiles) {
        this.addFileUploader();
      } else {
        this.emit('error', {
          type: 'maxFiles',
          message: `Максимальное количество файлов: ${this.maxFiles}`
        });
      }
    });
  }

  /**
   * Добавление нового загрузчика файла
   */
  addFileUploader() {
    const id = this.generateId();
    const uploaderContainer = document.createElement('div');
    uploaderContainer.className = 'file-uploader-item';
    uploaderContainer.dataset.id = id;
    
    // Создание обертки для загрузчика
    const uploaderWrapper = document.createElement('div');
    uploaderWrapper.className = 'uploader-wrapper';
    
    // Кнопка удаления
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-uploader-btn';
    removeBtn.innerHTML = '×';
    removeBtn.title = 'Удалить загрузчик';
    
    uploaderContainer.appendChild(uploaderWrapper);
    uploaderContainer.appendChild(removeBtn);
    this.filesList.appendChild(uploaderContainer);
    
    // Создание экземпляра FileUploader
    const uploader = new FileUploader({
      acceptedTypes: this.acceptedTypes,
      maxSize: this.maxSize,
      previewSize: this.previewSize
    });
    
    // Настройка событий загрузчика
    uploader.onEvents('change', (data) => {
      if (data.action === 'add') {
        if (!this.allowDuplicates && this.isDuplicateFile(data.file)) {
          uploader.clear();
          this.emit('error', {
            type: 'duplicate',
            message: 'Файл с таким именем уже добавлен'
          });
          return;
        }
        
        this.files.set(id, { uploader, file: data.file });
        this.emit('fileAdd', { id, file: data.file });
      } else if (data.action === 'delete') {
        this.files.delete(id);
        this.emit('fileRemove', { id, file: data.file });
      }
      
      this.updateCounter();
      this.emit('filesChange', this.getFiles());
    });
    
    uploader.onEvents('error', (error) => {
      this.emit('error', error);
    });
    
    // Рендер и настройка загрузчика
    uploader.render(uploaderWrapper);
    uploader.setup();
    
    // Обработка удаления загрузчика
    removeBtn.addEventListener('click', () => {
      this.removeFileUploader(id);
    });
    
    this.updateCounter();
  }

  /**
   * Удаление загрузчика файла
   * @param {string} id - ID загрузчика
   */
  removeFileUploader(id) {
    const uploaderElement = this.filesList.querySelector(`[data-id="${id}"]`);
    if (uploaderElement) {
      const fileData = this.files.get(id);
      if (fileData) {
        this.emit('fileRemove', { id, file: fileData.file });
        this.files.delete(id);
      }
      
      uploaderElement.remove();
      this.updateCounter();
      this.emit('filesChange', this.getFiles());
    }
  }

  /**
   * Проверка на дублирование файла
   * @param {File} file - файл для проверки
   * @returns {boolean} true если файл дублируется
   */
  isDuplicateFile(file) {
    for (const [id, data] of this.files) {
      if (data.file && data.file.name === file.name && data.file.size === file.size) {
        return true;
      }
    }
    return false;
  }

  /**
   * Генерация уникального ID
   * @returns {string} уникальный ID
   */
  generateId() {
    return `uploader_${this.nextId++}_${Date.now()}`;
  }

  /**
   * Обновление счетчика файлов
   */
  updateCounter() {
    if (this.fileCounter) {
      this.fileCounter.textContent = this.files.size;
    }
    
    // Обновление состояния кнопки добавления
    if (this.addButton) {
      if (this.files.size >= this.maxFiles) {
        this.addButton.disabled = true;
        this.addButton.classList.add('disabled');
      } else {
        this.addButton.disabled = false;
        this.addButton.classList.remove('disabled');
      }
    }
  }

  /**
   * Обработка добавления файла
   * @param {Object} data - данные о добавленном файле
   */
  handleFileAdd(data) {
    console.log('File added:', data);
  }

  /**
   * Обработка удаления файла
   * @param {Object} data - данные об удаленном файле
   */
  handleFileRemove(data) {
    console.log('File removed:', data);
  }

  /**
   * Обработка изменения списка файлов
   * @param {Array} files - текущий список файлов
   */
  handleFilesChange(files) {
    console.log('Files changed:', files);
  }

  /**
   * Получение всех файлов
   * @returns {Array} массив файлов
   */
  getFiles() {
    const files = [];
    for (const [id, data] of this.files) {
      if (data.file) {
        files.push({
          id,
          file: data.file,
          name: data.file.name,
          size: data.file.size,
          type: data.file.type
        });
      }
    }
    return files;
  }

  /**
   * Получение файлов как массив File объектов
   * @returns {Array<File>} массив File объектов
   */
  getFileObjects() {
    const files = [];
    for (const [id, data] of this.files) {
      if (data.file) {
        files.push(data.file);
      }
    }
    return files;
  }

  /**
   * Установка файлов программно
   * @param {Array<File>} files - массив файлов
   */
  setFiles(files) {
    // Очистка текущих файлов
    this.clear();
    
    // Добавление новых файлов
    files.forEach(file => {
      if (this.files.size < this.maxFiles) {
        this.addFileUploader();
        // Находим последний добавленный загрузчик и устанавливаем файл
        const lastId = Array.from(this.files.keys()).pop() || this.generateId();
        setTimeout(() => {
          const uploaderData = this.files.get(lastId);
          if (uploaderData && uploaderData.uploader) {
            uploaderData.uploader.setFile(file);
          }
        }, 0);
      }
    });
  }

  /**
   * Добавление файла в первый доступный загрузчик
   * @param {File} file - файл для добавления
   */
  addFile(file) {
    if (this.files.size >= this.maxFiles) {
      this.emit('error', {
        type: 'maxFiles',
        message: `Максимальное количество файлов: ${this.maxFiles}`
      });
      return;
    }
    
    this.addFileUploader();
    
    // Устанавливаем файл в последний добавленный загрузчик
    setTimeout(() => {
      const uploaders = Array.from(this.files.values());
      const lastUploader = uploaders[uploaders.length - 1];
      if (lastUploader && lastUploader.uploader) {
        lastUploader.uploader.setFile(file);
      }
    }, 0);
  }

  /**
   * Очистка всех файлов
   */
  clear() {
    // Удаляем все загрузчики
    const ids = Array.from(this.files.keys());
    ids.forEach(id => {
      this.removeFileUploader(id);
    });
  }

  /**
   * Получение количества файлов
   * @returns {number} количество файлов
   */
  getFileCount() {
    return this.files.size;
  }

  /**
   * Проверка на максимальное количество файлов
   * @returns {boolean} true если достигнут лимит
   */
  isMaxFilesReached() {
    return this.files.size >= this.maxFiles;
  }
}

export default MultiFileUploader;