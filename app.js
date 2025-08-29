const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    fs.readdir(`./files`, (err, files) => {
        if(err) res.send(err);
        else res.render("index", {files});
    })
})

app.get('/create', (req, res) => {
    res.render('create');
});


app.post('/create', (req, res) => {
    // Get today's date
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    const filename = `${day}-${month}-${year}.txt`;
    const title = req.body.title || "Untitled";
    const content = req.body.content || "";

    const fullContent = `Title: ${title}\n\n${content}`;

    fs.writeFile(`./files/${filename}`, fullContent, (err) => {
        if (err) res.send('Something went wrong!');
        else res.redirect('/');
    });
});

// Show Edit Form (GET)
app.get('/edit/:filename', (req, res) => {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", (err, data) => {
        if (err) return res.send('Something went wrong!');

        // Extract title and content
        const lines = data.split('\n');
        const title = lines[0]?.replace("Title: ", "").trim();
        const content = lines.slice(2).join('\n'); // skip title and blank line

        res.render('edit', {
            filename: req.params.filename,
            title,
            content
        });
    });
});

// Handle Update (POST)
app.post('/update/:filename', (req, res) => {
    const { title, content } = req.body;

    const updatedData = `Title: ${title}\n\n${content}`;

    fs.writeFile(`./files/${req.params.filename}`, updatedData, (err) => {
        if (err) return res.send('Something went wrong!');
        res.redirect('/');
    });
});



app.get('/delete/:filename', (req, res) => {
    fs.unlink(`./files/${req.params.filename}`, function(err){
        if(err) res.send('Somthing went Wrong!!');
        else res.redirect('/');
    })
})

app.get('/read/:filename', (req, res) => {
    fs.readFile(`./files/${req.params.filename}`, 'utf-8', (err, data) => {
        if (err) {
            res.send('Something went wrong while reading the file!');
        } else {
            const lines = data.split('\n');
            const title = lines[0]?.replace("Title: ", "").trim();
            const content = lines.slice(2).join('\n');

            res.render('read', {
                filename: req.params.filename,
                title,
                content
            });
        }
    });
});



app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});