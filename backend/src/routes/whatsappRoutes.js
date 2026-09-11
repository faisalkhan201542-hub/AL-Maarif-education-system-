import express from 'express';
import { getWhatsappStatus, startWhatsapp, logoutWhatsapp, sendWhatsappMessage } from '../controllers/whatsappController.js';

const router = express.Router();

router.get('/status', getWhatsappStatus);
router.post('/start', startWhatsapp);
router.post('/logout', logoutWhatsapp);
router.post('/send', sendWhatsappMessage);

export default router;
