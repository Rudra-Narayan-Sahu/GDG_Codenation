const express = require('express');
const { register, login, me, googleAuth, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const router = express.Router();

// Set up Multer storage for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, me); // Get current logged in user details
router.put('/profile', protect, upload.single('profile_image'), updateProfile); // Update user profile

module.exports = router;
