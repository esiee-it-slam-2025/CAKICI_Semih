const API_BASE_URL = "http://127.0.0.1:8000/api";

async function loadEvents() {
  try {
    const response = await fetch(`${API_BASE_URL}/events/`);
    const data = await response.json();

    const eventsContainer = document.getElementById("eventsContainer");
    if (!eventsContainer) return;

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
  const buyButton = document.getElementById("buyTickets");

  modal.dataset.eventData = JSON.stringify(event);

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
  })} au ${event.stadium ? event.stadium.name : "Stade à confirmer"}`;

  buyButton.onclick = () => processTicketPurchase(event);
  modal.style.display = "block";
}

async function processTicketPurchase(event) {
  try {
    // Vérifier si l'utilisateur est connecté directement depuis l'état de l'interface
    const isLoggedIn =
      document.getElementById("authButton").getAttribute("data-logged-in") ===
      "true";

    if (!isLoggedIn) {
      // L'utilisateur n'est pas connecté, on ferme la modal et on redirige
      document.getElementById("ticketModal").style.display = "none";
      window.location.replace("register.html");
      return;
    }

    // Si on arrive ici, l'utilisateur est connecté selon le bouton d'authentification
    const selects = document.querySelectorAll(".ticket-options select");
    const tickets = [];

    selects.forEach((select) => {
      const quantity = parseInt(select.value);
      if (quantity > 0) {
        tickets.push({
          category: select.dataset.category,
          quantity: quantity,
        });
      }
    });

    if (tickets.length === 0) {
      alert("Veuillez sélectionner au moins un billet.");
      return;
    }

    const csrftoken = await getCSRFToken();
    const response = await fetch(`${API_BASE_URL}/tickets/buy/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      credentials: "include",
      body: JSON.stringify({
        event_id: event.id,
        tickets: tickets,
      }),
    });

    if (!response.ok) {
      // Si c'est un problème d'authentification (401, 403)
      if (response.status === 401 || response.status === 403) {
        document.getElementById("ticketModal").style.display = "none";
        window.location.replace("register.html");
        return;
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    alert("Vos billets ont été achetés avec succès !");
    window.location.href = "mesMatchs.html";
  } catch (error) {
    console.error("Erreur:", error);

    // Si l'erreur contient une indication que l'utilisateur n'est pas connecté
    if (
      error.message &&
      (error.message.includes("401") ||
        error.message.includes("403") ||
        error.message.includes("auth") ||
        error.message.includes("connect"))
    ) {
      document.getElementById("ticketModal").style.display = "none";
      window.location.replace("register.html");
    } else {
      alert("Une erreur est survenue lors de l'achat des billets.");
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const ticketsContainer = document.getElementById("ticketsContainer");

  if (!ticketsContainer) {
    console.log(
      "Page sans conteneur de tickets, chargement des tickets ignoré."
    );
    return;
  }
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
        <div class="no-tickets">
          <p>Aucun billet acheté pour le moment.</p>
          <a href="index.html" class="back-button">Voir les événements disponibles</a>
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
        </div>
        <div class="tickets-list">
          ${eventData.tickets
            .map(
              (ticket) => `
            <div class="ticket">
              <div class="ticket-info">
                <p class="ticket-category">Catégorie: ${ticket.category}</p>
                <p class="ticket-price">Prix: ${ticket.price}€</p>
                <p class="ticket-id">ID: ${ticket.id}</p>
              </div>
              <div class="ticket-qr">
                <img src="${ticket.qr_code_url}" alt="QR Code" class="qr-code">
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;

      ticketsContainer.appendChild(matchCard);
    });
  } catch (error) {
    console.error("Erreur:", error);
    ticketsContainer.innerHTML = `
      <div class="error-message">
        Une erreur est survenue lors du chargement des billets.
      </div>`;
  }
});

async function getCSRFToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token/`, {
      credentials: "include",
    });
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null;
  }
}

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

async function buyTickets(eventId) {
  const csrftoken = await getCSRFToken();
  if (!csrftoken) {
    alert("Unable to get CSRF token. Please try again.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/ticket/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      credentials: "include",
      body: JSON.stringify({
        event: eventId,
        tickets: selectedTickets,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    alert("Vos billets ont été achetés avec succès !");
    document.getElementById("ticketModal").style.display = "none";
  } catch (error) {
    console.error("Erreur lors de l'achat des billets:", error);
    alert("Une erreur est survenue lors de l'achat des billets.");
  }
}

// gstion de compte
document.addEventListener("DOMContentLoaded", async () => {
  const authButton = document.getElementById("authButton");
  const usernameDisplay = document.getElementById("usernameDisplay");

  async function checkAuthStatus() {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/", {
        credentials: "include",
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        try {
          const userData = await response.json();
          authButton.innerHTML =
            '<i class="fa-solid fa-right-from-bracket"></i>';
          authText.textContent = "Se déconnecter";
          usernameDisplay.textContent = `${userData.username}`;
          authButton.setAttribute("data-logged-in", "true");
        } catch (e) {
          console.warn("Réponse reçue mais pas au format JSON");
          setUnauthenticatedUI();
        }
      } else {
        setUnauthenticatedUI();
      }
    } catch (error) {
      console.error("Erreur de vérification de l'authentification:", error);
      setUnauthenticatedUI();
    }

    // Fonction auxiliaire pour définir l'interface utilisateur non authentifiée
    function setUnauthenticatedUI() {
      authButton.innerHTML = '<i class="fa-solid fa-user-group"></i>';
      authText.textContent = "Se connecter";
      usernameDisplay.textContent = "";
      authButton.setAttribute("data-logged-in", "false");
    }
  }

  await checkAuthStatus();

  authButton.addEventListener("click", async () => {
    const isLoggedIn = authButton.getAttribute("data-logged-in") === "true";

    if (isLoggedIn) {
      try {
        const response = await fetch(`${API_BASE_URL}/logout/`, {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          authButton.innerHTML = '<i class="fa-solid fa-user-group"></i>';
          authText.textContent = "Se connecter";
          usernameDisplay.textContent = "";
          authButton.setAttribute("data-logged-in", "false");
          window.location.reload();
        } else {
          alert("Erreur lors de la déconnexion");
        }
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
        alert("Une erreur est survenue lors de la déconnexion.");
      }
    } else {
      window.location.href = "register.html";
    }
  });
});
