# User service

## Comandos de Docker

### Uso con Docker Compose

#### Levantar la app y la base de datos

```bash
docker-compose up --build -d
```

#### Ejecutar solo la Base de Datos

```bash
docker-compose up -d db
```

## Desarrollo en local

```bash
npm i
npm run dev
```

Dentro del npm run dev se levanta la base de datos con docker-compose y se ejecuta el servicio con nodemon en nuestro host.
