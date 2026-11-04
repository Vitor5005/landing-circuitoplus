const FORM_ENDPOINT = "";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#evaluation-form");
  const status = document.querySelector("#form-status");

  if (!form || !status) {
    return;
  }

  const endpoint = getTrustedEndpoint(FORM_ENDPOINT);

  if (endpoint) {
    form.action = endpoint;
    form.method = "post";
    return;
  }

  status.textContent = "O envio ainda não está configurado. Informe um endereço válido do Google Apps Script para receber solicitações.";
  status.dataset.state = "warning";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "O envio não está disponível enquanto o endereço do formulário não for configurado.";
    status.dataset.state = "warning";
    status.focus?.();
  });
});

function getTrustedEndpoint(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return "";
  }

  try {
    const url = new URL(value.trim());
    const isGoogleAppsScript = url.hostname === "script.google.com" || url.hostname.endsWith(".script.google.com");

    if (url.protocol === "https:" && isGoogleAppsScript && url.pathname.endsWith("/exec")) {
      return url.href;
    }
  } catch (error) {
    // A configuração inválida é tratada pelo aviso acessível exibido no formulário.
  }

  return "";
}
