const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    name: String,
    age: Number,
    tone: String,
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
