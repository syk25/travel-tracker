import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import pg from "pg";

const app = express();
const port = 3000;
const logger = morgan("dev");
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "1234",
    port: 5432,
});

db.connect();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(logger);

app.get("/", async (req, res) => {
    let total = null;
    await db.query(
        "SELECT country_code FROM visited_countries",
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal Server error");
            } else {
                total = result.rows.length;
                let countries = result.rows
                    .map((country) => country.country_code)
                    .join(",");
                res.render("index", { total, countries });
            }
        }
    );
});

app.post("/add", (req, res) => {
    res.render("index", { total, countries });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port} 🚀`);
});
