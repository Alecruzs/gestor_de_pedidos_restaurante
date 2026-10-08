import Categoria from "../models/Categoria.js";
import Menu from "../models/Menu.js";
import Pedido, { ESTADOS_PEDIDO } from "../models/Pedido.js";

const parseMensaje = (req, fallback = "") => req.query.mensaje || fallback;
const parseError = (req, fallback = "") => req.query.error || fallback;

export const renderHome = (req, res) => {
  res.render("home", {
    title: "Gestión de pedidos",
    mensaje: parseMensaje(req),
    error: parseError(req),
  });
};

export const renderCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find({ fecha_eliminado: null }).sort({ nombre: 1 });
    res.render("categorias/index", {
      title: "Categorías",
      categorias,
      mensaje: parseMensaje(req),
      error: parseError(req),
    });
  } catch (error) {
    res.render("categorias/index", {
      title: "Categorías",
      categorias: [],
      mensaje: "",
      error: error.message,
    });
  }
};

export const crearCategoriaVista = async (req, res) => {
  const nombre = req.body.nombre?.trim();

  if (!nombre) {
    return res.redirect("/categorias?error=El nombre de la categoría es obligatorio.");
  }

  try {
    await Categoria.create({ nombre });
    return res.redirect("/categorias?mensaje=Categoría creada correctamente.");
  } catch (error) {
    return res.redirect("/categorias?error=" + encodeURIComponent(error.message));
  }
};

export const renderCategoriaEditar = async (req, res) => {
  try {
    const categoria = await Categoria.findOne({ _id: req.params.id, fecha_eliminado: null });
    if (!categoria) {
      return res.redirect("/categorias?error=Categoría no encontrada.");
    }

    return res.render("categorias/editar", {
      title: "Editar categoría",
      categoria,
      mensaje: parseMensaje(req),
      error: parseError(req),
    });
  } catch (error) {
    return res.redirect("/categorias?error=" + encodeURIComponent(error.message));
  }
};

export const actualizarCategoriaVista = async (req, res) => {
  const nombre = req.body.nombre?.trim();

  if (!nombre) {
    return res.redirect("/categorias?error=El nombre no puede estar vacío.");
  }

  try {
    const categoria = await Categoria.findOne({ _id: req.params.id, fecha_eliminado: null });
    if (!categoria) {
      return res.redirect("/categorias?error=Categoría no encontrada.");
    }

    categoria.nombre = nombre;
    await categoria.save();
    return res.redirect("/categorias?mensaje=Categoría actualizada correctamente.");
  } catch (error) {
    return res.redirect("/categorias?error=" + encodeURIComponent(error.message));
  }
};

export const eliminarCategoriaVista = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.redirect("/categorias?error=Categoría no encontrada.");
    }

    await Menu.deleteMany({ categoria: categoria._id });
    await Categoria.findByIdAndDelete(req.params.id);

    return res.redirect("/categorias?mensaje=Categoría eliminada correctamente.");
  } catch (error) {
    return res.redirect("/categorias?error=" + encodeURIComponent(error.message));
  }
};

export const renderMenus = async (req, res) => {
  try {
    const categorias = await Categoria.find({ fecha_eliminado: null }).sort({ nombre: 1 });
    const menus = await Menu.find({ fecha_eliminado: null })
      .populate("categoria", "nombre")
      .sort({ nombre: 1 });

    res.render("menus/index", {
      title: "Menú",
      categorias,
      menus,
      mensaje: parseMensaje(req),
      error: parseError(req),
    });
  } catch (error) {
    res.render("menus/index", {
      title: "Menú",
      categorias: [],
      menus: [],
      mensaje: "",
      error: error.message,
    });
  }
};

export const crearMenuVista = async (req, res) => {
  const nombre = req.body.nombre?.trim();
  const precio = Number(req.body.precio);
  const categoria = req.body.categoria;

  if (!nombre) {
    return res.redirect("/menus?error=El nombre del plato es obligatorio.");
  }

  if (Number.isNaN(precio) || precio < 0) {
    return res.redirect("/menus?error=El precio debe ser un número válido y no negativo.");
  }

  try {
    const categoriaExiste = await Categoria.findOne({ _id: categoria, fecha_eliminado: null });
    if (!categoriaExiste) {
      return res.redirect("/menus?error=La categoría seleccionada no existe.");
    }

    await Menu.create({ nombre, precio, categoria });
    return res.redirect("/menus?mensaje=Plato agregado correctamente.");
  } catch (error) {
    return res.redirect("/menus?error=" + encodeURIComponent(error.message));
  }
};

export const renderMenuEditar = async (req, res) => {
  try {
    const menu = await Menu.findOne({ _id: req.params.id, fecha_eliminado: null }).populate("categoria", "nombre");
    const categorias = await Categoria.find({ fecha_eliminado: null }).sort({ nombre: 1 });

    if (!menu) {
      return res.redirect("/menus?error=Plato no encontrado.");
    }

    res.render("menus/editar", {
      title: "Editar plato",
      menu,
      categorias,
      mensaje: parseMensaje(req),
      error: parseError(req),
    });
  } catch (error) {
    return res.redirect("/menus?error=" + encodeURIComponent(error.message));
  }
};

export const actualizarMenuVista = async (req, res) => {
  const nombre = req.body.nombre?.trim();
  const precio = Number(req.body.precio);
  const categoria = req.body.categoria;

  try {
    const menu = await Menu.findOne({ _id: req.params.id, fecha_eliminado: null });
    if (!menu) {
      return res.redirect("/menus?error=Plato no encontrado.");
    }

    if (!nombre) {
      return res.redirect("/menus?error=El nombre del plato es obligatorio.");
    }

    if (Number.isNaN(precio) || precio < 0) {
      return res.redirect("/menus?error=El precio debe ser válido y no negativo.");
    }

    const categoriaExiste = await Categoria.findOne({ _id: categoria, fecha_eliminado: null });
    if (!categoriaExiste) {
      return res.redirect("/menus?error=La categoría seleccionada no existe.");
    }

    menu.nombre = nombre;
    menu.precio = precio;
    menu.categoria = categoria;
    await menu.save();

    return res.redirect("/menus?mensaje=Plato actualizado correctamente.");
  } catch (error) {
    return res.redirect("/menus?error=" + encodeURIComponent(error.message));
  }
};

export const cambiarDisponibilidadMenuVista = async (req, res) => {
  try {
    const menu = await Menu.findOne({ _id: req.params.id, fecha_eliminado: null });
    if (!menu) {
      return res.redirect("/menus?error=Plato no encontrado.");
    }

    menu.disponible = req.params.valor === "true";
    await menu.save();

    return res.redirect("/menus?mensaje=Disponibilidad actualizada correctamente.");
  } catch (error) {
    return res.redirect("/menus?error=" + encodeURIComponent(error.message));
  }
};

export const eliminarMenuVista = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.redirect("/menus?error=Plato no encontrado.");
    }

    await Menu.findByIdAndDelete(req.params.id);

    return res.redirect("/menus?mensaje=Plato eliminado correctamente.");
  } catch (error) {
    return res.redirect("/menus?error=" + encodeURIComponent(error.message));
  }
};

export const renderPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ fecha_eliminado: null })
      .populate("menus", "nombre precio disponible")
      .sort({ createdAt: -1 });

    const menus = await Menu.find({ fecha_eliminado: null, disponible: true }).sort({ nombre: 1 });

    res.render("pedidos/index", {
      title: "Pedidos",
      pedidos,
      menus,
      estados: ESTADOS_PEDIDO,
      mensaje: parseMensaje(req),
      error: parseError(req),
    });
  } catch (error) {
    res.render("pedidos/index", {
      title: "Pedidos",
      pedidos: [],
      menus: [],
      estados: ESTADOS_PEDIDO,
      mensaje: "",
      error: error.message,
    });
  }
};

export const crearPedidoVista = async (req, res) => {
  const menusRecibidos = Array.isArray(req.body.menus) ? req.body.menus : [req.body.menus].filter(Boolean);

  if (!menusRecibidos.length) {
    return res.redirect("/pedidos?error=Debes seleccionar al menos un plato.");
  }

  try {
    const idsUnicos = [...new Set(menusRecibidos.map((id) => String(id)))];
    const menuItems = await Menu.find({
      _id: { $in: idsUnicos },
      fecha_eliminado: null,
      disponible: true,
    });

    if (menuItems.length !== idsUnicos.length) {
      return res.redirect("/pedidos?error=Uno o más platos no existen o no están disponibles.");
    }

    const conteo = idsUnicos.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const total = menuItems.reduce(
      (sum, item) => sum + item.precio * (conteo[item._id.toString()] || 0),
      0
    );

    await Pedido.create({
      menus: idsUnicos,
      total,
      estado: "PENDIENTE",
      observaciones: req.body.observaciones?.trim() || "",
    });

    return res.redirect("/pedidos?mensaje=Pedido creado correctamente.");
  } catch (error) {
    return res.redirect("/pedidos?error=" + encodeURIComponent(error.message));
  }
};

export const actualizarEstadoPedidoVista = async (req, res) => {
  const estado = req.body.estado;

  if (!ESTADOS_PEDIDO.includes(estado)) {
    return res.redirect("/pedidos?error=Estado inválido.");
  }

  try {
    const pedido = await Pedido.findOne({ _id: req.params.id, fecha_eliminado: null });
    if (!pedido) {
      return res.redirect("/pedidos?error=Pedido no encontrado.");
    }

    pedido.estado = estado;
    await pedido.save();
    return res.redirect("/pedidos?mensaje=Estado actualizado correctamente.");
  } catch (error) {
    return res.redirect("/pedidos?error=" + encodeURIComponent(error.message));
  }
};

export const eliminarPedidoVista = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.redirect("/pedidos?error=Pedido no encontrado.");
    }

    await Pedido.findByIdAndDelete(req.params.id);

    return res.redirect("/pedidos?mensaje=Pedido eliminado correctamente.");
  } catch (error) {
    return res.redirect("/pedidos?error=" + encodeURIComponent(error.message));
  }
};
