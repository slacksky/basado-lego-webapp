/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Jorge Luis Vivas Castellanos Student ID: 1126255291 Date: 06oct24
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/


const express = require("express");
const path = require("path"); //config for the path review, vailidty and use then uncomment
const legoData = require("./modules/legoSets");

const app = express();
const PORT = process.env.PORT || 3000; // port by env var?
//const PORT = 3000;


// Middleware to serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

legoData.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error(`Error initializing Lego data: ${err}`);
    process.exit(1);
  });


//app.get("/", (req, res) => res.send("Assignment 3: Jorge Luis Vivas Castellanos - 166802223"));

// Updated to serve the landing page (home.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

// Addtion to serve the About page (about.html)
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

// Addition serve the 404 page case
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});


// Route to manage Lego sets, filtered by "theme" query parameter (optional)
app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  
  if (theme) {
    // If theme is provided, return sets matching that theme
    legoData.getSetsByTheme(theme)
      .then(sets => {
        if (sets.length === 0) {
          return res.status(404).send(`No Lego sets found for theme: ${theme}`);
        }
        res.json(sets);
      })
      .catch(err => res.status(500).send(err));
  } else {
    // Return all Lego sets if no theme is provided
    legoData.getAllSets()
      .then(sets => res.json(sets))
      .catch(err => res.status(500).send(err));
  }
});

// Dynamic route to manage Lego sets by its "set_num"
app.get("/lego/sets/:set_num", (req, res) => {
  const setNum = req.params.set_num;

  legoData.getSetByNum(setNum)
    .then(set => {
      if (!set) {
        return res.status(404).send(`Lego set with set number ${setNum} not found`);
      }
      res.json(set);
    })
    .catch(err => res.status(500).send(err));
});


//old solution
// app.get("/lego/sets", (req, res) =>
//   legoData.getAllSets()
//     .then(sets => res.json(sets))
//     .catch(err => res.status(500).send(err))
// );

// app.get("/lego/sets/num-demo", (req, res) => {
//   const demoSetNum = "010423-1";
//   legoData.getSetByNum(demoSetNum)
//     .then(set => res.json(set))
//     .catch(err => res.status(404).send(err));
// });

// app.get("/lego/sets/theme-demo", (req, res) => {
//   const demoTheme = "Icons";
//   legoData.getSetsByTheme(demoTheme)
//     .then(sets => res.json(sets))
//     .catch(err => res.status(404).send(err));
// });

//console.log(legoData.getAllSets());