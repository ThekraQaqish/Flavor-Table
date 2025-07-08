const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = require('../db');
const { is } = require('express/lib/request');
require('dotenv').config();
const routeGuard = require('../middleware/verifyToken');



router.get('/profile', routeGuard, async (req, res) => {
    try {
        const userId = req.user.id;

        const response = await pool.query(
            'SELECT username, email FROM users WHERE id = $1',
            [userId]
        );

        if (response.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(response.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.post('/register',async(req,res)=>{
    const {username, password}= req.body;

    try {
        const hashedpassword= await bcrypt.hash(password,10);
        const response =await pool.query(
        'INSERT INTO users(username, password) VALUES ($1, $2) RETURNING id, username',
        [username, hashedpassword]
        );
        res.status(200).json(response.rows[0]);
    } catch (error) {
        console.log(error);
        if(error.code==="23505"){
            res.status(409).send('Username already exists');
        }
        res.status(500).send('Server Error');

    }
})

router.post('/login',async(req,res)=>{
    const {username, password}= req.body;
    try {
        const response =await pool.query(
        'SELECT * FROM users WHERE username=$1',
        [username]
        );
        const user = response.rows[0];
        const isMatched =await bcrypt.compare(password,user.password);
        if(!isMatched){
            res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET, {expiresIn: '3h'});
        res.status(200).json({token: token});
    } catch (error) {
        console.log(error);
        if(error.code==="23505"){
            res.status(409).send('Username already exists');
        }
        res.status(500).send('Server Error');

    }
})














module.exports=router;