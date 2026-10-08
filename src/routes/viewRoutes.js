import { Router } from "express";
import {
  renderHome,
  renderCategorias,
  crearCategoriaVista,
  renderCategoriaEditar,
  actualizarCategoriaVista,
  eliminarCategoriaVista,
  renderMenus,
  crearMenuVista,
  renderMenuEditar,
  actualizarMenuVista,
  cambiarDisponibilidadMenuVista,
  eliminarMenuVista,
  renderPedidos,
  crearPedidoVista,
  actualizarEstadoPedidoVista,
  eliminarPedidoVista,
} from "../controllers/viewController.js";

const viewRouter = Router();

viewRouter.get("/", renderHome);

viewRouter.get("/categorias", renderCategorias);
viewRouter.post("/categorias", crearCategoriaVista);
viewRouter.get("/categorias/:id/editar", renderCategoriaEditar);
viewRouter.post("/categorias/:id/editar", actualizarCategoriaVista);
viewRouter.get("/categorias/:id/eliminar", eliminarCategoriaVista);

viewRouter.get("/menus", renderMenus);
viewRouter.post("/menus", crearMenuVista);
viewRouter.get("/menus/:id/editar", renderMenuEditar);
viewRouter.post("/menus/:id/editar", actualizarMenuVista);
viewRouter.get("/menus/:id/disponible/:valor", cambiarDisponibilidadMenuVista);
viewRouter.get("/menus/:id/eliminar", eliminarMenuVista);

viewRouter.get("/pedidos", renderPedidos);
viewRouter.post("/pedidos", crearPedidoVista);
viewRouter.post("/pedidos/:id/estado", actualizarEstadoPedidoVista);
viewRouter.get("/pedidos/:id/eliminar", eliminarPedidoVista);

export default viewRouter;
