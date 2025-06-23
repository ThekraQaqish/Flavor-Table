
const express = require('express');
const axios = require('axios');
const router = express.Router();
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;


router.get('/random', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/random?number=1&apiKey=${SPOONACULAR_API_KEY}`
        );
        const recipe = response.data.recipes[0];
        res.json({
            title: recipe.title,
            image: recipe.image,
            instructions: recipe.instructions,
            ingredients: recipe.extendedIngredients.map(i => i.name),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch random recipe' });
    }
});


router.get('/search', async (req, res) => {
    const { ingredients } = req.query;
    if (!ingredients) return res.status(400).json({ error: 'Missing ingredients' });

    try {
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&apiKey=${SPOONACULAR_API_KEY}`
        );

        const simplified = response.data.map(r => ({
            id: r.id,
            title: r.title,
            image: r.image,
            usedIngredients: r.usedIngredients.map(i => i.name),
            missedIngredients: r.missedIngredients.map(i => i.name)
        }));

        res.json(simplified);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search for recipes' });
    }
});


router.get('/recipe/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}`
        );

        const recipe = response.data;

        res.json({
            title: recipe.title,
            image: recipe.image,
            summary: recipe.summary,
            readyInMinutes: recipe.readyInMinutes,
            instructions: recipe.instructions,
            ingredients: recipe.extendedIngredients.map(i => i.original)
        });

    } catch (error) {
        console.error('Error fetching recipe details:', error.message);
        res.status(500).json({ error: 'Failed to fetch recipe details' });
    }
});

module.exports = router;