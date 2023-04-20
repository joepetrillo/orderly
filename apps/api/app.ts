import * as dotenv from "dotenv";
dotenv.config();
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { ClerkExpressRequireAuth, StrictAuthProp } from "@clerk/clerk-sdk-node";
import course from "./routes/course";
import enrolled from "./routes/enrolled";

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(ClerkExpressRequireAuth());

app.use("/course", course);
app.use("/enrolled", enrolled);

const authErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err.message === "Unauthenticated") {
    res.status(401).json({ error: "Unauthenticated!" });
  } else {
    next(err);
  }
};

app.use(authErrorHandler);

app.listen(port, () => {
  console.log(`✅ express server running on port ${port}`);
});
