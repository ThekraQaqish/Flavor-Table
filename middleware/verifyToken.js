const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = require('../db');
const { is } = require('express/lib/request');
require('dotenv').config();

function routeGuard(req, res, next) {
    const authHeader = req.headers["authorization"];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];
    const tokenFromQuery= req.query.token;
    const token =tokenFromHeader|| tokenFromQuery;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}
module.exports = routeGuard;