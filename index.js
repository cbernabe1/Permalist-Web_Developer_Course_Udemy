import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



let items = [];



app.get("/", async(req, res) => {
  items = [];
  const result = await db.query("SELECT * FROM items");
  result.rows.forEach((item) =>{
    items.push(item);
  });
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
  console.log(items);
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  items.push({ title: item });
  try {
    await db.query("INSERT INTO items (name) VALUES ($1)",[item]);
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
