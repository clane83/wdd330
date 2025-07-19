const apiKey = '1d11cb62f780436ea35ab8da96e9a50f';
let lastResults = [];

document.getElementById('search').addEventListener('click', async () => {
    const ingredients = document.getElementById('ingredients').value.trim();
    const excludeInput = document.getElementById('exclude').value.trim().toLowerCase();
    const excludeList = excludeInput.split(',').map(item => item.trim()).filter(Boolean);

    if (!ingredients) return;

    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=10&ranking=1&apiKey=${apiKey}`;

    try {
        const res = await fetch(url);
        let data = await res.json();
        console.log("API response:", data);

        // Filter out recipes with any excluded ingredients, exclude drinks and must include at least 2 of the ingredients
        if (excludeList.length > 0) {
            data = data.filter(recipe => {
                const usesEnoughIngredients = recipe.usedIngredientCount >= 2;
                const isNotDrink = !recipe.title.toLowerCase().includes("drink") &&
                    !recipe.title.toLowerCase().includes("smoothie") &&
                    !recipe.title.toLowerCase().includes("cocktail") &&
                    !recipe.title.toLowerCase().includes("mojito") &&
                    !recipe.title.toLowerCase().includes("shake");
                return usesEnoughIngredients && isNotDrink;
            });
        }

        //cuisine cooking style filter
        const cuisineInput = document.getElementById('cuisine').value.trim().toLowerCase();

        if (cuisineInput) {
            const filteredData = [];

            for (let recipe of data) {
                // Get more details about the recipe to check its cuisine type
                const detailsUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?includeNutrition=false&apiKey=${apiKey}`;
                const res = await fetch(detailsUrl);
                const info = await res.json();

                const cuisines = (info.cuisines || []).map(c => c.toLowerCase());
                if (cuisines.includes(cuisineInput)) {
                    filteredData.push(recipe);
                }

                // Early stop if we already have a good list
                if (filteredData.length >= 10) break;
            }

            data = filteredData;
        }


        if (data.length === 0) {
            document.getElementById('recipe-container').innerHTML = "<p>No recipes found after exclusions.</p>";
            return;
        }

        lastResults = data;
        showRecipes(pickRecipes(data));
        document.getElementById('refresh').disabled = false;

    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById('recipe-container').innerHTML = `<p>Error loading recipes: ${error.message}</p>`;
    }
});



document.getElementById('refresh').addEventListener('click', () => {
    if (lastResults.length === 0) return;

    const newSet = pickRecipes(lastResults);
    showRecipes(newSet);
});

function pickRecipes(allRecipes) {
    // Randomly shuffle recipes
    const shuffled = [...allRecipes].sort(() => 0.5 - Math.random());
    const needed = 3;

    if (shuffled.length >= needed) {
        return shuffled.slice(0, needed);
    }

    // If fewer than 3 available, reuse previous ones to make up the difference
    const result = [...shuffled];
    while (result.length < needed && lastResults.length > 0) {
        const fallback = lastResults[Math.floor(Math.random() * lastResults.length)];
        if (!result.find(r => r.id === fallback.id)) {
            result.push(fallback);
        }
    }

    return result;
}

function showRecipes(recipes) {
    const container = document.getElementById('recipe-container');
    container.innerHTML = '';

    const favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

    recipes.forEach(recipe => {
        const isFavorite = favorites.some(fav => fav.id === recipe.id);

        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}">
      <p><strong>Used Ingredients:</strong> ${recipe.usedIngredientCount}</p>
      <p><strong>Missing Ingredients:</strong> ${recipe.missedIngredientCount}</p>
      <a href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g, "-")}-${recipe.id}" target="_blank">View Full Recipe</a><br><br>
      <button class="favorite-btn" data-id="${recipe.id}" data-title="${recipe.title}" data-img="${recipe.image}">
        ${isFavorite ? "⭐ Unfavorite" : "☆ Save to Favorites"}
      </button>
    `;
        container.appendChild(card);
    });

    // Attach event listeners AFTER rendering
    const favButtons = document.querySelectorAll(".favorite-btn");

    favButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            const title = btn.getAttribute("data-title");
            const image = btn.getAttribute("data-img");

            toggleFavorite(id, title, image);
            showRecipes(recipes); // Re-render to update star state
        });
    });
}


function saveRecipe(id, title, image) {
    const favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

    if (!favorites.find(r => r.id === id)) {
        favorites.push({ id, title, image });
        localStorage.setItem("favoriteRecipes", JSON.stringify(favorites));
        alert(`⭐ "${title}" has been added to your favorites!`);
    } else {
        alert(`"${title}" is already in your favorites.`);
    }
}

function toggleFavorite(id, title, image) {
    let favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

    const index = favorites.findIndex(r => r.id === id);

    if (index === -1) {
        // Add to favorites
        favorites.push({ id, title, image });
        alert(`⭐ "${title}" added to favorites!`);
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        alert(`☆ "${title}" removed from favorites.`);
    }

    localStorage.setItem("favoriteRecipes", JSON.stringify(favorites));
}

