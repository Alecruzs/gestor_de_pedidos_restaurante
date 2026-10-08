import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import mongoose from "mongoose";
import categoriaRouter from "./routes/categoriasRoutes.js";
import menuRouter from "./routes/menuRoutes.js";
import pedidoRouter from "./routes/pedidosRoutes.js";
import viewRouter from "./routes/viewRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creamos la app de Express para levantar la API REST.
const app = express();

// Configuracion base del servidor.
const PORT = process.env.PORT || 3000;
const BASE_API_PATH = process.env.BASE_API_PATH || "/api/";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/restauranted";

// Permite leer JSON que llega desde Postman o desde el frontend.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Vistas MVC del proyecto.
app.use(viewRouter);

// Ruta de prueba para saber si la API responde.
app.get("/api-health", (req, res) => {
  res.json({ mensaje: "API de Restaurante v1.0 funcionando." });
});

// Se conectan las rutas de categorias, menu y pedidos a la API.
app.use(`${BASE_API_PATH}categorias`, categoriaRouter);
app.use(`${BASE_API_PATH}menus`, menuRouter);
app.use(`${BASE_API_PATH}pedidos`, pedidoRouter);

// Si alguien entra a una ruta que no existe, responderemos un 404 claro.
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada." });
});

// Middleware para manejar errores de validacion y de tipos de datos.
app.use((error, req, res, next) => {
  if (error.name === "CastError") {
    return res.status(400).json({ mensaje: "El ID proporcionado no es valido." });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      mensaje: "Los datos enviados no son validos.",
      errores: Object.values(error.errors).map((validationError) => validationError.message),
    });
  }

  return res.status(500).json({ mensaje: "Error interno del servidor." });
});

const startServer = (port, attemptsLeft = 10) => {
  const server = app.listen(port, () => {
    console.log(`Servidor ejecutandose en http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Puerto ${port} ocupado. Reintentando con ${nextPort}...`);
      return startServer(nextPort, attemptsLeft - 1);
    }

    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
  });
};

// Conectamos con MongoDB y levantamos el servidor cuando todo este listo.
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Conexion a MongoDB establecida correctamente.");
    startServer(Number(PORT) || 5001);
  })
  .catch((error) => {
    console.error("No se pudo conectar con MongoDB:", error.message);
    process.exit(1);
  });
