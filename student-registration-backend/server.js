const dotenv = require("dotenv");
const db = require("./config/db");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 5000;


const startServer = async () => {

    try {

        const connection = await db.getConnection();

        console.log("✅ Database Connected Successfully");

        connection.release();


        app.listen(PORT, () => {

            console.log(
                `🚀 Server running on http://localhost:${PORT}`
            );

        });


    } catch(error){

        console.log(error.message);

    }

};


startServer();