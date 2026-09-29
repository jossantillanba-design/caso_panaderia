document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.body.getAttribute("data-pagina");

  // Catálogo base de productos
  const catalogo = [
    { id: "pan", nombre: "Pan de masa madre", precio: 18 },
    { id: "alfajores", nombre: "Caja de alfajores", precio: 24 },
    { id: "torta", nombre: "Torta pequeña", precio: 45 }
  ];
  if (pagina === "pedido") {
    const form = document.getElementById("formPedido");
    const modalidad = document.getElementById("modalidad");
    const mensajeError = document.getElementById("mensajeError");
    const inputsCantidad = document.querySelectorAll(".cant-prod");

    function calcularPresupuesto() {
      let subtotal = 0;
      const seleccionados = [];

      catalogo.forEach(prod => {
        const input = document.getElementById(cant-${prod.id});
        const cant = parseInt(input.value, 10) || 0;

        if (cant >= 1 && cant <= 10) {
          const sub = cant * prod.precio;
          subtotal += sub;
          seleccionados.push({
            nombre: prod.nombre,
            cantidad: cant,
            subtotal: sub
          });
        }
      });

      const descuento = (subtotal >= 100) ? (subtotal * 0.10) : 0;
      // Regla: reparto añade S/ 8; retiro S/ 0
      const costoEnvio = (modalidad.value === "reparto") ? 8 : 0;
      const total = (subtotal - descuento) + costoEnvio;

      document.getElementById("lblSubtotal").textContent = S/ ${subtotal.toFixed(2)};
      document.getElementById("lblDescuento").textContent = - S/ ${descuento.toFixed(2)};
      document.getElementById("lblReparto").textContent = S/ ${costoEnvio.toFixed(2)};
      document.getElementById("lblTotal").textContent = S/ ${total.toFixed(2)};

      return { subtotal, descuento, costoEnvio, total, seleccionados };
    }

    inputsCantidad.forEach(input => {
      input.addEventListener("input", calcularPresupuesto);
      input.addEventListener("change", calcularPresupuesto);
    });
    modalidad.addEventListener("change", calcularPresupuesto);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      mensajeError.classList.add("d-none");

      const cliente = document.getElementById("cliente").value.trim();
      const email = document.getElementById("email").value.trim();
      const fecha = document.getElementById("fecha").value;
      const hoy = new Date().toISOString().split("T")[0];

      if (cliente.length < 3 || cliente.length > 60) {
        return error("El nombre debe tener entre 3 y 60 caracteres.");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return error("Ingrese un correo electrónico válido.");
      }

      if (!fecha || fecha < hoy) {
        return error("La fecha de entrega no puede ser anterior a hoy.");
      }

      for (const prod of catalogo) {
        const valStr = document.getElementById(cant-${prod.id}).value.trim();
        const num = Number(valStr);

        if (valStr !== "" && valStr !== "0") {
          if (!Number.isInteger(num) || num < 0 || num > 10 || valStr.includes(".")) {
            return error("Las cantidades deben ser números enteros entre 1 y 10.");
          }
        }
      }

      const { subtotal, descuento, costoEnvio, total, seleccionados } = calcularPresupuesto();
      if (seleccionados.length === 0) {
        return error("Debe ingresar una cantidad (entre 1 y 10) para al menos un producto.");
      }

      const pedido = {
        cliente,
        email,
        fecha,
        modalidad: modalidad.value === "reparto" ? "Reparto a domicilio (S/ 8.00)" : "Retiro en tienda (S/ 0.00)",
        productos: seleccionados,
        subtotal,
        descuento,
        reparto: costoEnvio,
        total
      };

      sessionStorage.setItem("pedidoTrigal", JSON.stringify(pedido));
      window.location.href = "resumen-pedido.html";
    });

    function error(msg) {
      mensajeError.textContent = msg;
      mensajeError.classList.remove("d-none");
    }

    document.getElementById("btnLimpiar").addEventListener("click", () => {
      form.reset();
      inputsCantidad.forEach(input => input.value = 0);
      calcularPresupuesto();
      mensajeError.classList.add("d-none");
      sessionStorage.removeItem("pedidoTrigal");
    });
  }

  if (pagina === "resumen") {
    const raw = sessionStorage.getItem("pedidoTrigal");
    const sinDatos = document.getElementById("sinDatos");
    const conDatos = document.getElementById("conDatos");

    if (!raw) {
      sinDatos.classList.remove("d-none");
    } else {
      const data = JSON.parse(raw);
      const listaTexto = data.productos.map(p => • ${p.nombre} x${p.cantidad}: S/ ${p.subtotal.toFixed(2)}).join("\n");

      document.getElementById("detalle").textContent = 
`Cliente:   ${data.cliente}
Correo:    ${data.email}
Fecha:     ${data.fecha}
Modalidad: ${data.modalidad}

PRODUCTOS:
${listaTexto}
---------------------------------
Subtotal:  S/ ${data.subtotal.toFixed(2)}
Descuento: - S/ ${data.descuento.toFixed(2)}
Reparto:   S/ ${data.reparto.toFixed(2)}
TOTAL:     S/ ${data.total.toFixed(2)}`;

      conDatos.classList.remove("d-none");
    }
  }
});