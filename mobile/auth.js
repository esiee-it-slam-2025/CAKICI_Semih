const API_BASE_URL = "http://127.0.0.1:8000/api";

async function register(username, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'inscription");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Identifiants incorrects");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getUserInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/user/`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Utilisateur non authentifié");

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function logout() {
  await fetch(`${API_BASE_URL}/logout/`, {
    method: "POST",
    credentials: "include",
  });
}
