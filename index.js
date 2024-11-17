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

let the_countries = [];
let countries = null;
let total = null;
let country_list = null;
let countryListNameToCode = [];
function transformCountryList(countryList) {
    return Object.fromEntries(
        countryList.map(({ country_name, country_code }) => [
            country_name.toLowerCase(),
            country_code,
        ])
    );
}

db.connect();

db.query("SELECT country_code FROM visited_countries", (err, res) => {
    if (err) {
        console.error(err);
    } else {
        countries = res.rows;
        the_countries = countries;
        total = countries.length;
        const result = countries.map((item) => item.country_code).join(",");
        countries = result;
    }
    console.log(the_countries, countries, total);
});

db.query("SELECT country_code, country_name FROM countries", (err, res) => {
    if (err) {
        console.error(err);
    } else {
        country_list = res.rows;
        countryListNameToCode = transformCountryList(country_list);
    }
    // console.log(countryListNameToCode);
    db.end();
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(logger);

app.get("/", async (req, res) => {
    res.render("index", { total, countries });
});

app.post("/add", (req, res) => {
    const currentCountry = req.body.country.toLowerCase();
    console.log(currentCountry);
    const newCode = countryListNameToCode[currentCountry];
    console.log(newCode);
    // 나라를 발견하지 못했을 때의 예외처리도 필요함
    // 나라를 검색하지 못했는데도 불구하고 추가한 나라의 수가 증가함
    countries = [countries, newCode].join(",");
    total += 1;
    res.render("index", { total, countries });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port} 🚀`);
});
