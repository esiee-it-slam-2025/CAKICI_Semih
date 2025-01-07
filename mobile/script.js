document.addEventListener("DOMContentLoaded", () => {
  const eventsContainer = document.getElementById("events-container");

  const apiUrl = "http://127.0.0.1:8000/events";

  function displayTickets(events) {
    events.forEach((event) => {
      const teamHome = event.team_home ? event.team_home.name : "?";
      const teamAway = event.team_away ? event.team_away.name : "?";
      const stadium = event.stadium ? event.stadium.name : "?";

      const eventCard = `
          <div class="ticket-card">
            <h3>${event.start}</h3>
            <p><strong>Match :</strong> ${teamHome} vs ${teamAway}</p>
            <p><strong>Stade :</strong> ${stadium}</p>
          </div>
        `;

      eventsContainer.innerHTML += eventCard;
    });
  }

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      displayTickets(data.events);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des événements :", error);
      eventsContainer.innerHTML =
        "<p>Impossible de charger les tickets. Veuillez réessayer plus tard.</p>";
    });
});
