# GymRat Frontend

Frontend de la aplicación **GymRat**, una plataforma para gestionar rutinas de entrenamiento personalizadas. Construido con Vue 3 + TypeScript + Vite.

## Tecnologías

- **Vue 3** — framework principal con Composition API
- **TypeScript** — tipado estático
- **Vite** — bundler y servidor de desarrollo
- **Pinia** — gestión de estado global
- **Vue Router** — navegación SPA
- **Supabase** — autenticación de usuarios
- **Axios** — cliente HTTP para comunicación con la API

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables (RutinaCard, DiaCard, EjercicioCard, etc.)
├── views/            # Vistas/páginas (Home, Login, Rutina, CrearRutina)
├── stores/           # Estado global con Pinia (auth, rutina, usuario)
├── router/           # Configuración de rutas y guards de navegación
├── services/         # Capa de comunicación con la API REST
├── lib/              # Clientes externos (Supabase)
├── types/            # Interfaces TypeScript del dominio
└── styles/           # Estilos globales y de componentes
```

## Funcionalidades

- **Autenticación** — login/logout mediante Supabase, con redirección automática según sesión
- **Home** — listado de rutinas del usuario autenticado
- **Detalle de rutina** — visualización de semanas, días y ejercicios con series/reps/kg
- **Crear rutina** — formulario para crear rutinas con semanas, días y ejercicios anidados
- **Eliminar rutina** — borrado desde la vista de detalle

## Requisitos previos

- Node.js 18+
- Backend corriendo en `http://localhost:3000` (o configurado via variable de entorno)
- Proyecto de Supabase configurado

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_API_URL=http://localhost:3000/api
```

## Scripts

```bash
# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Verificación de tipos TypeScript
npm run type-check
```

## Rutas

| Ruta             | Vista            | Acceso       |
|------------------|------------------|--------------|
| `/login`         | LoginView        | Público      |
| `/`              | HomeView         | Autenticado  |
| `/crear-rutina`  | CrearRutinaView  | Autenticado  |
| `/rutina/:id`    | RutinaView       | Autenticado  |

Las rutas protegidas redirigen a `/login` si no hay sesión activa. Si el usuario ya está autenticado e intenta acceder a `/login`, es redirigido a `/`.
