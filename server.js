const express = require ('express');
const bodyParser = require ("body-parser");
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');

const db = knex({
    client: 'pg',
    connection : {
        host : '127.0.0.1',
        user: 'postgres',
        password: 'test',
        port : 5432,
        database : 'company'
    }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/register', (req, res)=>{
    const { firstName, lastName, address, email, joinedDate ,company} = req.body;
    db('employee')
    .returning('*')    
    .insert({
        first_name: firstName,
        last_name: lastName,
        address: address,
        email : email,
        company: company,
        joined_date: joinedDate
    })
    .then(user => {
        res.status(200).json("registered!");
    })
    .catch(err => res.status(400).json("unable to register!"));
})

app.post('/company/create',(req,res)=>{
    const {company, established} = req.body;
    db('company')
    .returning('*') 
    .insert({
        company : company,
        established : established
    })
    .then(company => {
        res.json(company[0]);
    })
    .catch(err => res.status(400).json("unable to create new company!"));
})


app.get('/company', (req, res)=>{
    db('company')
    .select('*')
    .from('company')
    .then(companies =>{
        if(companies.length){
            res.json(companies);
        }else{
            res.status(400).json('No Companies')
        }
    })
    .catch(err => res.status(400).json('Error loading Companies'));
})

app.get('/employees', (req, res)=>{
    db('employee')
    .select('*')
    .from('employee')
    .then(employees =>{
        if(employees.length){
            res.json(employees);
        }else{
            res.status(400).json('No Employees')
        }
    })
    .catch(err => res.status(400).json('Error loading Employees'));
})


app.get('/employees/:organization', (req, res)=>{
    const { organization } = req.params;
    db('employee')
    .select('*')
    .from('employee')
    .where({
        company : organization
    })
    .then(employees =>{
        if(employees.length){
            res.json(employees);
        }else{
            res.status(400).json('No Employees')
        }
    })
    .catch(err => res.status(400).json('Error getting employees'));
})

app.get('/view', (req,res)=>{
    db('employee')
    .select('*')
    .from('employee')
    .where({
        company : null
    })
    .then(employees =>{
        if(employees.length){
            res.json(employees);
        }else{
            res.status(400).json('No Employees')
        }
    })
    .catch(err => res.status(400).json('Error getting employees'));
})

app.put('/unlink/:id',(req,res)=>{
    const { id } = req.params;
    db('employee')
    .where({ employee_id : id})
    .update('company', null)
    .then(user => {
        res.json(user);
    })
    .catch(err => res.status(400).json('Could not remove user from the company'));
})

app.put('/link/:id',(req,res)=>{
    const { company } = req.body;
    const { id } = req.params;
    db('employee')
    .where({ employee_id : id})
    .update('company', company)
    .then(user => {
        res.json(user);
    })
    .catch(err => res.status(400).json('Could not add user to the company'));
})

app.listen(3000, ()=>{
    console.log("app running on port 3000");
})


/*
/ --> res = this is working
/register --> POST = usser object
/company/:organization --> GET = users working in the company
/view --> get = all users who do not work in company
updating on the user profile, adding to company of our choice
*/