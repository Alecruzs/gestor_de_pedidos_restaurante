import mongoose from "mongoose";

// Estados posibles por los que puede pasar un pedido.
export const ESTADOS_PEDIDO = [
  "PENDIENTE",
  "EN_PREPARACION",
  "LISTO",
  "ENTREGADO",
  "CANCELADO",
];

// El pedido guarda varios menus, su total y su estado actual.
const PedidoSchema = new mongoose.Schema(
  {
    menus: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "menus",
        },
      ],
      required: [true, "El pedido debe contener al menos un menu."],
      validate: {
        validator: (menus) => menus.length > 0,
        message: "El pedido debe contener al menos un menu.",
      },
    },
    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    estado: {
      type: String,
      enum: ESTADOS_PEDIDO,
      default: "PENDIENTE",
      required: true,
    },
    observaciones: {
      type: String,
      trim: true,
    },
    // Borrado logico para no perder el registro del pedido.
    fecha_eliminado: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Pedido = mongoose.model("pedidos", PedidoSchema);

export default Pedido;
