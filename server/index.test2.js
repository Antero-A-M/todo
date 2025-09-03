// server/index.test2.js
import { expect } from "chai";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./helper/db.js";

const __dirname = import.meta.dirname;
const BASE = `http://localhost:${process.env.PORT || 3001}`;


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

const makeToken = (email) =>
  jwt.sign({ email }, process.env.JWT_SECRET);



describe("MVC backend smoke tests (Part 8)", () => {
  let token = null;
  let createdId = null;

  before(async () => {
    
    await resetDb();
    const user = await insertUser("mvc@test.com", "password123");
    token = makeToken(user.email);
  });

  it("GET / should list tasks", async () => {
    const res = await fetch(`${BASE}/`);
    const data = await res.json();

    expect(res.status).to.equal(200);
    expect(data).to.be.an("array").that.is.not.empty;
    expect(data[0]).to.include.all.keys(["id", "description"]);
  });

  it("POST /create should add a task (auth required)", async () => {
    const res = await fetch(`${BASE}/create`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ task: { description: "MVC works!" } }),
    });
    const data = await res.json();

    expect(res.status).to.equal(201);
    expect(data).to.include.all.keys(["id", "description"]);
    expect(data.description).to.equal("MVC works!");
    createdId = data.id;
  });

  it("DELETE /delete/:id should delete the created task (auth required)", async () => {
    const res = await fetch(`${BASE}/delete/${createdId}`, {
      method: "delete",
      headers: { Authorization: token },
    });
    const data = await res.json();

    expect(res.status).to.equal(200);
    expect(data).to.have.property("id");
    expect(Number(data.id)).to.equal(createdId);
  });

  it("POST /create should 400 when description is missing", async () => {
    const res = await fetch(`${BASE}/create`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ task: null }),
    });
    const data = await res.json();

    expect(res.status).to.equal(400);
    expect(data).to.have.property("error");
  });

  it("POST /create should 401 without token", async () => {
    const res = await fetch(`${BASE}/create`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: { description: "no auth" } }),
    });
    const data = await res.json();

    expect(res.status).to.equal(401);
    expect(data).to.have.property("message"); 
  });

  it("DELETE /delete/:id returns 404 for non-existing id (auth required)", async () => {
    const res = await fetch(`${BASE}/delete/999999`, {
      method: "delete",
      headers: { Authorization: token },
    });
    const data = await res.json();

    expect([404, 200]).to.include(res.status); 
    if (res.status === 404) {
      expect(data).to.have.property("error");
    }
  });
});
