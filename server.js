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
*  Published URL: https://basado-lego-webapp-cld7.vercel.app/
*
********************************************************************************/
const express = require("express");
const clientSessions = require("client-sessions");
const app = express();

app.set("view engine", "ejs");// ejs as the viewing engine

const PORT = process.env.PORT || 8181; 
const path = require("path"); //config for the path review, vailidty and use then uncomment

const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service"); // Add auth-service reference

app.set('views', path.join(__dirname, 'views'));


// Middleware to serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

app.use(clientSessions({
  cookieName: "session", // Name of the session cookie
  secret: "yourSecretKeyHere", // Replace with a secure random string
  duration: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  activeDuration: 1000 * 60 * 5 // Extend by 5 minutes if active
}));

app.use((req, res, next) => {
  res.locals.session = req.session; // Make session data accessible in views
  next();
});


legoData.initialize()
  .then(() => authData.initialize()) // Explicitly call authData.initialize
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(`Unable to start server: ${err}`);
    process.exit(1);
  });




//routes section

const ensureLogin = (req, res, next) => {
  if (!req.session.userName) { // Check if user is logged in
    res.redirect("/login"); // Redirect to login if not authenticated
  } else {
    next(); // User is authenticated, proceed
  }
};

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
app.get('/lego/addSet', ensureLogin, (req, res) => {
  legoData.getAllThemes()
    .then(themes => {
      res.render('addSet', { themes });
    })
    .catch(err => {
      res.status(500).render('error', { message: 'Error loading themes' });
    });
});

app.post('/lego/addSet',ensureLogin, (req, res) => {
  const { name, year, num_parts, img_url, theme_id, set_num } = req.body; // Extract form data
  
  legoData.createSet({
    name,
    year,
    num_parts,
    img_url,
    theme_id,
    set_num
  })
    .then(() => {
      res.redirect('/lego/sets'); // Redirect to the sets page after successful creation
    })
    .catch(err => {
      console.error('Error adding set:', err);
      res.status(500).render('error', { message: 'Error adding set' });
    });
});

//Edit Section reference 

app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {

  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();

    res.render("editSet", { set, themes });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }

});

app.post("/lego/editSet", ensureLogin, async (req, res) => {

  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

//delete section

app.get("/lego/deleteSet/:num", ensureLogin, (req, res) => {
  const setNum = req.params.num;

  legoData.deleteSet(setNum)
      .then(() => {
          res.redirect("/lego/sets"); // Redirect to the list of sets
      })
      .catch((err) => {
          res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
      });
});

// User Authentication Section
app.get("/register", (req, res) => {
  res.render("register"); // Render a registration form view
});

app.post("/register", (req, res) => {
  authData.registerUser(req.body) // Call the registerUser function from authData
    .then(() => {
      res.render("register", { successMessage: "User created" }); // Success message
    })
    .catch(err => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName // Return the username so the user doesn't have to re-enter it
      });
    });
});


// app.get("/login", (req, res) => {
//   res.render("login"); // Render a login form view
// });
app.get("/login", (req, res) => {
  res.render("login", { userName: '', errorMessage: '' }); // Initialize errorMessage as an empty string
});


app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent'); // Set the User-Agent in the request body

  authData.checkUser(req.body)
    .then(user => {
      req.session.user = { // Save user details in the session
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect("/lego/sets"); // Redirect to the Lego sets view
    })
    .catch(err => {
      res.render("login", {
        errorMessage: err,
        userName: req.body.userName // Return the username so the user doesn't have to re-enter it
      });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset(); // Reset the session
  res.redirect("/"); // Redirect to the home page
});


app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { user: req.session.user }); // Pass the session user to the view
});



// Handling of server errors (500)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).render('500', { message: "Infinte in mistery are the gift of the goddess and the source of this error." });
});


// Addition serve the 404 page case
app.use((req, res) => {
  res.status(404).render('404', { message: "I'm sorry to say the page is in Narnia" });
});

//console.log(legoData.getAllSets());

// refisar si imprime los sets 
//hacer un componente embebido para hacer el display de la inof del json
//revisar como hacer debugging en estas instancias y como se sube una soluciona  vercel