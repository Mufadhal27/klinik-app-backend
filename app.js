const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnect = require("./utils/dbConnect");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

dbConnect();

// Routes
app.use("/api/booking", require("./api/booking"));
app.use("/api/service", require("./api/service"));
app.use("/api/chat", require("./api/chat"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
