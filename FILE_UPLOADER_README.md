# 🗂️ Компоненты загрузки файлов

Система компонентов для загрузки и управления файлами, построенная на основе классов с поддержкой событий.

## 📁 Структура проекта

```
src/
├── components/
│   ├── BaseClass.js              # Базовый класс для всех компонентов
│   ├── Form.js                   # Класс для работы с формами
│   ├── TestForm.js               # Тестовая форма с загрузчиками
│   └── UI/
│       └── FileUploader/
│           ├── FileUploader.js       # Класс одиночного загрузчика
│           ├── FileUploader.vue      # Vue компонент одиночного загрузчика
│           ├── MultiFileUploader.js  # Класс множественного загрузчика
│           └── MultiFileUploader.vue # Vue компонент множественного загрузчика
└── pages/
    └── TestFormPage.html         # Демо страница
```

## 🏗️ Архитектура

### BaseClass
Базовый класс для всех компонентов с системой событий:
- ✅ Методы `onEvents()` и `setup()`
- ✅ Система событий с поддержкой подписки/отписки
- ✅ Метод `emit()` для вызова событий

### Form (наследует от BaseClass)
Класс для работы с формами:
- ✅ Управление полями формы
- ✅ Система валидации
- ✅ Обработка отправки/сброса формы
- ✅ Работа с FormData

## 📋 Компоненты

### 1. FileUploader - Одиночный загрузчик файлов

#### Возможности:
- ✅ Загрузка одного файла
- ✅ Drag & Drop поддержка
- ✅ Превью изображений
- ✅ Отображение информации о документах
- ✅ Редактирование файла (замена)
- ✅ Удаление файла
- ✅ Валидация размера и типа файла

#### Использование JavaScript класса:

```javascript
import FileUploader from './components/UI/FileUploader/FileUploader.js';

const uploader = new FileUploader({
    acceptedTypes: 'image/*',        // Принимаемые типы файлов
    maxSize: 5 * 1024 * 1024,       // Максимальный размер (5MB)
    previewSize: { width: 100, height: 100 }  // Размер превью
});

// События
uploader.onEvents('change', (data) => {
    console.log('File changed:', data.file, data.action);
});

uploader.onEvents('error', (error) => {
    console.error('Error:', error.message);
});

// Рендер и настройка
uploader.render(document.getElementById('container'));
uploader.setup();
```

#### Использование Vue компонента:

```vue
<template>
  <FileUploader 
    v-model="selectedFile"
    accepted-types="image/*"
    :max-size="5 * 1024 * 1024"
    :preview-size="{ width: 120, height: 120 }"
    @change="handleFileChange"
    @error="handleError"
  />
</template>

<script>
import FileUploader from './components/UI/FileUploader/FileUploader.vue';

export default {
  components: { FileUploader },
  data() {
    return {
      selectedFile: null
    };
  },
  methods: {
    handleFileChange(data) {
      console.log('File changed:', data);
    },
    handleError(error) {
      console.error('Error:', error);
    }
  }
};
</script>
```

### 2. MultiFileUploader - Множественный загрузчик файлов

#### Возможности:
- ✅ Загрузка множественных файлов
- ✅ Динамическое добавление/удаление загрузчиков
- ✅ Ограничение количества файлов
- ✅ Предотвращение дублирования файлов
- ✅ Счетчик файлов
- ✅ Все возможности одиночного загрузчика для каждого файла

#### Использование JavaScript класса:

```javascript
import MultiFileUploader from './components/UI/FileUploader/MultiFileUploader.js';

const multiUploader = new MultiFileUploader({
    acceptedTypes: '.pdf,.doc,.docx',
    maxSize: 10 * 1024 * 1024,      // 10MB
    maxFiles: 5,                     // Максимум 5 файлов
    allowDuplicates: false           // Запретить дубликаты
});

// События
multiUploader.onEvents('filesChange', (files) => {
    console.log('Files changed:', files);
});

multiUploader.onEvents('fileAdd', (data) => {
    console.log('File added:', data);
});

multiUploader.onEvents('fileRemove', (data) => {
    console.log('File removed:', data);
});

// Рендер и настройка
multiUploader.render(document.getElementById('container'));
multiUploader.setup();
```

#### Использование Vue компонента:

```vue
<template>
  <MultiFileUploader 
    v-model="selectedFiles"
    accepted-types=".pdf,.doc,.docx"
    :max-size="10 * 1024 * 1024"
    :max-files="5"
    :allow-duplicates="false"
    @filesChange="handleFilesChange"
    @error="handleError"
  />
</template>

<script>
import MultiFileUploader from './components/UI/FileUploader/MultiFileUploader.vue';

export default {
  components: { MultiFileUploader },
  data() {
    return {
      selectedFiles: []
    };
  },
  methods: {
    handleFilesChange(files) {
      console.log('Files changed:', files);
    },
    handleError(error) {
      console.error('Error:', error);
    }
  }
};
</script>
```

## 🎯 Интеграция с формами

### Использование в классе Form:

```javascript
import Form from './components/Form.js';
import FileUploader from './components/UI/FileUploader/FileUploader.js';

class MyForm extends Form {
    constructor() {
        super();
        this.avatarUploader = new FileUploader({
            acceptedTypes: 'image/*',
            maxSize: 5 * 1024 * 1024
        });
    }

    setup() {
        super.setup();
        
        // Интеграция с формой
        this.avatarUploader.onEvents('change', (data) => {
            this.setField('avatar', data.file);
        });
        
        this.avatarUploader.render(document.getElementById('avatar-container'));
        this.avatarUploader.setup();
    }
}
```

### Использование в Astro шаблоне:

```astro
---
// pages/upload-form.astro
---

<html>
<head>
    <title>File Upload Form</title>
</head>
<body>
    <div id="file-uploader"></div>
    
    <script type="module">
        import FileUploader from '../components/UI/FileUploader/FileUploader.js';
        
        const uploader = new FileUploader();
        uploader.render(document.getElementById('file-uploader'));
        uploader.setup();
    </script>
</body>
</html>
```

## 🎨 Кастомизация стилей

Компоненты используют CSS-классы, которые можно переопределить:

```css
/* Стили для одиночного загрузчика */
.file-uploader { /* Основной контейнер */ }
.file-dropzone { /* Зона загрузки */ }
.file-preview { /* Превью файла */ }
.delete-btn { /* Кнопка удаления */ }

/* Стили для множественного загрузчика */
.multi-file-uploader { /* Основной контейнер */ }
.uploader-header { /* Заголовок с кнопкой добавления */ }
.files-list { /* Список файлов */ }
.file-uploader-item { /* Элемент списка */ }
```

## 📝 API Reference

### FileUploader

#### Конструктор опции:
```javascript
{
    acceptedTypes: string,    // MIME типы или расширения (по умолчанию: '*/*')
    maxSize: number,          // Максимальный размер в байтах (по умолчанию: 10MB)
    previewSize: object       // { width: number, height: number }
}
```

#### Методы:
- `render(container)` - Рендер в контейнер
- `setup()` - Настройка компонента
- `getFile()` - Получить текущий файл
- `setFile(file)` - Установить файл программно
- `clear()` - Очистить файл
- `validateFile(file)` - Валидация файла

#### События:
- `change` - Изменение файла `{ file, action }`
- `error` - Ошибка `{ type, message }`

### MultiFileUploader

#### Конструктор опции:
```javascript
{
    acceptedTypes: string,      // MIME типы или расширения
    maxSize: number,            // Максимальный размер файла
    maxFiles: number,           // Максимальное количество файлов (по умолчанию: 10)
    previewSize: object,        // Размер превью
    allowDuplicates: boolean    // Разрешить дубликаты (по умолчанию: false)
}
```

#### Методы:
- `render(container)` - Рендер в контейнер
- `setup()` - Настройка компонента
- `getFiles()` - Получить все файлы с метаданными
- `getFileObjects()` - Получить массив File объектов
- `addFile(file)` - Добавить файл программно
- `setFiles(files)` - Установить файлы программно
- `clear()` - Очистить все файлы
- `getFileCount()` - Получить количество файлов
- `isMaxFilesReached()` - Проверка лимита файлов

#### События:
- `filesChange` - Изменение списка файлов `[{ id, file, name, size, type }]`
- `fileAdd` - Добавление файла `{ id, file }`
- `fileRemove` - Удаление файла `{ id, file }`
- `error` - Ошибка `{ type, message }`

## 🧪 Тестирование

Для тестирования компонентов:

1. Откройте `src/pages/TestFormPage.html` в браузере
2. Протестируйте все функции:
   - Загрузка изображений и документов
   - Drag & Drop
   - Редактирование файлов
   - Удаление файлов
   - Валидация размера и типа
   - Отправка формы

### Пример тестовой формы:

```javascript
import TestForm from './components/TestForm.js';

const testForm = new TestForm();
testForm.init();
testForm.render(document.getElementById('container'));
```

## 🔧 Требования

- ES6+ поддержка
- Современный браузер с поддержкой:
  - File API
  - Drag and Drop API
  - FormData
  - ES6 modules

## 📄 Лицензия

Свободное использование в рамках проекта.

---

## 🚀 Быстрый старт

1. Скопируйте файлы компонентов в ваш проект
2. Импортируйте нужный класс или Vue компонент
3. Создайте экземпляр с нужными опциями
4. Вызовите `render()` и `setup()`
5. Подпишитесь на события для обработки изменений

**Готово!** Ваш загрузчик файлов работает 🎉