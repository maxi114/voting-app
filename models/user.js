const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    }
});

var Model = mongoose.model('User', UserSchema);
module.exports = Model;