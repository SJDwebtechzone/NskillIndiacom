const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all mail templates
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mail_templates ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching templates' });
    }
});

// GET a specific template
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM mail_templates WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching template' });
    }
});

// POST a new template
router.post('/', async (req, res) => {
    const { 
        name, subject, body, enable_reminder, reminder_frequency_days, 
        reminder_stop_condition, reminder_start_delay_days, attached_pdf, is_active 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO mail_templates (
                name, subject, body, enable_reminder, reminder_frequency_days, 
                reminder_stop_condition, reminder_start_delay_days, attached_pdf, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [name, subject, body, enable_reminder, reminder_frequency_days, reminder_stop_condition, reminder_start_delay_days, attached_pdf, is_active !== false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error creating template' });
    }
});

// PUT (update) an existing template
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        name, subject, body, enable_reminder, reminder_frequency_days, 
        reminder_stop_condition, reminder_start_delay_days, attached_pdf, is_active 
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE mail_templates SET 
                name = $1, subject = $2, body = $3, enable_reminder = $4, 
                reminder_frequency_days = $5, reminder_stop_condition = $6, 
                reminder_start_delay_days = $7, attached_pdf = $8, is_active = $9, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10 RETURNING *`,
            [name, subject, body, enable_reminder, reminder_frequency_days, reminder_stop_condition, reminder_start_delay_days, attached_pdf, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error updating template' });
    }
});

// DELETE a template
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM mail_templates WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error deleting template' });
    }
});

module.exports = router;
