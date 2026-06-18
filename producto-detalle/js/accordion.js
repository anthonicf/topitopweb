/**
 * ACCORDION CONTROLLER (UI Component Layer)
 * Clean Code Principle: DRY (Don't Repeat Yourself) & Reusability.
 * Exposes a single initialization function that binds slide toggle behavior to all accordion items
 * dynamically measuring scrollHeight to allow smooth CSS transitions.
 */

/**
 * Initializes the collapsible accordion panels.
 */
export function inicializarAcordeones() {
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  accordionHeaders.forEach(header => {
    // Avoid double bindings
    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);

    newHeader.addEventListener("click", () => {
      const item = newHeader.closest(".accordion-item");
      const content = item.querySelector(".accordion-content");
      const icon = newHeader.querySelector(".accordion-icon i");

      if (!item || !content) return;

      const isExpanded = item.classList.toggle("accordion-open");

      if (isExpanded) {
        content.style.maxHeight = `${content.scrollHeight}px`;
        if (icon) {
          icon.style.transform = "rotate(180deg)";
        }
      } else {
        content.style.maxHeight = "0px";
        if (icon) {
          icon.style.transform = "rotate(0deg)";
        }
      }
    });
  });
}
