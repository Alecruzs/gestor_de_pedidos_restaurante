document.addEventListener("DOMContentLoaded", () => {
  const redirectWithMessage = (path, message, isError = false) => {
    const key = isError ? "error" : "mensaje";
    const url = new URL(path, window.location.origin);
    url.searchParams.set(key, message);
    window.location.href = url.toString();
  };

  const setResultMessage = (targetSelector, message, type = "info") => {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    target.innerHTML = `<div class="notice ${type === "error" ? "error" : "success"}">${message}</div>`;
  };

  const renderList = (targetSelector, items, formatter) => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    if (!Array.isArray(items) || items.length === 0) {
      target.innerHTML = '<div class="notice">No hay resultados.</div>';
      return;
    }

    target.innerHTML = `<ul>${items.map(formatter).join("")}</ul>`;
  };

  const renderObject = (targetSelector, payload, labelFn) => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    target.innerHTML = `<div class="notice success">${labelFn(payload)}</div>`;
  };

  const handleResponse = async (response, successPath, successMessage, errorPath = successPath) => {
    let payload = {};
    try {
      payload = await response.json();
    } catch (error) {
      payload = {};
    }

    if (!response.ok) {
      redirectWithMessage(errorPath, payload.mensaje || payload.error || "No se pudo completar la operación.", true);
      return false;
    }

    redirectWithMessage(successPath, payload.mensaje || successMessage);
    return true;
  };

  document.querySelectorAll("form[data-api-endpoint]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const endpoint = form.dataset.apiEndpoint;
      const method = (form.dataset.method || "POST").toUpperCase();
      const successPath = form.dataset.successPath || window.location.pathname;

      const formData = new FormData(form);
      const body = Object.fromEntries(formData.entries());

      const multiSelect = form.querySelector('select[name="menus"][multiple]');
      if (multiSelect) {
        body.menus = Array.from(multiSelect.selectedOptions).map((option) => option.value);
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      await handleResponse(response, successPath, "Operación realizada con éxito.");
    });
  });

  document.querySelectorAll("a[data-api-endpoint]").forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();

      const endpoint = link.dataset.apiEndpoint;
      const method = (link.dataset.method || "DELETE").toUpperCase();
      const successPath = link.dataset.successPath || window.location.pathname;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
      });

      await handleResponse(response, successPath, "Operación realizada con éxito.");
    });
  });

  document.querySelectorAll("[data-fetch-list]").forEach((button) => {
    const loadList = async () => {
      const target = document.querySelector(button.dataset.target);
      if (!target) return;

      target.innerHTML = '<div class="notice">Cargando datos desde la API...</div>';

      try {
        const response = await fetch(button.dataset.fetchList);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.mensaje || "No se pudo obtener la información.");
        }

        const items = payload.categorias || payload.menu || payload.pedidos || [];

        if (button.dataset.fetchList.includes("/api/categorias")) {
          renderList(button.dataset.target, items, (item) => `<li><strong>${item.nombre}</strong> - ${item._id}</li>`);
        }

        if (button.dataset.fetchList.includes("/api/menus")) {
          renderList(button.dataset.target, items, (item) => `<li><strong>${item.nombre}</strong> - $${item.precio} - ${item.categoria?.nombre || "Sin categoría"}</li>`);
        }

        if (button.dataset.fetchList.includes("/api/pedidos")) {
          renderList(button.dataset.target, items, (item) => `<li><strong>Pedido ${item._id}</strong> - Total: $${item.total} - Estado: ${item.estado}</li>`);
        }
      } catch (error) {
        setResultMessage(button.dataset.target, error.message, "error");
      }
    };

    button.addEventListener("click", loadList);
    if (button.dataset.autoLoad === "true") loadList();
  });

  document.querySelectorAll("form[data-search-endpoint]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const endpoint = form.dataset.searchEndpoint;
      const idInput = form.querySelector("input[name='id']");
      const target = document.querySelector(form.dataset.resultTarget);
      if (!target || !idInput || !idInput.value.trim()) {
        setResultMessage(form.dataset.resultTarget, "Debes ingresar un ID válido.", "error");
        return;
      }

      const id = idInput.value.trim();
      target.innerHTML = '<div class="notice">Buscando...</div>';

      try {
        const response = await fetch(`${endpoint}/${id}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.mensaje || "No se encontró el recurso.");
        }

        if (endpoint.includes("/api/categorias")) {
          renderObject(form.dataset.resultTarget, payload.categoria || payload.item || payload, (value) => `${value.nombre} - ${value._id}`);
        }

        if (endpoint.includes("/api/menus")) {
          renderObject(form.dataset.resultTarget, payload.item || payload, (value) => `${value.nombre} - $${value.precio} - ${value.categoria?.nombre || "Sin categoría"}`);
        }

        if (endpoint.includes("/api/pedidos")) {
          renderObject(form.dataset.resultTarget, payload.pedido || payload, (value) => `Pedido ${value._id} - Total: $${value.total} - Estado: ${value.estado}`);
        }
      } catch (error) {
        setResultMessage(form.dataset.resultTarget, error.message, "error");
      }
    });
  });
});
