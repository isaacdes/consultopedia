    const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    user_email: {
        type: String,
        required: true,
    },
    counselor_email: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    counselour_name: {
        type:String,
    },
    user_name:{
        type:String,
    }
});

module.exports = mongoose.model("Bookings", bookingSchema);