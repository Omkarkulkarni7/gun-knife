const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const weaponSchema = new Schema({
    location:
    {
        type: String,
    },
    name:
    {
        type: String,
    },
    time:
    {
        type: String,
    }
});

module.exports = mongoose.model('Weapon',weaponSchema)