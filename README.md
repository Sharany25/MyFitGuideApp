# 💪 MyFitGuideApp

**Tu asistente personal de fitness en tu bolsillo**

MyFitGuideApp es una aplicación móvil nativa desarrollada con **React Native + Expo + TypeScript** que te permite acceder a rutinas y dietas personalizadas generadas con IA. Conecta con MyFitGuideAPI para ofrecerte la mejor experiencia fitness en cualquier momento y lugar.

---

## 🌟 Características Principales

- 🤖 **Rutinas Personalizadas con IA** - Accede a planes de entrenamiento creados especialmente para ti
- 🥗 **Dietas Inteligentes** - Recibe planes nutricionales adaptados a tus objetivos
- 📱 **Interfaz Intuitiva** - Diseño moderno y fácil de usar
- 📊 **Seguimiento de Progreso** - Monitorea tu avance en tiempo real
- 🔔 **Notificaciones Push** - Recibe recordatorios de tus entrenamientos
- 📍 **Ubicación** - Encuentra gimnasios cerca de ti
- 📸 **Galería de Fotos** - Comparte y visualiza tu progreso
- 💾 **Almacenamiento Local** - Funciona sin conexión (datos sincronizados)
- 🎯 **Múltiples Plataformas** - iOS, Android y Web

---

## 🛠️ Stack Tecnológico

| Tecnología | Descripción |
|-----------|------------|
| **React Native** | Framework para desarrollo multiplataforma |
| **Expo** | Plataforma para crear apps React Native |
| **TypeScript** | Lenguaje tipado para mayor seguridad |
| **React Navigation** | Navegación nativa |
| **React Native Paper** | Componentes Material Design |
| **Axios** | Cliente HTTP |
| **React Hook Form** | Gestión de formularios |
| **Lottie** | Animaciones fluidas |

---

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode (Mac)
- Android: Android Studio
- Cuenta en Expo (opcional pero recomendado)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/DiegoOsorioDEV/MyFitGuideApp.git
cd MyFitGuideApp
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz:

```env
EXPO_PUBLIC_API_URL=http://tu-api.com/api
EXPO_PUBLIC_API_KEY=tu_api_key_aqui
```

### 4. Ejecutar la aplicación

```bash
# Iniciar Expo
npm start

# Para desarrollo en Android
npm run android

# Para desarrollo en iOS (solo Mac)
npm run ios

# Para web
npm run web
```

---

## 💻 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en Web
npm run web

# Build para producción Android
eas build --platform android

# Build para producción iOS
eas build --platform ios
```

---

## 📚 Funcionalidades Principales

### 🔐 Autenticación
- Login y registro de usuarios
- Autenticación con JWT
- Recuperación de contraseña
- Perfil de usuario personalizado

### 🏋️ Rutinas de Entrenamiento
- Visualizar rutinas generadas con IA
- Ver ejercicios detallados con descripciones
- Marcar ejercicios como completados
- Seguimiento de series y repeticiones
- Historial de entrenamientos

### 🍎 Gestión de Dietas
- Ver planes nutricionales personalizados
- Desglose de macronutrientes
- Recomendaciones de alimentos
- Tracking de comidas diarias
- Calorías consumidas vs objetivo

### 📊 Dashboard & Progreso
- Vista general de estadísticas
- Gráficos de progreso
- Historial de actividades
- Objetivos y metas

### 🗺️ Ubicación
- Encontrar gimnasios cercanos
- Mapa interactivo
- Información de gimnasios
- Direcciones GPS

### 📷 Galería de Progreso
- Capturar fotos de progreso
- Compartir logros
- Comparativa antes/después
- Galería personal

### 🔔 Notificaciones
- Recordatorios de entrenamientos
- Recordatorios de comidas
- Notificaciones de nuevas rutinas
- Alertas de objetivos alcanzados

---

## 🏗️ Estructura del Proyecto

```
MyFitGuideApp/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── common/          # Componentes comunes
│   │   ├── workout/         # Componentes de rutinas
│   │   └── nutrition/       # Componentes de dietas
│   ├── screens/             # Pantallas de la app
│   │   ├── AuthStack/       # Pantallas de autenticación
│   │   ├── HomeStack/       # Pantallas principales
│   │   └── ProfileStack/    # Pantallas de perfil
│   ├── navigation/          # Configuración de navegación
│   ├── services/            # Servicios (API calls)
│   ├── hooks/               # Custom React hooks
│   ├── context/             # Context API
│   ├── utils/               # Utilidades
│   ├── types/               # TypeScript types
│   └── App.tsx              # Componente raíz
├── assets/                  # Imágenes y recursos
├── app.json                 # Configuración Expo
├── package.json
├── tsconfig.json
└── .env                     # Variables de entorno
```

---

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch
```

---

## 📖 Pantallas Principales

### Stack de Autenticación
- **Login** - Iniciar sesión
- **Registro** - Crear nueva cuenta
- **Recuperar Contraseña** - Reset de password

### Stack Principal
- **Home** - Dashboard con resumen
- **Rutinas** - Lista y detalle de entrenamientos
- **Dietas** - Planes nutricionales
- **Progreso** - Estadísticas y gráficos
- **Ubicación** - Mapa de gimnasios
- **Perfil** - Configuración de usuario

---

## 🔒 Seguridad

- Autenticación segura con JWT
- Almacenamiento encriptado de credenciales
- Validación de datos en cliente y servidor
- HTTPS para todas las comunicaciones
- Manejo seguro de datos sensibles

---

## 🎨 Diseño UI/UX

- **Material Design** - Componentes de React Native Paper
- **Responsive** - Adaptable a cualquier tamaño de pantalla
- **Animaciones Fluidas** - Con Lottie
- **Tema Personalizable** - Colores y estilos
- **Accesibilidad** - Soporte para screen readers

---

## 📦 Dependencias Principales

```
react-native: 0.81.4
expo: 54.0.13
react: 19.1.0
react-navigation: 7+
react-native-paper: 5.14.5
axios: 1.11.0
react-hook-form: 7.56.4
```

---

## 🔄 Integración con Backend

La app se conecta con **MyFitGuideAPI** para:

- Autenticación de usuarios
- Generación de rutinas con IA
- Generación de dietas con IA
- Sincronización de progreso
- Almacenamiento en la nube

---

## 🚀 Deployment

### Preparar para producción

```bash
# Build optimizado
npm run build

# Generar APK (Android)
eas build --platform android --release-channel production

# Generar IPA (iOS)
eas build --platform ios --release-channel production
```

### Publicar en tiendas

- **Google Play Store** - APK compilado
- **Apple App Store** - IPA compilado
- **Expo Go** - Para testing rápido

---

## 🐛 Solución de Problemas

### Problema: "Metro server is shutting down"
```bash
npm start -- --reset-cache
```

### Problema: Error en build Android
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Problema: Módulos no encontrados
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Compatibilidad

- **iOS**: 13.0+
- **Android**: 6.0+ (API 23+)
- **Web**: Chrome, Firefox, Safari

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la licencia UNLICENSED.

---

## 👨‍💻 Autor

**Diego Osorio**
- GitHub: [@DiegoOsorioDEV](https://github.com/DiegoOsorioDEV)
- MyFitGuideAPI: [Repositorio](https://github.com/DiegoOsorioDEV/MyFitGuideAPI)

---

## 🙏 Agradecimientos

- [React Native](https://reactnative.dev/) - Framework multiplataforma
- [Expo](https://expo.dev/) - Plataforma de desarrollo
- [React Navigation](https://reactnavigation.org/) - Navegación nativa
- [React Native Paper](https://reactnativepaper.com/) - Componentes Material Design

---

## 💡 Roadmap Futuro

- [ ] Integración con Wearables (Apple Watch, Fitbit)
- [ ] IA para análisis de fotos de progreso
- [ ] Comparativa antes/después automática
- [ ] Integración con Google Fit y Health
- [ ] Notificaciones de amigos en la app
- [ ] Compartir logros en redes sociales
- [ ] Versión offline mejorada
- [ ] Widget de home screen

---

## 📞 Soporte

Si tienes preguntas o encuentras problemas:
- Abre un [issue](https://github.com/DiegoOsorioDEV/MyFitGuideApp/issues)
- Revisa la [documentación](https://reactnative.dev/docs/getting-started)

---

**⭐ Si este proyecto te fue útil, por favor considera darle una estrella en GitHub!**
