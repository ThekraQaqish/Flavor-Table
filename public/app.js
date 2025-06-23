document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
        searchBtn.addEventListener('click', fetchRecipes);
    }

    const randomBtn = document.querySelector('[onclick="fetchRandomRecipe()"]');
    if (randomBtn) {
        fetchRandomRecipe();
    }

    const favoritesPage = document.getElementById('favorites-list');
    if (favoritesPage) {
        displayFavorites();
    }

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
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.some(fav => fav.title === title)) {
        favorites.push({ title, image });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${title} saved to favorites!`);
    } else {
        alert(`${title} is already in your favorites.`);
    }
}

function displayFavorites() {
    document.getElementById('favorites-list').innerHTML = '';
    const list = document.getElementById('favorites-list');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (favorites.length === 0) {
        list.innerHTML = '<p>No favorite recipes yet.</p>';
        return;
    }

    favorites.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <h3>${recipe.title}</h3>
            <img src="${recipe.image}" alt="${recipe.title}">
            <button onclick='removeFromFavorites("${recipe.title}")'>Remove</button>
        `;
        list.appendChild(card);
    });
}

function removeFromFavorites(title) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    const normalizedTitle = title.trim().toLowerCase();

    favorites = favorites.filter(fav => fav.title.trim().toLowerCase() !== normalizedTitle);

    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

function viewDetails(recipeId) {
    window.location.href = `/recipe-details.html?id=${recipeId}`;
}

async function fetchRecipeDetails(recipeId) {
    try {
        const response = await fetch(`/recipes/recipe/${recipeId}`);

        if (!response.ok) {
            throw new Error('can not get the data');
        }

        const recipe = await response.json();

        document.getElementById('recipe-title').textContent = recipe.title;
        document.getElementById('recipe-image').src = recipe.image;
        document.getElementById('recipe-summary').textContent = recipe.summary || " There is no summery";
        document.getElementById('recipe-cooking-time').textContent = recipe.readyInMinutes || "-";
        document.getElementById('recipe-instructions').textContent = recipe.instructions || "There is no instructions.";

        const ingredientsList = document.getElementById('recipe-ingredients');
        ingredientsList.innerHTML = '';
        (recipe.ingredients || []).forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });

    } catch (err) {
        console.error(err);
        alert("can not get the recipe details");
    }
}