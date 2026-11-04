const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbz418pm7yE0a09JBGnEAVh2Lt4MZo1neWkBJujkkJ_6jp6BM6YdHN_JdPJuYryI_r8Y/exec";

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

document.addEventListener("DOMContentLoaded", () => {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (motionPreference.matches || !("IntersectionObserver" in window)) {
    return;
  }

  const reveal = (element) => {
    element.classList.add("is-revealed");
    observer.unobserve(element);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        reveal(entry.target);
      }
    });
  }, { rootMargin: "0px 0px 32px 0px", threshold: 0.05 });

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    if (element.getBoundingClientRect().top >= window.innerHeight) {
      observer.observe(element);
      element.classList.add("is-reveal-ready");
    }
  });

  document.addEventListener("focusin", (event) => {
    const element = event.target.closest(".is-reveal-ready");

    if (element) {
      reveal(element);
    }
  });

  motionPreference.addEventListener("change", (event) => {
    if (event.matches) {
      document.querySelectorAll(".is-reveal-ready").forEach(reveal);
      observer.disconnect();
    }
  });
});
