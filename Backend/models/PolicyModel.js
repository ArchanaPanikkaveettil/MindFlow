const mongoose = require('mongoose');
const { Schema } = mongoose;

const policySchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, default: new Date().toLocaleDateString('en-US') } // Simple string date for display
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
