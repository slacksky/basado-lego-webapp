const express = require("express");
const legoData = require("./modules/legoSets");

const app = express();
const PORT = 3000;

legoData.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error(`Error initializing Lego data: ${err}`);
    process.exit(1);
  });

app.get("/", (req, res) => res.send("Assignment 2: Jorge Luis Vivas Castellanos - 166802223"));
//app.get("/", (req, res) => res.send("Assignment 2: Jorge Luis Vivas Castellanos - 166802223"));

app.get("/lego/sets", (req, res) =>
  legoData.getAllSets()
    .then(sets => res.json(sets))
    .catch(err => res.status(500).send(err))
);

app.get("/lego/sets/num-demo", (req, res) => {
  const demoSetNum = "010423-1";
  legoData.getSetByNum(demoSetNum)
    .then(set => res.json(set))
    .catch(err => res.status(404).send(err));
});

app.get("/lego/sets/theme-demo", (req, res) => {
  const demoTheme = "Icons";
  legoData.getSetsByTheme(demoTheme)
    .then(sets => res.json(sets))
    .catch(err => res.status(404).send(err));
});

console.log(legoData.getAllSets());