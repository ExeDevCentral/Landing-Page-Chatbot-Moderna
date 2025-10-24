# Sistema de Gestión de Tickets Moderno

Un sistema completo de gestión de tickets desarrollado con tecnologías modernas, incluyendo manejo robusto de errores, validación avanzada y arquitectura escalable.

## 🚀 Características Principales

### ✅ Manejo Robusto de Errores
- **Sistema de reintentos** con backoff exponencial
- **Validación completa** en frontend y backend
- **Mensajes de error** en español y user-friendly
- **Logging estructurado** para debugging y monitoreo
- **Manejo de timeouts** y errores de red

### 🛠️ Tecnologías Modernas
- **React 19** con TypeScript para el frontend
- **Node.js + Express** para el backend
- **MongoDB** con Mongoose para la base de datos
- **Webpack 5** con hot reload
- **ESLint + Prettier** para calidad de código
- **Tailwind CSS** para estilos

### 📱 Funcionalidades
- **Creación de tickets** con validación en tiempo real
- **Escaneo de tickets** por ID o QR
- **Interfaz responsive** y moderna
- **Notificaciones** de éxito y error
- **Validación de formularios** avanzada

## 🏗️ Arquitectura

```
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Componentes React
│   ├── css/               # Estilos globales
│   └── index.tsx          # Punto de entrada
├── server/                # Backend Node.js
│   ├── controllers/       # Controladores de rutas
│   ├── models/           # Modelos de MongoDB
│   ├── routes/           # Definición de rutas
│   ├── middleware/       # Middleware personalizado
│   └── utils/            # Utilidades del servidor
├── types/                # Definiciones TypeScript
├── utils/                # Utilidades compartidas
└── services/             # Servicios de API
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB (local o Atlas)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd landing-page-chatbot
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp config/env.example .env
# Editar .env con tus configuraciones
```

4. **Inicializar la base de datos**
```bash
npm run seed
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor backend en modo desarrollo
npm run dev:frontend     # Frontend con hot reload

# Producción
npm run build            # Construir para producción
npm start               # Iniciar servidor de producción

# Calidad de código
npm run lint            # Verificar código con ESLint
npm run lint:fix        # Corregir errores automáticamente
npm run format          # Formatear código con Prettier
npm run type-check      # Verificar tipos TypeScript

# Testing
npm test                # Ejecutar tests
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/ticket-system

# Logging
LOG_LEVEL=info
ENABLE_FILE_LOGGING=false
ENABLE_REMOTE_LOGGING=false

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### Configuración de TypeScript

El proyecto incluye configuración completa de TypeScript con:
- **Strict mode** habilitado
- **Path mapping** para imports limpios
- **Decorators** para futuras expansiones
- **Source maps** para debugging

### Configuración de ESLint

Reglas configuradas para:
- **TypeScript** específicas
- **React** best practices
- **Prettier** integración
- **Consistencia** de código

## 📊 Sistema de Manejo de Errores

### Backend
- **Validación de datos** con mensajes en español
- **Manejo de errores MongoDB** específicos
- **Reintentos automáticos** para operaciones críticas
- **Logging estructurado** con contexto

### Frontend
- **Validación en tiempo real** de formularios
- **Manejo de errores de red** con reintentos
- **Notificaciones user-friendly** de errores
- **Estados de carga** y feedback visual

### Tipos de Errores Manejados
- ✅ **Errores de validación** (datos inválidos)
- ✅ **Errores de red** (timeouts, conexión)
- ✅ **Errores de servidor** (500, 503)
- ✅ **Errores de base de datos** (conexión, duplicados)
- ✅ **Errores de formato** (IDs inválidos)

## 🎨 Componentes React

### TicketForm
- Validación en tiempo real
- Estados de carga
- Manejo de errores visual
- Sanitización de datos

### TicketScanner
- Escaneo por ID manual
- Simulación de QR (para demo)
- Manejo de errores de búsqueda
- Feedback visual

### TicketManager
- Navegación por tabs
- Notificaciones
- Estado global de tickets
- Diseño responsive

## 🔍 API Endpoints

### Tickets
```
POST   /api/tickets          # Crear ticket
GET    /api/tickets          # Listar tickets (con paginación)
GET    /api/tickets/:id      # Obtener ticket por ID
PUT    /api/tickets/:id      # Actualizar ticket
DELETE /api/tickets/:id      # Eliminar ticket
```

### Respuestas de Error
```json
{
  "error": "ValidationError",
  "message": "Datos de entrada inválidos",
  "details": ["El menú es requerido"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Testing

### Ejecutar Tests
```bash
npm test                    # Todos los tests
npm test -- --watch        # Modo watch
npm test -- --coverage     # Con cobertura
```

### Estructura de Tests
```
├── __tests__/
│   ├── components/        # Tests de componentes
│   ├── services/          # Tests de servicios
│   └── utils/             # Tests de utilidades
```

## 📈 Monitoreo y Logging

### Logs Estructurados
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "Ticket created successfully",
  "context": {
    "operation": "createTicket",
    "ticketId": "507f1f77bcf86cd799439011",
    "orderNumber": 123,
    "table": "A1"
  }
}
```

### Métricas de Performance
- Tiempo de respuesta de API
- Tiempo de validación de formularios
- Tiempo de carga de componentes
- Errores por operación

## 🚀 Despliegue

### Desarrollo Local
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run dev:frontend
```

### Producción
```bash
npm run build
npm start
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- Usar TypeScript para todo el código nuevo
- Seguir las reglas de ESLint configuradas
- Escribir tests para nuevas funcionalidades
- Documentar APIs y componentes complejos

## 📝 Changelog

### v2.0.0 - Sistema Moderno
- ✅ Migración completa a TypeScript
- ✅ Implementación de React 19
- ✅ Sistema robusto de manejo de errores
- ✅ Validación avanzada frontend/backend
- ✅ Logging estructurado
- ✅ Arquitectura escalable

### v1.0.0 - Versión Inicial
- ✅ Sistema básico de tickets
- ✅ Backend con Express
- ✅ Frontend con JavaScript vanilla
- ✅ Base de datos MongoDB

## 📄 Licencia

MIT License

Copyright (c) [2025] [Exequiel Echevarria  ExeDevCentral]

Permiso por la presente se concede, libre de cargo, a cualquier persona que obtenga una copia
de este software y de los archivos de documentación asociados (el "Software"), para utilizar
el Software sin restricciones, incluyendo, sin limitación, los derechos a usar, copiar,
modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del Software, y
para permitir a las personas a las que se les proporcione el Software a hacer lo mismo, 
sujeto a las siguientes condiciones:

- El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias
o partes sustanciales del Software.

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA,
INCLUYENDO PERO NO LIMITÁNDOSE A GARANTÍAS DE COMERCIALIZACIÓN, ADECUACIÓN PARA UN PROPÓSITO
PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DEL COPYRIGHT SERÁN RESPONSABLES
DE CUALQUIER RECLAMO, DAÑO O OTRA RESPONSABILIDAD, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O 
CUALQUIER OTRA ACCIÓN, QUE SURJA DE O EN CONEXIÓN CON EL SOFTWARE O EL USO U OTRO TIPO DE 
INTERACCIONES CON EL SOFTWARE.
## 🆘 Soporte

Para soporte y preguntas:
- Crear un issue en GitHub
- Revisar la documentación
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ usando tecnologías modernas**
