
const express = require('express');
const app =express();
const router = express.Router();
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const pool = require('../db');
const routeGuard = require('../middleware/verifyToken');



router.get('/random', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'randomRecipes.html'));
});

router.get('/random/api',async (req, res) => {
  try {
  const response = await axios.get(`https://api.spoonacular.com/recipes/random?apiKey=${process.env.API_KEY}&number=1`)   
      res.json(response.data);
  } catch (error) {
    console.error(error);
  }
}
);


router.get('/search',(req,res)=>{
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
})

router.get('/search/api',async (req,res)=>{
  try {
    const query = req.query.ingredients;

    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        apiKey: process.env.API_KEY,
        number: 10,
        ingredients: query
      }

});
  res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching recipes');
  }
});

// router.get('/saveToFav/:id',async (req,res)=>{// يعالج الطلب اللي وصله من الفرونت
  
//   try {
//     const id = req.params.id;
//     const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.API_KEY}`);
//     await pool.query('INSERT INTO fav(id,title, image, instructions, ingredients) VALUES ($1, $2, $3,$4,$5)',[id,response.data.title,response.data.image,response.data.instructions || '',
//       response.data.extendedIngredients
//       ? response.data.extendedIngredients.map(ing => ing.original).join(', ')
//       : '']);
//     res.json(response.data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('Error fetching recipe');
//   }
// });
router.get('/details',(req,res)=>{
    res.sendFile(path.join(__dirname, '../public', 'recipe-details.html'));
})

router.get('/details/api/:id',async (req,res)=>{
  try {
    const id = req.params.id;
    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching recipe');
  }
});


router.get('/favorites', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'favorites.html'));
});


router.get('/favorites/all', async(req, res) => {
  try{
    const response = await pool.query('SELECT * FROM fav');
    if(!response){
      res.status(500).send('Error fetching recipes');
    }
    res.json(response.rows);
  }
  catch (error) {
    console.log(error);
  }
});

router.get('/favorites/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const response = await pool.query('SELECT * FROM fav WHERE id = $1', [id]);
    if (response.rows.length === 0) {
      return res.status(404).send('Recipe not found');
    }
    res.json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching recipe');
  }
});


router.get('/saveToFav/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await pool.query('SELECT id FROM fav WHERE id = $1', [id]);
    if (existing.rows.length > 0) {
      return res.status(200).json({ message: 'Recipe already in favorites' });
    }

    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.API_KEY}`);
    await pool.query(
      'INSERT INTO fav(id,title, image, instructions, ingredients) VALUES ($1, $2, $3,$4,$5)',
      [
        id,
        response.data.title,
        response.data.image,
        response.data.instructions || '',
        response.data.extendedIngredients
        ? JSON.stringify(response.data.extendedIngredients.map(ing => ing.original))
        : '[]'
    ]
    );
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching recipe');
  }
});



router.delete('/favorites/:id', async(req, res) => {
  try{
    const id = req.params.id;
    const response = await pool.query('DELETE FROM fav WHERE id=$1', [id]);
    if(!response){
      res.status(500).send('Error fetching recipes');
    }
    res.json({ success: true });
  }
  catch (error) {
    console.log(error);
  }
});

router.put('/favorites/:id', async(req, res) => {
  try{
    const id = req.params.id;
    const { title, instructions, ingredients } = req.body;
    let ingredientsStr = typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients);


    const response = await pool.query(`UPDATE fav SET title=$1, instructions=$2, ingredients=$3 WHERE id=$4`, [title,instructions,ingredientsStr, id]);

    if(!response){
      res.status(500).send('Error updating recipe');
    }
    res.json({ success: true });
  }
  catch (error) {
    console.log(error);
  }
});




module.exports = router;
