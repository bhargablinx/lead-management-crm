import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/connection.js";

const PORT = process.env.PORT;

connectDB()
    .then(() => {
        console.log("DB Connected!");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("FAILED CONNECTION!!", err);
        process.exit(1);
    })
