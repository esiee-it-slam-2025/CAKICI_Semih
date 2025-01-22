document.addEventListener("DOMContentLoaded", () => {
  const ticketsContainer = document.getElementById("ticketsContainer");
  const tickets = JSON.parse(localStorage.getItem("tickets")) || [];

  if (tickets.length === 0) {
    ticketsContainer.innerHTML = `
      <div class="no-tickets">
        <p>Aucun billet acheté pour le moment.</p>
        <a href="index.html" class="back-button">Voir les événements disponibles</a>
      </div>`;
    return;
  }

  tickets.forEach((ticket) => {
    const ticketCard = document.createElement("div");
    ticketCard.className = "ticket-card";

    const eventDate = new Date(ticket.event.start);

    ticketCard.innerHTML = `
      <div class="ticket-header">
        <h3>${ticket.event.team_home?.name || "À déterminer"} VS ${
      ticket.event.team_away?.name || "À déterminer"
    }</h3>
        <span class="ticket-category ${ticket.category.toLowerCase()}">${
      ticket.category
    }</span>
      </div>
      <div class="ticket-details">
        <div class="ticket-info">
          <p>
            <strong>Date :</strong> ${eventDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p>
            <strong>Heure :</strong> ${eventDate.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>
            <strong>Stade :</strong> ${
              ticket.event.stadium?.name || "Stade à confirmer"
            }
          </p>
          <p>
            <strong>Catégorie :</strong> ${ticket.category}
          </p>
          <p>
            <strong>Quantité :</strong> ${ticket.quantity}
          </p>
          <p>
            <strong>Prix unitaire :</strong> ${ticket.price}€
          </p>
          <p>
            <strong>Prix total :</strong> ${ticket.price * ticket.quantity}€
          </p>
        </div>
      </div>
    `;

    ticketsContainer.appendChild(ticketCard);
  });
});
