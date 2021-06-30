import app from "./server.js";
import dotenv from "dotenv";
dotenv.config();

// Port
const PORT = process.env.PORT || 5000;

// Listening to Request
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});