const pool = require('../config/db');

// Get all notes (optionally filter by topic and search by title)
exports.getNotes = async (req, res) => {
    try {
        const { topic, search } = req.query;
        let query = 'SELECT * FROM notes WHERE 1=1';
        const queryParams = [];

        if (topic) {
            query += ' AND topic = ?';
            queryParams.push(topic);
        }

        if (search) {
            query += ' AND title LIKE ?';
            queryParams.push(`%${search}%`);
        }
        query += ' ORDER BY created_at DESC';

        const [notes] = await pool.query(query, queryParams);
        res.status(200).json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching notes' });
    }
};

// Get a single note by ID (Admin only)
exports.getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const [notes] = await pool.query('SELECT * FROM notes WHERE id = ?', [id]);
        
        if (notes.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        
        res.status(200).json(notes[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching note' });
    }
};

// Create a new note (Admin only)
exports.createNote = async (req, res) => {
    try {
        const { title, topic, content } = req.body;
        // The uploaded file is available at req.file
        const file_url = req.file ? `/uploads/notes/${req.file.filename}` : null;

        if (!title || !topic) {
            return res.status(400).json({ message: 'Please provide title and topic' });
        }

        const [result] = await pool.query(
            'INSERT INTO notes (title, topic, content, file_url) VALUES (?, ?, ?, ?)',
            [title, topic, content || '', file_url]
        );

        res.status(201).json({ 
            message: 'Note created successfully', 
            noteId: result.insertId,
            file_url
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating note' });
    }
};

// Update an existing note (Admin only)
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, topic, content } = req.body;
        
        if (!title || !topic) {
            return res.status(400).json({ message: 'Please provide title and topic' });
        }

        let query = 'UPDATE notes SET title = ?, topic = ?, content = ?';
        let queryParams = [title, topic, content || ''];

        // If a new file is uploaded, update the file_url
        if (req.file) {
            const file_url = `/uploads/notes/${req.file.filename}`;
            query += ', file_url = ?';
            queryParams.push(file_url);
        }

        query += ' WHERE id = ?';
        queryParams.push(id);

        const [result] = await pool.query(query, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json({ message: 'Note updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating note' });
    }
};

// Delete a note (Admin only)
exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM notes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting note' });
    }
};
