<template>
  <div class="multi-file-uploader-wrapper">
    <div ref="uploaderContainer" class="uploader-container"></div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import MultiFileUploader from './MultiFileUploader.js';

export default {
  name: 'MultiFileUploader',
  props: {
    acceptedTypes: {
      type: String,
      default: '*/*'
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    maxFiles: {
      type: Number,
      default: 10
    },
    previewSize: {
      type: Object,
      default: () => ({ width: 80, height: 80 })
    },
    allowDuplicates: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'filesChange', 'fileAdd', 'fileRemove', 'error'],
  data() {
    return {
      uploader: null,
      errorMessage: ''
    };
  },
  mounted() {
    this.initUploader();
  },
  beforeUnmount() {
    if (this.uploader) {
      // Очистка событий при уничтожении компонента
      this.uploader.events.clear();
    }
  },
  watch: {
    modelValue: {
      handler(newFiles) {
        if (this.uploader && Array.isArray(newFiles)) {
          const currentFiles = this.uploader.getFileObjects();
          
          // Проверяем, изменились ли файлы
          if (!this.arraysEqual(newFiles, currentFiles)) {
            this.uploader.setFiles(newFiles);
          }
        }
      },
      deep: true
    }
  },
  methods: {
    initUploader() {
      this.uploader = new MultiFileUploader({
        acceptedTypes: this.acceptedTypes,
        maxSize: this.maxSize,
        maxFiles: this.maxFiles,
        previewSize: this.previewSize,
        allowDuplicates: this.allowDuplicates
      });

      // Настройка событий
      this.uploader.onEvents('filesChange', this.handleFilesChange);
      this.uploader.onEvents('fileAdd', this.handleFileAdd);
      this.uploader.onEvents('fileRemove', this.handleFileRemove);
      this.uploader.onEvents('error', this.handleError);

      // Рендер компонента
      this.uploader.render(this.$refs.uploaderContainer);
      this.uploader.setup();

      // Установка начальных файлов
      if (this.modelValue && this.modelValue.length > 0) {
        this.uploader.setFiles(this.modelValue);
      }
    },
    handleFilesChange(files) {
      this.errorMessage = '';
      const fileObjects = files.map(item => item.file);
      this.$emit('update:modelValue', fileObjects);
      this.$emit('filesChange', files);
    },
    handleFileAdd(data) {
      this.$emit('fileAdd', data);
    },
    handleFileRemove(data) {
      this.$emit('fileRemove', data);
    },
    handleError(error) {
      this.errorMessage = error.message;
      this.$emit('error', error);
    },
    // Вспомогательные методы
    arraysEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      
      return arr1.every((file1, index) => {
        const file2 = arr2[index];
        return file1.name === file2.name && 
               file1.size === file2.size && 
               file1.type === file2.type;
      });
    },
    // Публичные методы
    getFiles() {
      return this.uploader ? this.uploader.getFiles() : [];
    },
    getFileObjects() {
      return this.uploader ? this.uploader.getFileObjects() : [];
    },
    addFile(file) {
      if (this.uploader) {
        this.uploader.addFile(file);
      }
    },
    setFiles(files) {
      if (this.uploader) {
        this.uploader.setFiles(files);
      }
    },
    clear() {
      if (this.uploader) {
        this.uploader.clear();
      }
    },
    getFileCount() {
      return this.uploader ? this.uploader.getFileCount() : 0;
    },
    isMaxFilesReached() {
      return this.uploader ? this.uploader.isMaxFilesReached() : false;
    }
  }
};
</script>

<style scoped>
.multi-file-uploader-wrapper {
  width: 100%;
}

.uploader-container {
  width: 100%;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px;
  background-color: #fdf2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
}

/* Стили для множественного загрузчика */
:deep(.multi-file-uploader) {
  width: 100%;
}

:deep(.uploader-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

:deep(.add-file-btn) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

:deep(.add-file-btn:hover:not(.disabled)) {
  background-color: #2563eb;
  transform: translateY(-1px);
}

:deep(.add-file-btn.disabled) {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

:deep(.add-icon) {
  font-size: 16px;
  font-weight: bold;
}

:deep(.file-counter) {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

:deep(.current-count) {
  color: #1f2937;
  font-weight: 600;
}

:deep(.files-list) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.file-uploader-item) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

:deep(.file-uploader-item:hover) {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.uploader-wrapper) {
  flex: 1;
}

:deep(.remove-uploader-btn) {
  width: 32px;
  height: 32px;
  border: none;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

:deep(.remove-uploader-btn:hover) {
  background-color: #dc2626;
  transform: scale(1.1);
}

/* Переопределение стилей для вложенных загрузчиков */
:deep(.file-uploader-item .file-dropzone) {
  padding: 16px;
  margin: 0;
}

:deep(.file-uploader-item .file-preview) {
  margin: 0;
}

:deep(.file-uploader-item .dropzone-text) {
  font-size: 13px;
}

/* Адаптивность */
@media (max-width: 768px) {
  :deep(.uploader-header) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  :deep(.add-file-btn) {
    justify-content: center;
  }
  
  :deep(.file-counter) {
    text-align: center;
  }
  
  :deep(.file-uploader-item) {
    flex-direction: column;
    align-items: stretch;
  }
  
  :deep(.remove-uploader-btn) {
    align-self: flex-end;
  }
}
</style>