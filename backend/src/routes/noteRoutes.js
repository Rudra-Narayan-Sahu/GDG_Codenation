const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getNotes, createNote, deleteNote, getNoteById, updateNote } = require('../controllers/noteController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/notes');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Get all notes, open to logged-in users
router.get('/', protect, getNotes);

// Get a single note by ID
router.get('/:id', protect, getNoteById);

// Create a new note, restricted to admin, now handles file upload
router.post('/', protect, adminOnly, upload.single('note_file'), createNote);

// Update an existing note, restricted to admin, handles optional file upload
router.put('/:id', protect, adminOnly, upload.single('note_file'), updateNote);

// Delete a note, restricted to admin
router.delete('/:id', protect, adminOnly, deleteNote);

module.exports = router;
