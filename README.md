# Lab P4 - BluePrints en tiempo real

Aplicacion React + Vite para dibujar BluePrints colaborativos. El frontend consume el CRUD REST de la Parte 3 y usa STOMP sobre WebSocket para replicar puntos entre varias pestañas.

## Entrega

- Rama de trabajo: `feat/complete-lab`
- Tecnologia RT elegida: STOMP (Spring Boot)
- Frontend: React 18, Vite y Axios
- Pruebas: Vitest, Testing Library y jsdom
- Backend esperado: API CRUD + endpoint STOMP del equipo

## Funcionalidades

- Login con JWT y control del permiso `blueprints.write`.
- Panel del autor con listado de planos.
- Total de puntos calculado con `reduce`.
- Carga de puntos del plano seleccionado.
- Create, Save/Update y Delete.
- Canvas responsive con dibujo por clic.
- Modo `None` para dibujo local y modo `STOMP` para colaboracion.
- Actualizacion en vivo del plano mediante topics aislados por autor y nombre.
- Estados de carga, confirmacion y error.
- Pruebas automatizadas del panel, total, listado y PUT.

## Requisitos

- Node.js 18 o superior.
- npm 9 o superior.
- Backend de la Parte 3 ejecutandose en `http://localhost:8080`.
- Backend configurado con REST, JWT y WebSocket/STOMP.

## Instalacion y configuracion

Desde la raiz del frontend:

```bash
npm install
Copy-Item .env.example .env.local
```

En macOS/Linux:

```bash
cp .env.example .env.local
```

Variables de `.env.local`:

```env
VITE_API_BASE=http://localhost:8080
VITE_STOMP_BASE=http://localhost:8080
```

No se deben subir tokens ni credenciales privadas al repositorio. Las cuentas indicadas anteriormente son credenciales de demostracion del laboratorio. El token JWT se guarda solamente en `localStorage` durante la sesion del navegador.

## Ejecucion

1. Inicia el backend REST y STOMP del equipo.
2. Desde este repositorio ejecuta:

```bash
npm run dev
```

3. Abre `http://localhost:5173`.
4. Usa una de las siguientes cuentas para ingresar y probar todas las operaciones:
  - Usuario: `student` | Contrasena: `student123`
  - Usuario: `assistant` | Contrasena: `assistant123`
5. Escribe el autor y selecciona un plano desde el panel lateral.
6. Selecciona `STOMP`, abre una segunda pestaña con el mismo autor y plano y haz clic en ambos canvas.

Para una comprobacion de produccion:

```bash
npm run build
npm run preview
```

## Contrato REST utilizado

El cliente usa el prefijo configurado en `VITE_API_BASE` y envia el JWT como `Authorization: Bearer <token>`.

| Metodo | Endpoint | Uso |
| --- | --- | --- |
| `POST` | `/auth/login` | Obtener JWT |
| `GET` | `/api/blueprints?author=:author` | Listar planos del autor |
| `GET` | `/api/blueprints/:author/:name` | Obtener todos los puntos |
| `POST` | `/api/blueprints` | Crear un plano |
| `PUT` | `/api/blueprints/:author/:name` | Reemplazar los puntos del plano |
| `DELETE` | `/api/blueprints/:author/:name` | Eliminar el plano |

El listado debe devolver, como minimo, `name` y el total de puntos. El frontend acepta `totalPoints`, `pointCount` o un arreglo `points` para calcular ese valor.

Ejemplo de payload para crear o actualizar:

```json
{
  "author": "juan",
  "name": "plano-1",
  "points": [
    { "x": 80, "y": 100 },
    { "x": 160, "y": 180 }
  ]
}
```

## Contrato STOMP utilizado

- WebSocket: `${VITE_STOMP_BASE}/ws-blueprints`
- Publicacion: `/app/draw`
- Topic por plano: `/topic/blueprints.{author}.{name}`
- Payload publicado:

```json
{
  "author": "juan",
  "name": "plano-1",
  "point": { "x": 80, "y": 100 }
}
```

El backend debe recibir el punto, agregarlo al estado del plano y publicar la lista actualizada en el topic correspondiente. La suscripcion por autor y nombre evita mezclar planos diferentes.

## Pruebas y calidad

```bash
npm test
npm run lint
npm run build
```

La suite actual verifica:

- Listado por autor con query parameter.
- Endpoint y payload de `PUT`.
- Renderizado del panel del autor.
- Total de puntos.
- Accion Save/Update con todos los puntos actuales.

## Video de demostracion - maximo 90 segundos

El video presenta el funcionamiento de la aplicacion desarrollado por **Laura Castillo** y **Miguel Sandoval**. Se muestra el ingreso con el usuario `student` y la contrasena `student123`, seguido del flujo completo de gestion de planos: crear un plano, agregar puntos, guardar y actualizar la informacion, volver a visualizar los puntos guardados y eliminar un plano.

Tambien se demuestra la colaboracion en tiempo real mediante dos pestañas abiertas con el mismo autor y plano. Al agregar un punto en una pestaña, este se visualiza automaticamente en la otra.

**Enlace al video:**

[Ver video de demostracion](https://github.com/user-attachments/assets/60e5a65d-6ce8-436f-b5fa-88a67796f14f)

## Solucion de problemas

- **401 al iniciar sesion:** verifica `/auth/login`, las credenciales y que el JWT contenga `scope`.
- **No aparecen botones CRUD:** el token debe incluir `blueprints.write`.
- **Lista vacia:** revisa `GET /api/blueprints?author=...` y la respuesta del backend.
- **Canvas vacio:** revisa `GET /api/blueprints/:author/:name` y que la respuesta contenga `points`.
- **STOMP no conecta:** confirma `/ws-blueprints`, CORS para `http://localhost:5173` y los prefijos `/app` y `/topic`.
- **No hay colaboracion:** ambas pestañas deben usar exactamente el mismo autor, nombre y topic.
- **CORS:** en desarrollo permite el origen del frontend; en produccion restringe los origenes autorizados.

## Estructura principal

```text
src/
  App.jsx                         Pantalla, estado, CRUD y colaboracion
  styles.css                     Estilos responsive de la interfaz
  lib/
    apiClient.js                 Axios, base URL e interceptor JWT
    auth.js                      Login, logout y sesion almacenada
    blueprintsApi.js             Operaciones REST de BluePrints
    stompClient.js               Cliente STOMP y suscripciones
  App.test.jsx                   Pruebas del flujo visual y Update
  lib/blueprintsApi.test.js      Pruebas del contrato REST
  test/setup.js                  Configuracion de jsdom y canvas
```

## Decisiones tecnicas

Se eligio STOMP porque el backend Spring del laboratorio ya expone topics y permite aislar cada plano con una ruta determinista. El dibujo local se actualiza de inmediato y el punto se publica en `/app/draw`; el backend devuelve el estado actualizado a todos los clientes suscritos. El boton `Save / update` mantiene el CRUD REST explicito, mientras que la colaboracion en vivo queda desacoplada del guardado manual.

## Licencia

MIT, salvo que el equipo o el curso indique otra licencia.

## Autores y trabajo realizado

Proyecto desarrollado por **Laura Castillo** y **Miguel Sandoval**.

Durante el desarrollo se implementaron y verificaron las siguientes funcionalidades:

- Inicio de sesion con usuario, contrasena y autenticacion mediante JWT.
- Creacion de nuevos planos asociados a un autor.
- Dibujo de puntos directamente sobre el tablero.
- Guardado y actualizacion de todos los puntos de un plano mediante la API REST.
- Carga de los puntos guardados al seleccionar nuevamente un plano.
- Eliminacion de planos desde la interfaz.
- Visualizacion del total de puntos de cada plano y del total general del autor.
- Colaboracion en tiempo real mediante STOMP sobre WebSocket.
- Sincronizacion entre dos pestañas abiertas con el mismo autor y plano: cuando se agrega un punto en una pestaña, aparece automaticamente en la otra.
- Validacion de la aplicacion mediante pruebas del frontend y compilacion del backend.

