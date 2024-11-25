/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Jorge Luis Vivas Castellanos Student ID: 1126255291 Date: 11Nov24
*
*  Published URL: 
*
********************************************************************************/
const express = require("express");

const app = express();

app.set("view engine", "ejs");// ejs as the viewing engine

const PORT = process.env.PORT || 8181; 
const path = require("path"); //config for the path review, vailidty and use then uncomment

const legoData = require("./modules/legoSets");

app.set('views', path.join(__dirname, 'views'));


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
  const theme = req.query.theme;
  console.log('Theme query parameter:', theme);

  if (theme) {
    legoData.getSetsByTheme(theme)
      .then(sets => {
        if (sets.length > 0) {
          res.render('sets', { sets, theme });  // Pass both sets and theme to the view
        } else {
          res.status(404).render('404', { message: `No sets found for theme: ${theme}` });
        }
      })
      .catch(err => {
        res.status(500).render('error', { message: 'Server error while fetching sets by theme' });
      });
  } else {
    legoData.getAllSets()
      .then(sets => {
        res.render('sets', { sets, theme: '' });  // Pass theme as an empty string when no theme is selected
      })
      .catch(err => {
        res.status(500).render('error', { message: 'Server error while fetching all sets' });
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
        res.render("set", { set: set }); // Pass the set data to the set.ejs view
      } else {
        console.log(`Set with ID: ${setId} not found`);
        res.status(404).render('404', { message: `Set with ID: ${setId} not found` });
      }
    })
    .catch(err => {
      console.error(`Error fetching set with ID ${setId}:`, err);
      res.status(500).render('500', { message: 'Server error while fetching the set' });
    });
});

//addSet section
app.get('/lego/addSet', (req, res) => {
  legoData.getAllThemes()  
    .then(themes => {
      res.render('addSet', { themes });  
    })
    .catch(err => {
      res.status(500).render('error', { message: 'Error fetching themes' });
    });
});

// app.post('/lego/addSet', (req, res) => {

//   const { set_num, name, year, num_parts, img_url, theme_id } = req.body;

//   legoSets.createSet({ set_num, name, year, num_parts, img_url, theme_id })
//       .then(() => {
//           res.redirect('/lego/sets');
//       })
//       .catch((err) => {
//           res.render("500", { message: `I'm sorry, but we have encountered the following: ${err.message}` });
//       });
// });
app.post('/lego/addSet', (req, res) => {
  const { name, year, num_parts, img_url, theme_id, set_num } = req.body;

  // Check if all fields are provided
  if (!name || !year || !num_parts || !img_url || !theme_id || !set_num) {
    return res.status(400).render('error', { message: 'Please fill in all fields' });
  }

  // Create a new Lego set in the database
  legoData.addSet({
    name,
    year,
    num_parts,
    img_url,
    theme_id,
    set_num
  })
  .then(() => {
    res.redirect('/lego/sets');  // Redirect to the Lego sets page after adding
  })
  .catch(err => {
    res.status(500).render('error', { message: 'Error adding new set' });
  });
});




// Addition serve the 404 page case
app.use((req, res) => {
  res.status(404).render('404', { message: "I'm sorry to say the page is in Narnia" });
});

//console.log(legoData.getAllSets());

// refisar si imprime los sets 
//hacer un componente embebido para hacer el display de la inof del json
//revisar como hacer debugging en estas instancias y como se sube una soluciona  vercel