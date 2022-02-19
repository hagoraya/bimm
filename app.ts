import express from "express";
import routes from "./routes";

const app = express();
const PORT = 3000;

//Start Express Server
app.use("/api", routes);
app.listen(PORT, () => {
  return console.log(`Server Started at http://localhost:${PORT}`);
});
