import mongoose from "mongoose";
import Menu from "../models/Menu.js";
import Categoria from "../models/Categoria.js";

// Revisa si el id enviado es valido para MongoDB.
const idValido = (id) => mongoose.isValidObjectId(id);

// Busca una categoria valida para asociarla al menu.
const obtenerCategoria = async (id) => {
  if (!idValido(id)) return null;
  return Categoria.findOne({ _id: id, fecha_eliminado: null });
};

// Muestra todos los menus activos y con la categoria poblada.
export const getMenus = async (req, res) => {
  try {
    const menu = await Menu.find({ fecha_eliminado: null })
      .populate("categoria", "nombre")
      .sort({ nombre: 1 });
    return res.status(200).json({ mensaje: "Consulta exitosa", menu });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener el menu", error: error.message });
  }
};

// Busca un menu puntual por su id.
export const getMenuById = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: "El ID del menu no es valido." });
    }

    const item = await Menu.findOne({ _id: req.params.id, fecha_eliminado: null }).populate("categoria", "nombre");
    if (!item) {
      return res.status(404).json({ mensaje: "Menu no encontrado." });
    }
    return res.status(200).json({ mensaje: "Menu encontrado.", item });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener el item del menu", error: error.message });
  }
};

// Crea un menu validando nombre, precio y categoria.
export const crearMenu = async (req, res) => {
  try {
    const nombre = req.body.nombre?.trim();
    const { precio, categoria } = req.body;

    if (!nombre) return res.status(400).json({ mensaje: "El nombre es obligatorio." });
    if (precio === undefined || precio === null || Number.isNaN(Number(precio))) {
      return res.status(400).json({ mensaje: "El precio es obligatorio y debe ser numerico." });
    }
    if (Number(precio) < 0) return res.status(400).json({ mensaje: "El precio no puede ser negativo." });

    const categoriaExiste = await obtenerCategoria(categoria);
    if (!categoriaExiste) {
      return res.status(400).json({ mensaje: "La categoria proporcionada no existe." });
    }

    const nuevoItem = await Menu.create({ nombre, precio: Number(precio), categoria });
    return res.status(201).json({ mensaje: "Menu creado con exito.", nuevoItem });
  } catch (error) {
    const status = error.code === 11000 ? 409 : 500;
    return res.status(status).json({ mensaje: "Error al crear el item del menu", error: error.message });
  }
};

// Permite editar el nombre, precio o categoria del menu.
export const actualizarMenu = async (req, res) => {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "El ID del menu no es valido." });

    const menu = await Menu.findOne({ _id: req.params.id, fecha_eliminado: null });
    if (!menu) return res.status(404).json({ mensaje: "Item de menu no encontrado." });

    const { nombre, precio, categoria } = req.body;
    if (nombre !== undefined) {
      if (!nombre.trim()) return res.status(400).json({ mensaje: "El nombre no puede estar vacio." });
      menu.nombre = nombre.trim();
    }
    if (precio !== undefined) {
      if (Number.isNaN(Number(precio)) || Number(precio) < 0) {
        return res.status(400).json({ mensaje: "El precio debe ser un numero no negativo." });
      }
      menu.precio = Number(precio);
    }
    if (categoria !== undefined) {
      const categoriaExiste = await obtenerCategoria(categoria);
      if (!categoriaExiste) return res.status(400).json({ mensaje: "La categoria proporcionada no existe." });
      menu.categoria = categoria;
    }

    const menuActualizado = await menu.save();
    return res.status(200).json({ mensaje: "Menu actualizado con exito.", menuActualizado });
  } catch (error) {
    const status = error.code === 11000 ? 409 : 500;
    return res.status(status).json({ mensaje: "Error al actualizar el item del menu", error: error.message });
  }
};

// Cambia la disponibilidad del menu sin borrarlo por completo.
export const actualizarDisponibilidad = (disponible) => async (req, res) => {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "El ID del menu no es valido." });

    const menu = await Menu.findOne({ _id: req.params.id, fecha_eliminado: null });
    if (!menu) return res.status(404).json({ mensaje: "Item de menu no encontrado." });

    menu.disponible = disponible;
    const menuActualizado = await menu.save();
    return res.status(200).json({ mensaje: "Disponibilidad actualizada con exito.", menuActualizado });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al actualizar la disponibilidad del menu", error: error.message });
  }
};

// Elimina fisicamente el menu de la base de datos.
export const eliminarMenu = async (req, res) => {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "El ID del menu no es valido." });

    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ mensaje: "Menu no encontrado." });

    await Menu.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      mensaje: "Menu eliminado con exito."
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al eliminar el item del menu", error: error.message });
  }
};
