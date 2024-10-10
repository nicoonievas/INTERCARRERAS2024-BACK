// routes.js
const express = require('express');
const router = express.Router();
const { pet, feedPet, waterPet } = require('./petLogic');
const { getDB } = require('./config');

// Obtener datos de la mascota
router.get('/pet', (req, res) => {
    res.status(200).json({ status: 'success', pet });
});

// Alimentar a la mascota
router.post('/pet/feed', (req, res) => {
    feedPet();
    res.status(200).json({ status: 'success', message: 'La mascota ha sido alimentada' });
});

// Dar agua a la mascota
router.post('/pet/water', (req, res) => {
    waterPet();
    res.status(200).json({ status: 'success', message: 'La mascota ha sido hidratada' });
});

// Obtener datos ambientales históricos
router.get('/environment', async (req, res) => {
    const db = getDB();
    const data = await db.collection('environmentalData').find().sort({ createdAt: -1 }).limit(10).toArray();
    res.status(200).json({ status: 'success', data });
});

module.exports = router;