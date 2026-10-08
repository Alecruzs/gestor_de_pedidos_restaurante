import { Router } from "express";
import {
  getCategorias,
  getCategoriaById,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../controllers/categoriaController.js";

const categoriaRouter = Router();

// GET /api/categorias -> listar todas las categorias activas
categoriaRouter.get("/", getCategorias);

// GET /api/categorias/:id -> buscar una categoria por su id
categoriaRouter.get("/:id", getCategoriaById);

// POST /api/categorias -> crear una nueva categoria
categoriaRouter.post("/", crearCategoria);

// PUT /api/categorias/:id -> actualizar una categoria por su id
categoriaRouter.put("/:id", actualizarCategoria);

// DELETE /api/categorias/:id -> eliminar una categoria
categoriaRouter.delete("/:id", eliminarCategoria);

export default categoriaRouter;
