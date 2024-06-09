# SkillHive

SkillHive es una plataforma para freelancers y empresas que buscan contratar talento.

## Instalación

1. Clonar el repositorio en tu máquina local.
2. Instalar las dependencias con `npm install`.
3. Crear un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

```env
# server
PORT=3000
HOST=localhost

# jwt
JWT_SECRET=seed

# mails
MAIL_SERVICE=gmail
MAIL_HOST=smtp.gmail.com
MAIL_AUTH=true
MAIL_USER=alikdev735@gmail.com
MAIL_PASS=zeeegtqztwmfrlpl
MAIL_PORT=465

# database
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=skillhive
DB_PORT=3306
DB_LOGS=true

# cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# paypal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

4. Crear una base de datos en MySQL con el nombre `skillhive`.
5. Ejecutar el proyecto con `npm run dev`.