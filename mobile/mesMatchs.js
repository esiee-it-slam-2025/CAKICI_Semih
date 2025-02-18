const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const ticketsContainer = document.getElementById("ticketsContainer");

  const qrModal = document.createElement("div");
  qrModal.id = "qr-modal";
  qrModal.className = "modal";
  qrModal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <div id="qr-modal-content" class="qr-modal-content"></div>
    </div>
  `;
  document.body.appendChild(qrModal);

  const modalContent = document.getElementById("qr-modal-content");
  const closeModalBtn = qrModal.querySelector(".close");

  function openQRModal(qrCanvas) {
    const largeQrCanvas = document.createElement("canvas");
    largeQrCanvas.width = 300;
    largeQrCanvas.height = 300;
    const ctx = largeQrCanvas.getContext("2d");
    ctx.drawImage(qrCanvas, 0, 0, 300, 300);

    modalContent.innerHTML = "";
    modalContent.appendChild(largeQrCanvas);
    qrModal.style.display = "flex";
  }

  closeModalBtn.addEventListener("click", () => {
    qrModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === qrModal) {
      qrModal.style.display = "none";
    }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/tickets/user/`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des billets");
    }

    const data = await response.json();

    if (data.events.length === 0) {
      ticketsContainer.innerHTML = `
        <div class="error-message">
        Vous n'avez pas acheté de billets
      </div>`;
      return;
    }

    data.events.forEach((eventData) => {
      const event = eventData.event;
      const eventDate = new Date(event.start);

      const matchCard = document.createElement("div");
      matchCard.className = "match-card";

      matchCard.innerHTML = `
        <div class="match-header">
          <h2>${event.team_home?.name || "À déterminer"} VS ${
        event.team_away?.name || "À déterminer"
      }</h2>
          <p class="match-date">${eventDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })} à ${eventDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}</p>
          <p class="match-location">${
            event.stadium?.name || "Stade à confirmer"
          }</p>
          <button class="details-button">
            <span class="chevron">▶</span> Afficher plus
          </button>
        </div>
        <div class="tickets-list details-hidden">
          ${eventData.tickets
            .map(
              (ticket) => `
            <div class="ticket">
              <div class="ticket-info">
                <p class="ticket-category">Catégorie: ${ticket.category}</p>
                <p class="ticket-price">Prix: ${ticket.price}€</p>
                
              </div>
              <canvas id="qr-${ticket.id}" class="qr-code clickable-qr"></canvas>
            </div>
          `
            )
            .join("")}
        </div>
      `;

      ticketsContainer.appendChild(matchCard);

      eventData.tickets.forEach((ticket) => {
        const qrCanvas = document.getElementById(`qr-${ticket.id}`);
        const qr = new QRious({
          element: qrCanvas,
          value: `Ticket ID: ${ticket.id}`,
          size: 100,
        });

        qrCanvas.addEventListener("click", () => {
          openQRModal(qrCanvas);
        });
      });

      const detailsButton = matchCard.querySelector(".details-button");
      const details = matchCard.querySelector(".tickets-list");
      const chevron = detailsButton.querySelector(".chevron");

      detailsButton.addEventListener("click", () => {
        details.classList.toggle("details-hidden");
        if (details.classList.contains("details-hidden")) {
          detailsButton.innerHTML = `<span class="chevron">▶</span> Afficher plus`;
        } else {
          detailsButton.innerHTML = `<span class="chevron">▼</span> Afficher moins`;
        }
      });
    });
  } catch (error) {
    console.error("Erreur:", error);
    ticketsContainer.innerHTML = `
      <div class="error-message">
        Vous n'avez pas acheté de billets
      </div>`;
  }
});
