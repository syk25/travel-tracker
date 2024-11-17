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

let countries = null;
let total = 0;

app.get("/", async (req, res) => {
    await db.query(
        "SELECT country_code FROM visited_countries",
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal Server error");
            } else {
                total = result.rows.length;
                countries = result.rows
                    .map((country) => country.country_code)
                    .join(",");
                res.render("index", { total, countries });
            }
        }
    );
});

app.post("/add", async (req, res) => {
    const input = req.body.country;

    try {
        const result = await db.query(
            `select country_code from countries where Lower(country_name) like '%' || $1 || '%';`,
            [input.toLowerCase()] // SQL 인젝션 방지를 위해 파라미터화된 쿼리 사용
        );

        if (result.rows.length > 0) {
            const country_code = result.rows[0].country_code;

            await db.query(
                `INSERT INTO visited_countries(country_code) values($1)`,
                [country_code]
            );

            res.redirect("/");
        } else {
            let error = "Country does not exist, try again";
            res.render("index", { error, total, countries });
        }
    } catch (err) {
        let error = "Country has already been added. Try again.";
        res.render("index", { error, total, countries });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port} 🚀`);
});
