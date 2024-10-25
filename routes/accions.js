import express from 'express';
const router = express.Router();
import { handleFeed } from '../mqttService.js';
import { handleSleep } from '../mqttService.js';
import { handleHeal } from '../mqttService.js';

router.post('/feed', (req, res) => {

    res.status(200).json({ message: 'Alimentar acción recibida', data: req.body });
    const data = req.body;

    handleFeed(data);
});

router.post('/sleep', (req, res) => {

    res.status(200).json({ message: 'Dormir acción recibida', data: req.body });
    const data = req.body;

    handleSleep(data);
});

router.post('/heal', (req, res) => {

    res.status(200).json({ message: 'Curar acción recibida', data: req.body });
    const data = req.body;

    handleHeal(data);
});

export default router;
