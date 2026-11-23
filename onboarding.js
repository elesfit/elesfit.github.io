(() => {
  const names = {
    base: "ELESFIT Base",
    pro: "ELESFIT Pro",
    elite: "ELESFIT Élite",
  };

  const selector = document.getElementById("plan-select");
  const whatsappButton = document.getElementById("whatsapp-button");
  const whatsappNote = document.getElementById("whatsapp-note");
  const planIndicator = document.getElementById("plan-indicator");

  if (!selector || !whatsappButton) return;

  const urlPlan = new URLSearchParams(window.location.search).get("plan");
  const normalizedPlan = (urlPlan || "").trim().toLowerCase();
  if (Object.hasOwn(names, normalizedPlan)) {
    selector.value = normalizedPlan;
    if (planIndicator) {
      planIndicator.textContent = `El enlace indica el plan: ${names[normalizedPlan]}. Esto no confirma el pago.`;
      planIndicator.hidden = false;
    }
  }

  const updateWhatsAppLink = () => {
    const planName = names[selector.value] || "";
    const message = [
      "¡Hola! Acabo de contratar mi plan ELESFIT.",
      "",
      "Te comparto el comprobante de pago para que puedan identificar mi suscripción.",
      "",
      "Nombre completo:",
      `Plan contratado: ${planName}`,
      "",
      "¡Muchas gracias!",
    ].join("\n");

    whatsappButton.href = `https://wa.me/5491169128457?text=${encodeURIComponent(message)}`;
  };

  selector.addEventListener("change", updateWhatsAppLink);
  whatsappButton.addEventListener("click", (event) => {
    if (selector.value) return;
    event.preventDefault();
    selector.focus();
    if (whatsappNote) whatsappNote.textContent = "Primero seleccioná el plan que figura en tu contratación. Después se abrirá WhatsApp con el mensaje preparado.";
  });

  updateWhatsAppLink();
})();
