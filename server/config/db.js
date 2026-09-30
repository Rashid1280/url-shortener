const mongoose = require('mongoose');
async function connectDB() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected");
        
    } catch (error) {
        console.error("error connecting mongoDB: ", error);
        
    }
}
connectDB();