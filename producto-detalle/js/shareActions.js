/**
 * SHARE ACTIONS CONTROLLER (UI Component / Integration Layer)
 * Clean Code Principle: SRP.
 * Manages click events for social media sharing links and clipboard copying
 * with visual toast feedback.
 */

import { ELEMENTS } from './domElements.js';

/**
 * Initializes click listeners for sharing options.
 */
export function inicializarAccionesCompartir() {
  const { shareFacebook, shareWhatsapp, shareCopyLink } = ELEMENTS;
  const urlActual = window.location.href;

  if (shareFacebook) {
    shareFacebook.addEventListener("click", (e) => {
      e.preventDefault();
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlActual)}`;
      window.open(fbUrl, "_blank", "noopener,noreferrer");
    });
  }

  if (shareWhatsapp) {
    shareWhatsapp.addEventListener("click", (e) => {
      e.preventDefault();
      const wsUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(urlActual)}`;
      window.open(wsUrl, "_blank", "noopener,noreferrer");
    });
  }

  if (shareCopyLink) {
    shareCopyLink.addEventListener("click", (e) => {
      e.preventDefault();
      copiarEnlace(urlActual);
    });
  }
}

/**
 * Copies the current page URL to the clipboard and shows a temporary feedback toast.
 * @param {string} url - The URL to copy.
 */
function copiarEnlace(url) {
  navigator.clipboard.writeText(url)
    .then(() => {
      mostrarToast("¡Enlace copiado!");
    })
    .catch((err) => {
      console.error("No se pudo copiar el enlace: ", err);
      mostrarToast("Error al copiar enlace", true);
    });
}

/**
 * Displays a temporary floating toast message on the screen.
 * @param {string} mensaje - The message text.
 * @param {boolean} isError - True if it's an error message.
 */
function mostrarToast(mensaje, isError = false) {
  // Check if a toast is already active to prevent stacking
  let toast = document.getElementById("share-toast-notification");
  if (toast) {
    toast.remove();
  }

  toast = document.createElement("div");
  toast.id = "share-toast-notification";
  toast.textContent = mensaje;
  
  // Inline styles for toast
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%) translateY(20px)",
    background: isError ? "#e11d48" : "#0f172a",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "30px",
    fontFamily: "var(--font-main, sans-serif)",
    fontSize: "0.9rem",
    fontWeight: "500",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    zIndex: "99999",
    opacity: "0",
    transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
    pointerEvents: "none"
  });

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(-50%) translateY(0)";
    toast.style.opacity = "1";
  });

  // Remove toast after 2 seconds
  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(20px)";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2000);
}
