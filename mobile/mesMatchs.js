document.addEventListener("DOMContentLoaded", () => {
  const ticketsContainer = document.getElementById("ticketsContainer");
  const tickets = JSON.parse(localStorage.getItem("tickets")) || [];

  if (tickets.length === 0) {
    ticketsContainer.innerHTML = `<p style="text-align: center; color: #666;">Aucun billet acheté pour le moment.</p>`;
    return;
  }

  tickets.forEach((ticket, index) => {
    const ticketCard = document.createElement("div");
    ticketCard.className = "ticket-card";
    ticketCard.innerHTML = `
      <p><strong>Catégorie :</strong> ${ticket.category}</p>
      <p><strong>Prix :</strong> ${ticket.price}€</p>
      <p><strong>Quantité :</strong> ${ticket.quantity}</p>
    `;
    ticketsContainer.appendChild(ticketCard);
  });
});
