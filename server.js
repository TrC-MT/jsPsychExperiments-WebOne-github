const express = require('express');
const app = express();
const port = process.env.PORT || 3285;
const fs = require('fs');
const jsonfile = require('jsonfile');

app.use(express.urlencoded({urlencoded:false}));
app.use(express.json());
let dir = `${__dirname}`;
let file_path = `${dir}/frontend`;
app.use('/frontend', express.static(file_path));

const file_path_users = `${dir}/Users.json`;

let user_authenticated = false;

app.get('/', (req, res) => {
    if(user_authenticated == true){
        console.log('User authenticated.')
    }
    else{
        console.log('User not authenticated.');
        let dir = `${__dirname}`;
        let file_path = `${dir}/frontend/pages/index.html`;
        res.sendFile(file_path);
    }
});

app.post('/new-user', (req, res) => {
    const user_email = req.body.email;
    const user_username = req.body.username;
    const user_password = req.body.password;
    let user_count = 0;

    //Eventually add code to make sure the forms aren't blank

    let data = jsonfile.readFileSync(file_path_users); //Read the Users.json
    let users_array = data.users;
    users_array.forEach(user => { //For each user in the object
        user_count += 1;
        //Eventually add code to make sure the same email can't have multiple accounts
    });

    let new_user = {
        "ID": `${user_count}`,
        "email": `${user_email}`,
        "username": `${user_username}`,
        "password": `${user_password}`
    }; //Place those values into the new_user string object

    console.log(`Add = Email: ${user_email} Username: ${user_username} Password: ${user_password} ID: ${user_count}`)

    data.users[user_count] = new_user; //Place the new_user into the next index of the users_array

    jsonfile.writeFileSync(file_path_users, data, {spaces: 2}) //Write the new object to Users.json
    console.log('User added successfully.')
    res.redirect('/')
})
app.post('/login', (req, res) => {
    const user_name = req.body.username;
    const password = req.body.password;
    console.log(`Login = Username: ${user_name} Password: ${password}`)

    let data = jsonfile.readFileSync(file_path_users); //Read the Users.json
    let users_array = data.users;

    for(var i = 0; i < users_array.length; i++){ //For each user in the object
        var user = users_array[i];
        if(user.username === user_name && user.password === password){
            user_authenticated = true;
            break; // End the for loop.
        }
    }

    if(user_authenticated === true){
        let dir = `${__dirname}`;
        let file_path = `${dir}/frontend/pages/experimentList.html`;
        res.sendFile(file_path);
    }
    else{
        res.redirect('/');
    }

})


app.post('/experiment', (req, res) =>{
    if(user_authenticated === true){
        const experiment_name = req.body.experimentName;
        console.log('experimentName: ', experiment_name)
        try {

            let dir = `${__dirname}`;
            let file_path = `${dir}/frontend/pages/experiments/${experiment_name}/experiment/index.html`;

            let data = fs.readFileSync(file_path, 'utf8');
            // console.log('Old index: ')
            // console.log(data)

            // ONLY WORKS WITH STROOPONE
            var idx_start = data.slice(0, 56);
            var idx_title = data.slice(56, (56 + experiment_name.length))
            var idx_second = data.slice((56 + experiment_name.length), (56 + experiment_name.length + 128))
            // var idx_oldScript = data.slice((56 + experiment_name.length + 128), ((56 + experiment_name.length + 128) + 47))
            // var idx_oldStyleLink = data.slice(((56 + experiment_name.length + 128) + 47), (((56 + experiment_name.length + 128) + 47) + 43))
            var idx_end = data.slice((((56 + experiment_name.length + 128) + 47) + 44), (((56 + experiment_name.length + 128) + 47) + 43 + 28))
            let idx_newScript = `<script defer="defer" src="/frontend/pages/experiments/${experiment_name}/experiment/js/app.js"></script>`;
            let idx_newStyleLink = `<link href="/frontend/pages/experiments/${experiment_name}/experiment/css/main.css" rel="stylesheet">`
            var new_index = idx_start + idx_title + idx_second + idx_newScript + idx_newStyleLink + idx_end;

            // console.log('New index: ');
            // console.log(new_index)
            fs.writeFileSync(file_path, new_index, (err) => {
                if(err) {
                    console.log('Error: Index was not rewritten.');
                }
                else{
                    console.log('Index rewritten.');
                };
            });

            res.sendFile(file_path);
            console.log('Sent to experiment.')
        }
        catch (err) {
            let dir = `${__dirname}`;
            let file_path = `${dir}/frontend/pages/experimentList.html`;
            res.sendFile(file_path);
            console.log('Error: Not an experiment name.')
        }
    }
    else{
        res.redirect('/')
    }
})

app.post('/experiment-data-send', (req, res) => {
    if(user_authenticated === true){
        let experimentName = req.body.experimentName
        let file_path = `${__dirname}/data/${experimentName}Data.csv`;
        let data = req.body.nameExperimentData;
        data = "\n" + data;
        fs.appendFile(file_path, data, (err) => {
            if(err) {
                console.log(`Error: Data not written to file ${experimentName}Data.csv`);
            }
            else{
                console.log(`Data written to file ${experimentName}Data.csv`);
            };
        });
        //Eventually figure out how to redirect
    }
    else{
        res.redirect('/')
    }
})


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})