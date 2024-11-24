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




// Addition serve the 404 page case

app.use((req, res) => {

  res.status(404).render('404', { message: "I'm sorry to say the page is in Narnia" });

});


//console.log(legoData.getAllSets());


// refisar si imprime los sets 

//hacer un componente embebido para hacer el display de la inof del json

//revisar como hacer debugging en estas instancias y como se sube una soluciona  vercel