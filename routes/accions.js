import express from 'express';
const router = express.Router();
import { handleFeed } from '../mqttService.js';
import { handleSleep } from '../mqttService.js';
import { handleHeal } from '../mqttService.js';
import { handleVent } from '../mqttService.js';
import { handleRevive } from '../mqttService.js';

router.post('/feed', (req, res) => {

    res.status(200).json({ message: 'Alimentar acción recibida', data: req.body });
//    const data = req.body;

    handleFeed();
});

router.post('/sleep', (req, res) => {

    res.status(200).json({ message: 'Dormir acción recibida', data: req.body });
    const data = req.body;

    handleSleep();
});

router.post('/heal', (req, res) => {

    res.status(200).json({ message: 'Curar acción recibida', data: req.body });
    const data = req.body;

    handleHeal();
});

router.post('/vent', (req, res) => {
    res.status(200).json({ message: 'Ventilar acción recibida', data: req.body });
    const data = req.body;

    handleVent(data);
});

router.post('/revive', (req, res) => {
    res.status(200).json({ message: 'Revivir acción recibida', data: req.body });

    handleRevive();
});

export default router;
