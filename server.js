require('dotenv').config();
const express = require('express');
const cors = require('cors');
const recipesRouter = require('./routes/recipes');
const homeRouter = require('./routes/home');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.use('/recipes', recipesRouter);
app.use('/', homeRouter);


app.use('/recipes', recipesRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});