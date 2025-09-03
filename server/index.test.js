// server/index.test.js
import { expect } from "chai";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./helper/db.js";

const BASE = "http://localhost:3001";
const __dirname = import.meta.dirname;

const resetDb = () =>
  new Promise((resolve, reject) => {
    const sql = fs.readFileSync(path.resolve(__dirname, "./db.sql"), "utf8");
    pool.query(sql, (err) => (err ? reject(err) : resolve()));
  });

const insertUser = (email, password) =>
  new Promise((resolve, reject) => {
    hash(password, 10, (err, hashed) => {
      if (err) return reject(err);
      pool.query(
        "INSERT INTO account (email, password) VALUES ($1, $2) RETURNING *",
        [email, hashed],
        (e, result) => (e ? reject(e) : resolve(result.rows[0]))
      );
    });
  });

const makeToken = (email) => jwt.sign({ email }, process.env.JWT_SECRET);


describe("Testing basic database functionality (with auth)", () => {
  let token = null;
  let createdId = null;

  before(async () => {
    await resetDb();

    const testUser = await insertUser("foo@test.com", "password123");
    token = makeToken(testUser.email);
  });

  it("should get all tasks", async () => {
    const response = await fetch(`${BASE}/`);
    const data = await response.json();

    expect(response.status).to.equal(200);
    expect(data).to.be.an("array").that.is.not.empty;
    expect(data[0]).to.include.all.keys(["id", "description"]);
  });

  it("should create a new task (auth required)", async () => {
    const newTask = { description: "Test task" };
    const response = await fetch(`${BASE}/create`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ task: newTask }),
    });
    const data = await response.json();

    expect(response.status).to.equal(201);
    expect(data).to.include.all.keys(["id", "description"]);
    expect(data.description).to.equal(newTask.description);
    createdId = data.id;
  });

  it("should delete task (auth required)", async () => {
    const response = await fetch(`${BASE}/delete/${createdId}`, {
      method: "delete",
      headers: { Authorization: token },
    });
    const data = await response.json();

    expect(response.status).to.equal(200);
    expect(data).to.include.all.keys("id");
    expect(Number(data.id)).to.equal(createdId);
  });

  it("should not create a new task without description (400)", async () => {
    const response = await fetch(`${BASE}/create`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ task: null }),
    });
    const data = await response.json();

    expect(response.status).to.equal(400);
    expect(data).to.have.property("error");
  });

  it("should reject protected endpoint without token (401)", async () => {
    const response = await fetch(`${BASE}/create`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: { description: "No token" } }),
    });
    const data = await response.json();

    expect(response.status).to.equal(401);
    expect(data).to.have.property("message");
  });
});
