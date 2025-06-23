const express = require('express');
const path = require('path');
const router = express.Router();


router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

router.get('/random', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'randomRecipes.html'));
});

router.get('/favorites', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'favorites.html'));
});

module.exports = router;