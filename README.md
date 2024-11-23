# User service

## Coverage

  ![Statements](https://img.shields.io/badge/statements-99.48%25-brightgreen.svg?style=flat)
  ![Branches](https://img.shields.io/badge/branches-89.82%25-yellow.svg?style=flat)
  ![Functions](https://img.shields.io/badge/functions-98.87%25-brightgreen.svg?style=flat)
  ![Lines](https://img.shields.io/badge/lines-99.46%25-brightgreen.svg?style=flat)


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
