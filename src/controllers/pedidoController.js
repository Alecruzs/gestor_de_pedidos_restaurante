import mongoose from "mongoose";
import Pedido, { ESTADOS_PEDIDO } from "../models/Pedido.js";
import Menu from "../models/Menu.js";

// Comprueba que el id del pedido o menu sea valido.
const idValido = (id) => mongoose.isValidObjectId(id);

// Funciona como una ayuda para poblar los menus dentro del pedido.
const pedidoConMenus = (query) => query.populate("menus", "nombre precio categoria disponible");

// Obtiene todos los pedidos activos ordenados del mas reciente al mas viejo.
export const getPedidos = async (req, res) => {
  try {
    const pedidos = await pedidoConMenus(Pedido.find({ fecha_eliminado: null }).sort({ createdAt: -1 }));
    return res.status(200).json({ mensaje: "Consulta exitosa", pedidos });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener los pedidos", error: error.message });
  }
};

// Busca un pedido por su id.
export const getPedidoById = async (req, res) => {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "El ID del pedido no es valido." });

    const pedido = await pedidoConMenus(Pedido.findOne({ _id: req.params.id, fecha_eliminado: null }));
    if (!pedido) return res.status(404).json({ mensaje: "Pedido no encontrado." });
    return res.status(200).json({ mensaje: "Pedido encontrado.", pedido });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener el pedido", error: error.message });
  }
};

// Crea un pedido validando que los menus existan, esten activos y disponibles.
export const crearPedido = async (req, res) => {
  try {
    const { menus, observaciones } = req.body;
    if (!Array.isArray(menus) || menus.length === 0) {
      return res.status(400).json({ mensaje: "El pedido debe contener menus (IDs de menu)." });
    }
    if (menus.some((id) => !idValido(id))) {
      return res.status(400).json({ mensaje: "Uno o mas IDs de menu no son validos." });
    }

    const uniqueMenuIds = [...new Set(menus.map((id) => id.toString()))];
    const menuItems = await Menu.find({
      _id: { $in: uniqueMenuIds },
      fecha_eliminado: null,
      disponible: true,
    });

    if (menuItems.length !== uniqueMenuIds.length) {
      return res.status(400).json({ mensaje: "Uno o mas menus no existen o no estan disponibles." });
    }

    const menuCounts = menus.reduce((acc, id) => {
      const key = id.toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const total = menuItems.reduce(
      (sum, menu) => sum + menu.precio * menuCounts[menu._id.toString()],
      0
    );

    const pedidoCreado = await Pedido.create({ menus, total, observaciones });
    const pedidoCompleto = await pedidoConMenus(Pedido.findById(pedidoCreado._id));
    return res.status(201).json({ mensaje: "Pedido creado con exito.", pedidoCreado: pedidoCompleto });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al crear el pedido", error: error.message });
  }
};

// Actualiza el estado del pedido, por ejemplo: pendiente, en preparacion, listo.
export const actualizarEstadoPedido = async (req, res) => {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "El ID del pedido no es valido." });

    const { estado } = req.body;
    if (!ESTADOS_PEDIDO.includes(estado)) {
      return res.status(400).json({ mensaje: `Estado invalido. Use uno de: ${ESTADOS_PEDIDO.join(", ")}` });
    }

    const pedidoActualizado = await Pedido.findOneAndUpdate(
      { _id: req.params.id, fecha_eliminado: null },
      { estado },
      { new: true, runValidators: true }
    );
    if (!pedidoActualizado) return res.status(404).json({ mensaje: "Pedido no encontrado." });
    return res.status(200).json({ mensaje: "Pedido actualizado con exito.", pedidoActualizado });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al actualizar el estado del pedido", error: error.message });
  }
};

// Elimina un pedido de la base de datos.
export const eliminarPedido = async (req, res) => {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "El ID del pedido no es valido." });

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ mensaje: "Pedido no encontrado." });

    await Pedido.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      mensaje: "Pedido eliminado con exito.",
      pedidoEliminado: {
        _id: pedido._id,
        estado: pedido.estado,
      },
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al eliminar el pedido", error: error.message });
  }
};
