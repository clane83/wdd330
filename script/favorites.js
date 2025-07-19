const container = document.getElementById('favorites');

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

    container.innerHTML = "";

    if (favorites.length === 0) {
        container.innerHTML = "<p>No saved recipes yet.</p>";
        return;
    }

    favorites.forEach(recipe => {
        const div = document.createElement("div");
        div.className = "recipe-card";
        div.innerHTML = `
          <button class="remove-btn" title="Remove from favorites" data-id="${recipe.id}">⭐</button>
          <h2>${recipe.title}</h2>
          <img src="${recipe.image}" alt="${recipe.title}">
          <a href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g, "-")}-${recipe.id}" target="_blank">View Full Recipe</a>
        `;
        container.appendChild(div);
    });

    // Add event listeners for all remove buttons
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            removeFavorite(id);
        });
    });
}

function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
    favorites = favorites.filter(recipe => recipe.id !== id);
    localStorage.setItem("favoriteRecipes", JSON.stringify(favorites));
    loadFavorites(); // Refresh UI
}

// Initial load
loadFavorites();