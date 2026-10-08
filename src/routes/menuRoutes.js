import { Router } from "express";
import {
  getMenus,
  getMenuById,
  crearMenu,
  actualizarMenu,
  actualizarDisponibilidad,
  eliminarMenu,
} from "../controllers/menuController.js";

const menuRouter = Router();

// GET /api/menus -> listar todos los menus activos
menuRouter.get("/", getMenus);

// GET /api/menus/:id -> buscar un menu por id
menuRouter.get("/:id", getMenuById);

// POST /api/menus -> crear un nuevo menu
menuRouter.post("/", crearMenu);

// PUT /api/menus/no-disponible/:id -> desactivar un menu
menuRouter.put("/no-disponible/:id", actualizarDisponibilidad(false));

// PUT /api/menus/disponible/:id -> reactivar un menu
menuRouter.put("/disponible/:id", actualizarDisponibilidad(true));

// PUT /api/menus/:id -> editar un menu por id
menuRouter.put("/:id", actualizarMenu);

// DELETE /api/menus/:id -> eliminar un menu
menuRouter.delete("/:id", eliminarMenu);

export default menuRouter;
