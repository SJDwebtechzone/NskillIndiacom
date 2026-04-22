const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getConfig,
  saveConfig,
  getModules,
} = require('../controllers/pretestAdminController');

// Modules
router.get('/modules', getModules);

// Questions
router.get('/:moduleId/questions', getQuestions);
router.get('/questions/:qId', getQuestionById);
router.post('/:moduleId/questions', addQuestion);
router.put('/questions/:qId', updateQuestion);
router.delete('/questions/:qId', deleteQuestion);

// Config
router.get('/:moduleId/config', getConfig);
router.post('/:moduleId/config', saveConfig);

module.exports = router;