# Sistema de Autenticación y Pagos - DIAGHU

## Overview

Este proyecto ahora incluye:
- Sistema de autenticación con Supabase
- Roles de usuario (cliente/admin/staff)
- Integración de PayPal para pagos de pre-consulta ($50 USD)
- Formulario de pre-consulta protegido
- Upload de comprobantes de pago
- Dashboard de admin para gestionar solicitudes
- Gestión de turnos (aprobar/rechazar/reprogramar)

## Configuración Inicial

### 1. Configurar Supabase Auth

1. Ve a tu proyecto de Supabase en [supabase.com/dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** > **Providers**
3. Habilita **Email** provider
4. Configura las plantillas de email (opcional pero recomendado)

### 2. Habilitar Supabase Auth en tu proyecto

El proyecto usa Supabase Auth nativo. No necesitas crear tablas personalizadas para autenticación.

### 3. Configurar Variables de Entorno

Crea o edita tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_PAYPAL_EMAIL=your-paypal-business-email@example.com
```

**Importante**: Reemplaza los valores con tus credenciales reales.

### 4. Configurar PayPal

1. Crea una cuenta de negocio en [PayPal](https://www.paypal.com)
2. Ve a tu configuración de PayPal
3. Copia tu email de negocio
4. Agrégalo a la variable `VITE_PAYPAL_EMAIL` en tu archivo `.env`

### 5. Migración de Base de Datos

El esquema de base de datos ya incluye la tabla `users` con el campo `role`. Asegúrate de ejecutar las migraciones:

```bash
# Si tienes Supabase CLI instalado
supabase db push

# O ejecuta manualmente en el SQL Editor de Supabase
# el contenido de supabase/migrations/001_initial_schema.sql
# Y también: supabase/migrations/003_add_payment_support.sql
```

### 5. Execute Payment Support Migration

Ejecuta la migración para agregar soporte de pagos:

```sql
-- Ejecuta en SQL Editor de Supabase
-- Archivo: supabase/migrations/003_add_payment_support.sql
```

Esta migración:
- Agrega campos `payment_proof_url` y `scheduled_date` a la tabla `pre_consultations`
- Crea un bucket de storage llamado `payment-proofs` para los comprobantes
- Configura políticas de RLS para el bucket

## Flujo de Usuario

### Registro

1. El usuario hace clic en "Iniciar sesión" en el header
2. Selecciona la pestaña "Registrarse"
3. Ingresa:
   - Nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
4. Al registrarse, se crea automáticamente un registro en la tabla `users` con rol `client`

### Login

1. El usuario hace clic en "Iniciar sesión"
2. Ingresa email y contraseña
3. Supabase Auth maneja la autenticación
4. El rol del usuario se carga desde la tabla `users`

### Pre-consulta

1. El usuario navega a `/pre-consulta`
2. Si no está autenticado, ve un mensaje indicando que debe iniciar sesión
3. Al intentar enviar el formulario, se abre el modal de autenticación
4. Una vez autenticado, puede:
   - Ver el formulario completo
   - Ver el botón de pago de PayPal ($50 USD)
   - Adjuntar comprobante de pago (imagen o PDF)
   - Enviar la solicitud
5. El comprobante se sube a Supabase Storage y la solicitud se guarda en la base de datos

### Dashboard de Admin

1. Los usuarios con rol `admin` o `staff` ven un botón "Admin" en el header
2. Al hacer clic, acceden a `/admin`
3. Pueden ver todas las solicitudes de pre-consulta con:
   - Información del cliente
   - Estado de la solicitud (pending, approved, rejected, rescheduled)
   - Comprobante de pago adjunto
4. Acciones disponibles:
   - **Ver comprobante**: Abre un modal con la imagen del recibo
   - **Aprobar**: Cambia el estado a "approved"
   - **Rechazar**: Cambia el estado a "rejected"
   - **Reprogramar**: Permite seleccionar una nueva fecha y cambia el estado a "rescheduled"

### Roles de Usuario

- **client**: Rol predeterminado para nuevos usuarios
- **staff**: Personal del equipo
- **admin**: Administrador del sistema

Los roles se almacenan en la tabla `users` y se cargan automáticamente al iniciar sesión.

## Componentes

### AuthProvider

Contexto de autenticación que envuelve toda la aplicación. Proporciona:

- `user`: Usuario actual de Supabase Auth
- `session`: Sesión actual
- `role`: Rol del usuario (client/staff/admin)
- `loading`: Estado de carga
- `signIn()`: Función para iniciar sesión
- `signUp()`: Función para registrarse
- `signOut()`: Función para cerrar sesión
- `refreshRole()`: Recargar el rol del usuario

### AuthModal

Modal de autenticación con dos pestañas:
- Login: Iniciar sesión con email y contraseña
- Register: Registrarse con nombre, email y contraseña

### SiteHeader

Header actualizado con:
- Botón de login/logout según estado de autenticación
- Icono de LogIn/LogOut

### Pre-consulta

Formulario de pre-consulta actualizado:
- Requiere autenticación para enviar
- Muestra mensaje si no está autenticado
- Muestra botón de PayPal si está autenticado

## PayPal Integration

El botón de PayPal usa un link estándar de PayPal:

```
https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business={PAYPAL_EMAIL}&currency_code=USD&amount=50.00&item_name=Pre-consultation DIAGHU
```

Parámetros:
- `business`: Tu email de PayPal (configurado en `.env`)
- `currency_code`: USD
- `amount`: 50.00
- `item_name`: Descripción del pago

## Traducciones

Se agregaron nuevas traducciones en `locales/`:

**fr.json, es.json, ht.json**:
- `auth.login`: "Connexion" / "Iniciar sesión" / "Konekte"
- `auth.register`: "Inscription" / "Registrarse" / "Enskri"
- `auth.email`: "Email" / "Email" / "Imèl"
- `auth.password`: "Mot de passe" / "Contraseña" / "Modpas"
- `auth.fullName`: "Nom complet" / "Nombre completo" / "Non konplè"
- `auth.loginButton`: "Se connecter" / "Iniciar sesión" / "Konekte"
- `auth.registerButton`: "S'inscrire" / "Registrarse" / "Enskri"
- `auth.loading`: "Chargement..." / "Cargando..." / "Chaj..."
- `auth.loginRequired`: Mensaje de autenticación requerida
- `auth.paypalTitle`: Título de sección PayPal
- `auth.paypalDescription`: Descripción del pago
- `auth.paypalButton`: Texto del botón PayPal

## Security Considerations

1. **Nunca expongas las claves de servicio** en el código del cliente
2. **Usa RLS (Row Level Security)** en Supabase para proteger los datos
3. **Valida el email** en el backend antes de procesar pagos
4. **Revisa los roles** antes de permitir acciones administrativas
5. **Configura correctamente** los email templates de Supabase

## Troubleshooting

### Error: "Supabase URL or Anon Key not found"

**Solución**: Asegúrate de tener un archivo `.env` con las variables de Supabase configuradas.

### Error: "User not found in users table"

**Solución**: El usuario puede estar autenticado en Supabase Auth pero no tener un registro en la tabla `users`. Verifica que la función `signUp` cree el registro correctamente.

### PayPal no abre o muestra error

**Solución**: Verifica que `VITE_PAYPAL_EMAIL` esté configurado correctamente en tu archivo `.env`.

### El rol no se carga correctamente

**Solución**: Verifica que la tabla `users` tenga el campo `role` y que el registro del usuario exista.

## Próximos Pasos

Para mejorar el sistema:

1. **Verificación de email**: Habilitar la verificación de email en Supabase Auth
2. **Recuperación de contraseña**: Configurar el flujo de recuperación de contraseña
3. **Dashboard de admin**: Crear una interfaz para que los admin vean las pre-consultaciones
4. **Webhooks de PayPal**: Configurar webhooks para confirmar pagos automáticamente
5. **Dashboard de cliente**: Permitir que los clientes vean el historial de sus consultas

## Soporte

Para más información:
- Supabase Auth: https://supabase.com/docs/guides/auth
- PayPal Payment Links: https://developer.paypal.com/docs/checkout/
