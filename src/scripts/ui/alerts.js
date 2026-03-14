export function showAlert(type, message) {
  const container = document.getElementById("alerts");
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.textContent = message;

  container.innerHTML = "";
  container.appendChild(alert);
}
