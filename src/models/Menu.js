import mongoose from "mongoose";

// Este modelo guarda cada plato o item del menu.
// Cada item pertenece a una categoria y puede estar disponible o no.
const MenuSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del plato es obligatorio."],
      trim: true,
      unique: true,
    },
    precio: {
      type: Number,
      required: [true, "El precio del plato es obligatorio."],
      min: [0, "El precio no puede ser negativo."],
    },
    // Relacion con la categoria, por ejemplo: "Pizzas" o "Bebidas".
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categorias",
      required: [true, "La categoria del plato es obligatoria."],
    },
    // Si es true, el plato aparece para el cliente. Si es false, queda oculto.
    disponible: {
      type: Boolean,
      default: true,
    },
    // Fecha para borrar logico sin perder la referencia del registro.
    fecha_eliminado: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Menu = mongoose.model("menus", MenuSchema);

export default Menu;
