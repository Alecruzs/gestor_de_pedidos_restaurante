import mongoose from "mongoose";

// Este modelo representa una categoria dentro del restaurante.
// Ejemplo: "Pizzas", "Bebidas", "Hamburguesas".
const CategoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la categoria es obligatorio."],
      trim: true,
      unique: true,
    },
    // Fecha de eliminacion logica para no perder todo el historial.
    fecha_eliminado: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Categoria = mongoose.model("categorias", CategoriaSchema);

export default Categoria;
