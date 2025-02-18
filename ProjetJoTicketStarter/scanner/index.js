const video = document.getElementById("scanner-video");
const fileSelector = document.getElementById("file-selector");
const resultDiv = document.getElementById("result");
const restartButton = document.getElementById("restartScanner");

let isScannerActive = true;

const qrScanner = new QrScanner(
  video,
  (result) => {
    handleScanResult(result);
    qrScanner.stop();
    isScannerActive = false;
  },
  {
    highlightScanRegion: true,
    highlightCodeOutline: true,
    returnDetailedScanResult: true,
  }
);

qrScanner
  .start()
  .then(() => {
    console.log("Scanner démarré avec succès");
    displayResult(
      "Scanner actif",
      "Le scanner est prêt à lire un QR code.",
      true
    );
  })
  .catch((error) => {
    console.error("Erreur de démarrage du scanner:", error);
    displayResult(
      "Erreur",
      "Impossible d'accéder à la caméra. Veuillez vérifier les permissions.",
      false
    );
  });

restartButton.addEventListener("click", () => {
  if (isScannerActive) {
    qrScanner.stop();
    restartButton.textContent = "ON";
    isScannerActive = false;
  } else {
    qrScanner.start();
    restartButton.textContent = "OFF";
    isScannerActive = true;
  }
});

fileSelector.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  QrScanner.scanImage(file)
    .then((result) => {
      handleScanResult(result);
    })
    .catch((error) => {
      console.error("Erreur de scan du fichier:", error);
      displayResult(
        "Erreur",
        "Impossible de lire le QR code depuis cette image.",
        false
      );
    });
});

async function handleScanResult(result) {
  const scanData = result.data || result;

  try {
    const ticketId = scanData.replace("Ticket ID: ", "").trim();

    const response = await fetch(
      `http://127.0.0.1:8000/api/tickets/${ticketId}/`,
      {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Impossible de récupérer les détails du ticket");
    }

    const ticketDetails = await response.json();

    displayResult(
      "Billet Valide",
      `
          Événement: ${ticketDetails.event.name}
          Date: ${new Date(ticketDetails.event.start).toLocaleDateString()}
          Équipe Domicile: ${ticketDetails.event.team_home.name}
          Équipe Extérieure: ${ticketDetails.event.team_away.name}
          Stade: ${ticketDetails.event.stadium.name}
          Catégorie: ${ticketDetails.category}
          Prix: ${ticketDetails.price}€
        `,
      true
    );

    qrScanner.stop();
    isScannerActive = false;
    restartButton.textContent = "ON";
  } catch (error) {
    console.error("Erreur lors du traitement du ticket:", error);
    displayResult("Erreur", "⚠️ FAUX billet !", false);
    qrScanner.stop();
    isScannerActive = false;
    restartButton.textContent = "ON";
  }
}

function displayResult(title, message, isValid) {
  resultDiv.className = isValid ? "valid" : "invalid";
  resultDiv.innerHTML = `
      <h2>${title}</h2>
      <pre>${message}</pre>
    `;
}
