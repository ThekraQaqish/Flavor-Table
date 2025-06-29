document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('recipe-details.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    if (recipeId) {
      fetchRecipeDetails(recipeId);
    } else {
      document.getElementById('recipe-title').textContent = "Invalid Recipe ID";
    }
  }

  if (path.includes('favorites.html')) {
    displayFavorites();
    setupUpdateForm();
  }

  if (path.includes('randomRecipes.html')) {
    fetchRandomRecipe();
  }

  if (path.includes('index.html') || path === '/') {
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
      searchBtn.addEventListener('click', fetchRecipes);
    }
  }
});

function fetchRecipes() {
  const ingredients = document.getElementById('search-input').value.trim();
  if (!ingredients) return alert("Please enter ingredients!");

  fetch(`/recipes/search?ingredients=${encodeURIComponent(ingredients)}`)
    .then(res => res.json())
    .then(recipes => {
      const container = document.getElementById('recipe-container');
      container.innerHTML = '';

      if (recipes.length === 0) {
        container.innerHTML = "<p>No recipes found.</p>";
        return;
      }

      recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.id = recipe.id;
        card.innerHTML = `
          <h3>${recipe.title}</h3>
          <img src="${recipe.image}" alt="${recipe.title}">
          <p><strong>Used:</strong> ${recipe.usedIngredients.join(', ')}</p>
          <p><strong>Missed:</strong> ${recipe.missedIngredients.join(', ')}</p>
          <button onclick='saveToFavorite("${recipe.title}", "${recipe.image}")'>Save to Favorites</button>
        `;
        container.appendChild(card);

        card.addEventListener('click', () => {
          window.location.href = `/recipe-details.html?id=${recipe.id}`;
        });
      });
    })
    .catch(err => {
      console.error(err);
      alert("Error fetching recipes!");
    });
}

function fetchRandomRecipe() {
  fetch('/recipes/random')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('random-recipe');
      container.innerHTML = `
        <h2>${data.title}</h2>
        <img src="${data.image}" alt="${data.title}">
        <h3>Instructions:</h3>
        <p>${data.instructions || "No instructions available."}</p>
        <h3>Ingredients:</h3>
        <ul>${data.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
      `;
    })
    .catch(err => {
      console.error(err);
      alert("Failed to load random recipe.");
    });
}

function saveToFavorite(title, image) {
  fetch('/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, image })
  })
    .then(res => {
      if (res.status === 409) {
        throw new Error("This recipe is already in favorites.");
      }
      return res.json();
    })
    .then(() => {
      alert(`${title} saved to favorites!`);
      displayFavorites();
    })
    .catch(err => {
      alert(err.message || "Failed to save to favorites.");
    });
}

async function displayFavorites() {
  try {
    const response = await fetch('/favorites/api');
    const favorites = await response.json();

    const container = document.getElementById('favorites-list');
    container.innerHTML = '';

    if (favorites.length === 0) {
      container.innerHTML = '<p>No favorite recipes yet.</p>';
      return;
    }

    favorites.forEach(fav => {
      const card = document.createElement('div');
      card.className = 'favorite-card';
      card.innerHTML = `
        <h3>${fav.title}</h3>
        <img src="${fav.image}" alt="${fav.title}" style="width:100px;">
        <button onclick="showUpdateForm(${fav.id}, '${fav.title}', '${fav.image}')">Update</button>
        <button onclick="removeFromFavorites(${fav.id})">Delete</button>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error('Failed to load favorites:', err);
  }
}

function removeFromFavorites(id) {
  fetch(`/favorites/${id}`, {
    method: 'DELETE'
  })
    .then(res => {
      if (!res.ok) throw new Error('Delete failed');
      displayFavorites();
    })
    .catch(err => {
      console.error('Error removing favorite:', err);
      alert('Failed to delete favorite');
    });
}

function showUpdateForm(id, title, image) {
  document.getElementById('updateForm').style.display = 'block';
  document.getElementById('update-id').value = id;
  document.getElementById('update-title').value = title;
  document.getElementById('update-image').value = image;
}

function setupUpdateForm() {
  const form = document.getElementById('updateForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log("Update form submitted");

    const id = document.getElementById('update-id').value;
    const title = document.getElementById('update-title').value;
    const image = document.getElementById('update-image').value;

    fetch(`/favorites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, image })
    })
      .then(res => {
        if (!res.ok) throw new Error("Update failed.");
        return res.json();
      })
      .then(() => {
        alert("Recipe updated successfully.");
        form.style.display = 'none';
        displayFavorites();
      })
      .catch(err => {
        console.error(err);
        alert(err.message || "Failed to update recipe.");
      });
  });
}

async function fetchRecipeDetails(recipeId) {
  try {
    const response = await fetch(`/recipes/recipe/${recipeId}`);
    if (!response.ok) throw new Error('Failed to load recipe details');

    const recipe = await response.json();

    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('recipe-image').src = recipe.image;
    document.getElementById('recipe-summary').textContent = recipe.summary || "No summary.";
    document.getElementById('recipe-cooking-time').textContent = recipe.readyInMinutes || "-";
    document.getElementById('recipe-instructions').textContent = recipe.instructions || "No instructions.";

    const ingredientsList = document.getElementById('recipe-ingredients');
    ingredientsList.innerHTML = '';
    (recipe.ingredients || []).forEach(ingredient => {
      const li = document.createElement('li');
      li.textContent = ingredient;
      ingredientsList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load recipe details");
  }
}
