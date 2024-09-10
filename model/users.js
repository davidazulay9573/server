const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone : {
        type : Number,
        required : true
    },
    role : {
        type : String,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type : String,
        enum : ['pending', 'block', 'active' ],
        default :  'pending'
    }
});

const User = mongoose.model("User", userSchema);

module.exports = {User};
