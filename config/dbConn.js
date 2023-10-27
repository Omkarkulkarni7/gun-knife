const mongoose = require("mongoose");

const connectDB = async ()=>{
    try
    {
        await mongoose.connect('put your mongo cluster url here',{
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
    }
    catch(err)
    {
        console.log(err);
    }
}

module.exports = connectDB