# 📈 Rastreador de Hábitos

Una aplicación moderna, rápida y responsiva para el seguimiento de hábitos. Diseñada para ayudarte a construir buenas rutinas, registrar tu progreso diario y celebrar tus logros.

## ✨ Características

- **Seguimiento Diario**: Registra tus hábitos día a día con valores personalizados y notas.
- **Logros (Milestones)**: Registra tus "Victorias" e hitos para mantener la motivación a lo largo del tiempo.
- **Metas Personalizables**: Establece objetivos mínimos e ideales para cada hábito, junto con unidades de medida personalizadas.
- **Feedback Visual**: Hermosos colores e indicadores visuales para tus rachas y progreso.
- **Acceso Privado**: Protegido mediante una contraseña maestra para asegurar que solo tú puedas ver y modificar tus datos.
- **Cloud Ready**: Configurado para ser desplegado instantáneamente en Vercel como entorno Serverless utilizando una base de datos PostgreSQL.

## 🛠️ Tecnologías (Tech Stack)

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [Zustand](https://zustand-demo.pmnd.rs/) (Manejo de Estado)
- **Backend**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) (Desplegado como Funciones Serverless)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) (mediante [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres))
- **Despliegue**: [Vercel](https://vercel.com/)

## 🚀 Despliegue en Internet (Vercel)

Este repositorio está completamente configurado para desplegarse en Vercel con un solo clic.

1. Haz un *Fork* o clona este repositorio en tu cuenta de GitHub.
2. Crea un nuevo Proyecto en Vercel e importa el repositorio.
3. Antes de hacer clic en desplegar, ve a la pestaña **Storage** en tu proyecto de Vercel y crea una nueva base de datos **Postgres**. Esto configurará automáticamente la variable de entorno `POSTGRES_URL`.
4. Ve a **Settings > Environment Variables** y añade una nueva variable de entorno:
   - **Clave (Key)**: `APP_PASSWORD`
   - **Valor (Value)**: `TuContraseñaSecreta` (Esta será la contraseña maestra requerida para entrar a la aplicación).
5. ¡Haz clic en **Deploy**! Vercel construirá automáticamente el frontend en React y desplegará la API de Express como Serverless Functions.

## 💻 Desarrollo Local

Si deseas ejecutar el proyecto localmente, necesitarás una base de datos PostgreSQL.

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/habits-tracker.git
cd habits-tracker
```

2. Configura la URL de tu base de datos y la contraseña maestra como variables de entorno (por ejemplo, en tu terminal o en un archivo `.env` para la API):
```bash
export POSTGRES_URL="postgresql://usuario:contraseña@localhost:5432/habitos"
export APP_PASSWORD="mipasswordlocal"
```

3. Inicia el servidor de la API (se ejecuta en el puerto 3001):
```bash
cd api
npm install
node index.js
```

4. Inicia el Frontend con Vite (se ejecuta en el puerto 5173):
```bash
cd client
npm install
npm run dev
```

5. Abre tu navegador web en `http://localhost:5173`.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).
