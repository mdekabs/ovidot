import { Schema, model } from 'mongoose';

// Define the schema for the Admin model
const AdminSchema = Schema({
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false
    }
});

// Create the Admin model using the schema
const Admin = model('Admin', AdminSchema);

// Export the Admin model
export default Admin;
