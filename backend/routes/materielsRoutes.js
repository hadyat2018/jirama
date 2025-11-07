const express = require('express');
const router = express.Router();
const materielsController = require('../controllers/materielsController');

// Routes CRUD
router.get('/', materielsController.getAllMateriels);
router.get('/:id', materielsController.getMaterielById);
router.post('/', materielsController.createMateriel);
router.put('/:id', materielsController.updateMateriel);
router.delete('/:id', materielsController.deleteMateriel);

module.exports = router;
