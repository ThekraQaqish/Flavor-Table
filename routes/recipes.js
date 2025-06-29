// routes/recipes.js

const express = require('express');
const axios = require('axios');
const { pool } = require('../server');
const router = express.Router();
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Fetch random recipe from Spoonacular
router.get('/random', async (req, res) => {
  try {
    const url = `https://api.spoonacular.com/recipes/random?number=1&apiKey=${SPOONACULAR_API_KEY}`;
    const response = await axios.get(url);
    const recipe = response.data.recipes[0];

    // Insert into database
    await pool.query(
      `INSERT INTO recipes (title, image, instructions, ingredients, readyin)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        recipe.title,
        recipe.image,
        recipe.instructions || null,
        JSON.stringify(recipe.extendedIngredients.map(i => i.name)),
        recipe.readyInMinutes
      ]
    );

    res.json({
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions,
      ingredients: recipe.extendedIngredients.map(i => i.name),
      readyInMinutes: recipe.readyInMinutes
    });

  } catch (err) {
    console.error('Error fetching random recipe:', err.message);
    res.status(500).json({ error: 'Failed to fetch random recipe' });
  }
});

// Search recipes by ingredients
router.get('/search', async (req, res) => {
  const { ingredients } = req.query;
  if (!ingredients) return res.status(400).json({ error: 'Missing ingredients' });

  try {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&apiKey=${SPOONACULAR_API_KEY}`;
    const response = await axios.get(url);

    const simplified = response.data.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      usedIngredients: r.usedIngredients.map(i => i.name),
      missedIngredients: r.missedIngredients.map(i => i.name)
    }));

    res.json(simplified);

  } catch (err) {
    console.error('Error searching recipes:', err.message);
    res.status(500).json({ error: 'Failed to search for recipes' });
  }
});

// Get recipe details by ID
router.get('/recipe/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}`;
    const response = await axios.get(url);
    const recipe = response.data;

    // Save to DB
    await pool.query(
      `INSERT INTO recipes (title, image, instructions, ingredients, readyin)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        recipe.title,
        recipe.image,
        recipe.instructions || null,
        JSON.stringify(recipe.extendedIngredients.map(i => i.original)),
        recipe.readyInMinutes
      ]
    );

    res.json({
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions,
      ingredients: recipe.extendedIngredients.map(i => i.original),
      readyInMinutes: recipe.readyInMinutes
    });

  } catch (err) {
    console.error('Error fetching recipe details:', err.message);
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
});

module.exports = router;