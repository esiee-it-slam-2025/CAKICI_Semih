async function loadEvents() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/events/");
    const data = await response.json();

    const eventsContainer = document.getElementById("eventsContainer");
    eventsContainer.innerHTML = "";

    if (!data.events || data.events.length === 0) {
      eventsContainer.innerHTML = `
            <div style="text-align: center; color: #666; padding: 2rem;">
                Aucun événement disponible pour le moment.
            </div>
          `;
      return;
    }

    data.events.forEach((event) => {
      const date = new Date(event.start);
      const formattedDate = date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });

      const isUndetermined = !event.team_home || !event.team_away;

      const homeTeamContent = event.team_home
        ? `
              <img src="assets/flags/${event.team_home.name}.png" alt="${event.team_home.name}" class="flag" />
              <div class="team-name">${event.team_home.name}</div>
            `
        : `<div class="team-name">À déterminer</div>`;

      const awayTeamContent = event.team_away
        ? `
              <img src="assets/flags/${event.team_away.name}.png" alt="${event.team_away.name}" class="flag" />
              <div class="team-name">${event.team_away.name}</div>
            `
        : `<div class="team-name">À déterminer</div>`;

      const card = document.createElement("div");
      card.className = `event-card ${isUndetermined ? "undetermined" : ""}`;

      card.innerHTML = `
              <div class="event-date">${formattedDate}</div>
              <div class="teams">
                  <div class="team">
                      ${homeTeamContent}
                  </div>
                  <div class="versus">VS</div>
                  <div class="team">
                      ${awayTeamContent}
                  </div>
              </div>
              ${event.score ? `<div class="score">${event.score}</div>` : ""}
              ${
                event.winner
                  ? `<div class="winner">Vainqueur: ${event.winner.name}</div>`
                  : ""
              }
              <div class="stadium-info">
                  <i class="fas fa-map-marker-alt"></i> 
                  ${event.stadium ? event.stadium.name : "Stade à confirmer"}
              </div>
            `;

      card.addEventListener("click", () => openModal(event));

      eventsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des événements:", error);
    document.getElementById("eventsContainer").innerHTML = `
          <div style="text-align: center; color: red; padding: 2rem;">
              Une erreur est survenue lors du chargement des événements.
          </div>
        `;
  }
}

loadEvents();

function openModal(event) {
  const modal = document.getElementById("ticketModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");

  modalTitle.textContent = `Acheter des billets pour ${
    event.team_home ? event.team_home.name : "À déterminer"
  } VS ${event.team_away ? event.team_away.name : "À déterminer"}`;
  modalDescription.textContent = `Match prévu le ${new Date(
    event.start
  ).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })} au ${
    event.stadium ? event.stadium.name : "Stade à confirmer"
  }. Choisissez vos catégories de billets.`;

  modal.style.display = "block";
}

// Fonction pour ouvrir la modal
function openModal(event) {
  const modal = document.getElementById("ticketModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");

  modalTitle.textContent = `Acheter des billets pour ${
    event.team_home ? event.team_home.name : "À déterminer"
  } VS ${event.team_away ? event.team_away.name : "À déterminer"}`;
  modalDescription.textContent = `Match prévu le ${new Date(
    event.start
  ).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })} au ${
    event.stadium ? event.stadium.name : "Stade à confirmer"
  }. Choisissez vos catégories de billets.`;

  modal.style.display = "block";
}

// Fermeture de la modal au clic sur la croix
document.addEventListener("DOMContentLoaded", () => {
  const closeButton = document.querySelector(".close");
  const modal = document.getElementById("ticketModal");

  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

document.getElementById("buyTickets").addEventListener("click", async () => {
  const selectedTickets = [];
  document.querySelectorAll(".ticket-options select").forEach((select) => {
    const quantity = parseInt(select.value, 10);
    if (quantity > 0) {
      selectedTickets.push({
        event_id: currentEventId, // ID de l'événement en cours
        category: select.dataset.category,
        quantity: quantity,
      });
    }
  });

  if (selectedTickets.length === 0) {
    alert("Veuillez sélectionner au moins un billet.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/tickets/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Si tu utilises un token d'authentification
      },
      body: JSON.stringify({ tickets: selectedTickets }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Erreur : ${errorData.error}`);
      return;
    }

    alert("Vos billets ont été achetés avec succès !");
    document.getElementById("ticketModal").style.display = "none";
  } catch (error) {
    console.error("Erreur lors de l'achat des billets :", error);
    alert("Une erreur est survenue lors de l'achat des billets.");
  }
});

loadEvents();
