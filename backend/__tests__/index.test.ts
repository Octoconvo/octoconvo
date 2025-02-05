import index from "../routes/index";
import request from "supertest";
import express from "express";

const app = express();
app.use("/", index);

test("index route works", (done) => {
  request(app)
    .get("/")
    .expect("Content-Type", /text\/html/)
    .expect("index")
    .expect(200, done);
});
