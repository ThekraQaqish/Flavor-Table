

const express = require('express');
const router = express.Router();
const { pool } = require('../server');


router.get('/api', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM favorites');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching favorites:', err.message);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});


router.post('/', async (req, res) => {
  const { title, image } = req.body;

  if (!title || !image) {
    return res.status(400).json({ error: 'Title and image are required' });
  }

  try {
    const existing = await pool.query(
      'SELECT * FROM favorites WHERE title = $1 AND image = $2',
      [title, image]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This recipe is already in favorites' });
    }
    const result = await pool.query(
      'INSERT INTO favorites (title, image) VALUES ($1, $2) RETURNING *',
      [title, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving favorite:', err.message);
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM favorites WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting favorite:', err.message);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, image } = req.body;

  if (!title || !image) {
    return res.status(400).json({ error: 'Title and image are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE favorites SET title = $1, image = $2 WHERE id = $3 RETURNING *',
      [title, image, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating favorite:', err.message);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

module.exports = router;