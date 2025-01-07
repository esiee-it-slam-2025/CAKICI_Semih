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

      // Vérifie si l'une des équipes est indéterminée
      const isUndetermined = !event.team_home || !event.team_away;

      const card = document.createElement("div");
      card.className = `event-card ${isUndetermined ? "undetermined" : ""}`;

      card.innerHTML = `
          <div class="event-date">${formattedDate}</div>
          <div class="teams">
              <div class="team">
                  <div class="team-name">${
                    event.team_home ? event.team_home.name : "À déterminer"
                  }</div>
              </div>
              <div class="versus">VS</div>
              <div class="team">
                  <div class="team-name">${
                    event.team_away ? event.team_away.name : "À déterminer"
                  }</div>
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
