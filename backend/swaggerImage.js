// swaggerCustom.js
document.addEventListener("DOMContentLoaded", function () {
  const image = document.createElement("img");
  image.src = "https://res.cloudinary.com/dxd3nmbag/image/upload/v1721142665/dashboard_legw7y.jpg"; // Your image URL
  image.alt = "Dashboard Image";
  image.style.width = "100%"; // Adjust the width as needed
  image.style.maxWidth = "800px"; // Optional: limit the maximum width
  image.style.margin = "20px auto";
  image.style.display = "block";

  const swaggerUiContainer = document.querySelector(".swagger-ui");
  if (swaggerUiContainer) {
    swaggerUiContainer.prepend(image); // Add the image at the top of the Swagger UI
  }
});
