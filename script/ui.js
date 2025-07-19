card.innerHTML = `
  <h2>${recipe.title}</h2>
  <img src="${recipe.image}" alt="${recipe.title}">
  <p><strong>Used Ingredients:</strong> ${recipe.usedIngredientCount}</p>
  <p><strong>Missing Ingredients:</strong> ${recipe.missedIngredientCount}</p>
  <a href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g, "-")}-${recipe.id}" target="_blank">View Full Recipe</a><br><br>
  <button onclick="saveRecipe(${recipe.id}, '${recipe.title.replace(/'/g, "\\'")}', '${recipe.image}')">❤️ Save Recipe</button>
`;
