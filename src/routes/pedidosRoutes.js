import { Router } from "express";
import {
  getPedidos,
  getPedidoById,
  crearPedido,
  actualizarEstadoPedido,
  eliminarPedido,
} from "../controllers/pedidoController.js";

const pedidoRouter = Router();

// GET /api/pedidos -> listar todos los pedidos activos
pedidoRouter.get("/", getPedidos);

// GET /api/pedidos/:id -> buscar un pedido por id
pedidoRouter.get("/:id", getPedidoById);

// POST /api/pedidos -> crear un nuevo pedido
pedidoRouter.post("/", crearPedido);

// PUT /api/pedidos/estado/:id -> actualizar el estado de un pedido
pedidoRouter.put("/estado/:id", actualizarEstadoPedido);

// DELETE /api/pedidos/:id -> eliminar un pedido
pedidoRouter.delete("/:id", eliminarPedido);

export default pedidoRouter;
