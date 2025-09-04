// server/index.test.js
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
    try {
      const sql = fs.readFileSync(path.resolve(__dirname, "./db.sql"), "utf8");
      pool.query(sql, (err) => (err ? reject(err) : resolve()));
    } catch (e) {
      reject(e);
    }
  });


const insertUser = (user) =>
  new Promise((resolve, reject) => {
    hash(user.password, 10, (err, hashed) => {
      if (err) return reject(err);
      pool.query(
        "INSERT INTO account (email, password) VALUES ($1, $2) RETURNING *",
        [user.email, hashed],
        (e, result) => (e ? reject(e) : resolve(result.rows[0]))
      );
    });
  });

const signIn = async (user) => {
  const res = await fetch(`${BASE}/user/signin`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user }),
  });
  return { status: res.status, data: await res.json() };
};

const makeToken = (email) => jwt.sign({ email }, process.env.JWT_SECRET);
// --------------------------------------------------------------

describe("Testing basic database functionality (with auth)", () => {
  const user = { email: "foo2@test.com", password: "password123" };

  let token = null;
  let createdId = null;

  before(async () => {
    await resetDb();
    await insertUser(user);
    const { status, data } = await signIn(user);
    if (status === 200 && data?.token) {
      token = data.token;
    } else {
      token = makeToken(user.email);
    }
  });

  it("should log in", async () => {
    const { status, data } = await signIn(user);

    expect(status).to.equal(200);
    expect(data).to.include.all.keys(["id", "email", "token"]);
    expect(data.email).to.equal(user.email);
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
