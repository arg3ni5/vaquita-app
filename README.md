# 🐮 Vaquita App

Una aplicación web moderna para gestionar gastos compartidos entre amigos. Perfecta para viajes, salidas grupales o cualquier situación donde necesites dividir gastos de manera justa.

## ✨ Características

- 📱 **Interfaz moderna y responsive** - Funciona en cualquier dispositivo
- 👥 **Gestión de amigos** - Agrega y gestiona participantes fácilmente
- 💰 **Registro de gastos** - Registra quién pagó y por quién
- 📊 **Cálculo automático de deudas** - Algoritmo inteligente para minimizar transacciones
- ☁️ **Sincronización en la nube** - Usa Firebase para guardar datos en tiempo real
- 🔐 **Autenticación múltiple** - Login con Google o teléfono
- 💱 **Múltiples monedas** - Soporte para diferentes monedas
- 🎨 **Diseño moderno** - UI construida con Tailwind CSS
- 🔔 **Notificaciones elegantes** - Alertas con SweetAlert2

## 🚀 Tecnologías

- **React 19** - Framework principal
- **Vite** - Build tool y dev server
- **Firebase** - Backend y autenticación
- **Tailwind CSS** - Estilos y diseño
- **Lucide React** - Iconos modernos
- **SweetAlert2** - Alertas y modales

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/arg3ni5/vaquita-app.git
cd vaquita-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura Firebase:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Crea un archivo `src/firebase.js` con tu configuración de Firebase
   - Habilita Authentication (Google y Phone) y Realtime Database

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 🛠️ Scripts disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run preview  # Previsualiza la build de producción
npm run lint     # Ejecuta el linter
```

## 🏗️ Estructura del proyecto

```
vaquita-app/
├── src/
│   ├── components/      # Componentes React
│   │   ├── Header.jsx
│   │   ├── JoinVaquita.jsx
│   │   ├── FriendSection.jsx
│   │   ├── ExpenseSection.jsx
│   │   └── SummarySection.jsx
│   ├── hooks/           # Custom React hooks
│   │   └── useVaquita.js
│   ├── utils/           # Utilidades y helpers
│   │   └── swal.js
│   ├── assets/          # Recursos estáticos
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   ├── firebase.js      # Configuración de Firebase
│   └── index.css        # Estilos globales
├── public/              # Archivos públicos
└── index.html           # HTML principal
```

## 💡 Cómo usar

1. **Autenticación**: Inicia sesión con Google o tu número de teléfono
2. **Crear/Unirse a Vaquita**: Crea una nueva vaquita o únete a una existente con un ID
3. **Agregar amigos**: Añade los participantes del grupo
4. **Registrar gastos**: Indica quién pagó, el monto y por quiénes
5. **Ver resumen**: La app calcula automáticamente quién debe a quién

## 🔧 Configuración de Firebase

Asegúrate de configurar las siguientes reglas en Firebase Realtime Database:

```json
{
  "rules": {
    "vaquitas": {
      "$vaquitaId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

## 🎯 Características destacadas

### Algoritmo de minimización de deudas
La aplicación utiliza un algoritmo inteligente que:
- Calcula el balance de cada persona
- Minimiza el número de transacciones necesarias
- Optimiza los pagos para simplificar las deudas

### Sincronización en tiempo real
- Los cambios se guardan automáticamente en Firebase
- Múltiples usuarios pueden ver actualizaciones en tiempo real
- Cada vaquita tiene un ID único para compartir

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Móviles
- 💻 Tablets
- 🖥️ Escritorio

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👤 Autor

**arg3ni5**
- GitHub: [@arg3ni5](https://github.com/arg3ni5)

## 🙏 Agradecimientos

- Inspirado en la necesidad de simplificar gastos compartidos
- Construido con las mejores prácticas de React y Firebase
- UI/UX diseñado para ser intuitivo y fácil de usar

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
