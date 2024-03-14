import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "pg123",
  port: 5432
});
db.connect();

let items = [];
let date = new Date();
let day = date.getDate();
let month = date.getMonth();
let year = date.getFullYear();
let currentDate = day + "-" + month + "-" + year;
let filterList = ['Today','Yesterday', 'All'];
let numberOfTimes = 0;
let dateToFetch;
const yesterday = () => {
  let d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
};

if(filterList[numberOfTimes] === 'Today'){
  dateToFetch = currentDate;
}else if(filterList[numberOfTimes] === 'Yesterday'){
  dateToFetch = yesterday().toISOString().split('T')[0];
}
app.get("/", async(req, res) => {
  items = [];
  if(filterList !== 'All'){
  const result = await db.query("SELECT * FROM items WHERE creation_date = $1",[dateToFetch]);
  result.rows.forEach((item) =>{
    items.push(item);
  });
  }else{
    const result = await db.query("SELECT * FROM items ORDER BY creation_date");
    result.rows.forEach((item) =>{
      items.push(item);
    });
  }
  res.render("index.ejs", {
    listTitle: filterList[numberOfTimes],
    listItems: items,
  });
  console.log(items);
  numberOfTimes++;
  if(numberOfTimes === filterList.length){
    numberOfTimes = 0;
  }
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  const type = req.body.newType;
  try {
    await db.query("INSERT INTO items (name,creation_date,type) VALUES ($1,$2,$3)",[item,currentDate,type]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async(req, res) => {
  try {
    await db.query("UPDATE items SET name = $1 WHERE id = $2",[req.body.updatedItemTitle,req.body.updatedItemId]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async(req, res) => {
try {
  await db.query("DELETE FROM items WHERE id = $1",[req.body.deleteItemId]);
  res.redirect("/");
} catch (error) {
  console.log(error);
}
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
