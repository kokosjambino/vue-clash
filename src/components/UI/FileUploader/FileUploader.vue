<template>
  <div class="file-uploader-wrapper">
    <div ref="uploaderContainer" class="uploader-container"></div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import FileUploader from './FileUploader.js';

export default {
  name: 'FileUploader',
  props: {
    acceptedTypes: {
      type: String,
      default: '*/*'
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    previewSize: {
      type: Object,
      default: () => ({ width: 100, height: 100 })
    },
    modelValue: {
      type: File,
      default: null
    }
  },
  emits: ['update:modelValue', 'change', 'error'],
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
    modelValue(newFile) {
      if (this.uploader && newFile !== this.uploader.getFile()) {
        if (newFile) {
          this.uploader.setFile(newFile);
        } else {
          this.uploader.clear();
        }
      }
    }
  },
  methods: {
    initUploader() {
      this.uploader = new FileUploader({
        acceptedTypes: this.acceptedTypes,
        maxSize: this.maxSize,
        previewSize: this.previewSize
      });

      // Настройка событий
      this.uploader.onEvents('change', this.handleFileChange);
      this.uploader.onEvents('error', this.handleError);

      // Рендер компонента
      this.uploader.render(this.$refs.uploaderContainer);
      this.uploader.setup();

      // Установка начального значения
      if (this.modelValue) {
        this.uploader.setFile(this.modelValue);
      }
    },
    handleFileChange(data) {
      this.errorMessage = '';
      this.$emit('update:modelValue', data.file);
      this.$emit('change', data);
    },
    handleError(error) {
      this.errorMessage = error.message;
      this.$emit('error', error);
    },
    // Публичные методы
    getFile() {
      return this.uploader ? this.uploader.getFile() : null;
    },
    setFile(file) {
      if (this.uploader) {
        this.uploader.setFile(file);
      }
    },
    clear() {
      if (this.uploader) {
        this.uploader.clear();
      }
    }
  }
};
</script>

<style scoped>
.file-uploader-wrapper {
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

/* Стили для загрузчика */
:deep(.file-uploader) {
  width: 100%;
  position: relative;
}

:deep(.file-dropzone) {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

:deep(.file-dropzone:hover) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

:deep(.file-dropzone.dragover) {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

:deep(.dropzone-text) {
  color: #6b7280;
  font-size: 14px;
}

:deep(.file-preview) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.file-preview:hover) {
  border-color: #3b82f6;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

:deep(.preview-content) {
  flex: 1;
  display: flex;
  align-items: center;
}

:deep(.preview-content img) {
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

:deep(.file-info) {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.file-icon) {
  width: 40px;
  height: 40px;
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

:deep(.file-details) {
  display: flex;
  flex-direction: column;
}

:deep(.file-name) {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 2px;
}

:deep(.file-size) {
  color: #6b7280;
  font-size: 12px;
}

:deep(.delete-btn) {
  width: 24px;
  height: 24px;
  border: none;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

:deep(.delete-btn:hover) {
  background-color: #dc2626;
  transform: scale(1.1);
}
</style>