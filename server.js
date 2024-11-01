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
*  Published URL: https://basado-lego-webapp-cld7-p3u833kcc-jorge-vivas-projects-b5e9873b.vercel.app/
*
********************************************************************************/


const express = require("express");
const path = require("path"); //config for the path review, vailidty and use then uncomment
const legoData = require("./modules/legoSets");

const app = express();
const PORT = process.env.PORT || 3000; // port by env var?
//const PORT = 3000;
app.set("view engine", "ejs");// ejs as the viewing engine


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
  res.render("home");
});

// Addtion to serve the About page (about.html)
app.get("/about", (req, res) => {
  res.render("about");
});





app.get('/lego/sets', (req, res) => {
  console.log('Received request for /lego/sets');
  const theme = req.query.theme;
  console.log('Theme query parameter:', theme);

  if (theme) {
    legoData.getSetsByTheme(theme)
      .then(sets => {
        console.log('Filtered sets by theme:', sets);
        if (sets.length > 0) {
          res.json(sets);
        } else {
          console.log(`No sets found for theme: ${theme}`);
          res.status(404).send({ message: `No sets found for theme: ${theme}` });
        }
      })
      .catch(err => {
        console.error('Error fetching sets by theme:', err);
        res.status(500).send({ message: 'Server error while fetching sets by theme' });
      });
  } else {
    legoData.getAllSets()
      .then(sets => {
        console.log('All sets:', sets);
        res.json(sets);
      })
      .catch(err => {
        console.error('Error fetching all sets:', err);
        res.status(500).send({ message: 'Server error while fetching all sets' });
      });
  }
});

app.get('/lego/sets/:id', (req, res) => {
  const setId = req.params.id;
  console.log('Received request for set ID:', setId);

  legoData.getSetByNum(setId)
    .then(set => {
      if (set) {
        console.log('Found set:', set);
        res.json(set);
      } else {
        console.log(`Set with ID: ${setId} not found`);
        res.status(404).send({ message: `Set with ID: ${setId} not found` });
      }
    })
    .catch(err => {
      console.error(`Error fetching set with ID ${setId}:`, err);
      res.status(500).send({ message: 'Server error while fetching the set' });
    });
});


// Addition serve the 404 page case
app.use((req, res) =>   res.status(404).render("404"));

//console.log(legoData.getAllSets());

// refisar si imprime los sets 
//hacer un componente embebido para hacer el display de la inof del json
//revisar como hacer debugging en estas instancias y como se sube una soluciona  vercel
