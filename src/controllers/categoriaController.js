import mongoose from "mongoose";
import Categoria from "../models/Categoria.js";
import Menu from "../models/Menu.js";

// Valida si un id de MongoDB tiene formato correcto.
const idValido = (id) => mongoose.isValidObjectId(id);

// Trae todas las categorias que aun no fueron eliminadas.
export const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find({ fecha_eliminado: null }).sort({ nombre: 1 });
    return res.status(200).json({ mensaje: "Consulta exitosa", categorias });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener las categorias", error: error.message });
  }
};

// Busca una categoria activa por su id.
export const getCategoriaById = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: "El ID de la categoria no es valido." });
    }

    const categoria = await Categoria.findOne({ _id: req.params.id, fecha_eliminado: null });
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoria no encontrada." });
    }

    return res.status(200).json({ mensaje: "Categoria encontrada.", categoria });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener la categoria", error: error.message });
  }
};

// Crea una nueva categoria con nombre obligatorio.
export const crearCategoria = async (req, res) => {
  try {
    const nombre = req.body.nombre?.trim();
    if (!nombre) {
      return res.status(400).json({ mensaje: "El campo nombre es obligatorio." });
    }

    const categoriaCreada = await Categoria.create({ nombre });
    return res.status(201).json({ mensaje: "Categoria creada con exito.", categoriaCreada });
  } catch (error) {
    const status = error.code === 11000 ? 409 : 500;
    return res.status(status).json({ mensaje: "Error al crear la categoria", error: error.message });
  }
};

// Actualiza el nombre de una categoria si el id existe.
export const actualizarCategoria = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: "El ID de la categoria no es valido." });
    }

    const nombre = req.body.nombre?.trim();
    if (!nombre) {
      return res.status(400).json({ mensaje: "El campo nombre es obligatorio." });
    }

    const categoria = await Categoria.findOne({ _id: req.params.id, fecha_eliminado: null });
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoria no encontrada." });
    }

    categoria.nombre = nombre;
    const categoriaActualizada = await categoria.save();
    return res.status(200).json({ mensaje: "Categoria actualizada con exito.", categoriaActualizada });
  } catch (error) {
    const status = error.code === 11000 ? 409 : 500;
    return res.status(status).json({ mensaje: "Error al actualizar la categoria", error: error.message });
  }
};

// Elimina la categoria de la base de datos y tambien borra los menus asociados.
export const eliminarCategoria = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: "El ID de la categoria no es valido." });
    }

    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoria no encontrada." });
    }

    // Eliminacion real en MongoDB para que el documento desaparezca completamente.
    await Menu.deleteMany({ categoria: categoria._id });
    await Categoria.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      mensaje: "Categoria eliminada con exito."
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al eliminar la categoria", error: error.message });
  }
};
