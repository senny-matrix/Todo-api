var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var bodyParser = require('body-parser');

app.use(bodyParser.json());
var todos = [
//{
//    id: 1,
//    description: 'Meet Senny for Lunch',
//    completed: false
//    
//},{
//    id: 2,
//    description: 'Go to market',
//    completed: false
//},{
//    id: 3,
//    description: 'Buying Juice for Jesca!',
//    completed:true
//}
];

app.get('/', function(req, res){
    res.send('ToDo API Root');
});

// GET /todos
app.get('/todos', function(req, res){
   res.json(todos); 
});

// GET /todos/:id
app.get('/todos/:id', function(req, res){
    var todoID = parseInt(req.params.id, 10);
    var matchedTodo;
    todos.forEach(function(todo){
        if(todoID === todo.id){
            matchedTodo = todo;
        }
    });
    if(matchedTodo){
        res.json(matchedTodo);
    }else{
        res.status(404).send();
    }
});

// POST Request /todos/
app.post('/todos', function(req, res){
    body = req.body;
    body.id = todoNextId++;
    todos.push(body);
    
    console.log('description: ' + body.description);
    res.json(body);
});

app.listen(PORT, function(){
    console.log('Express listening on port ' + PORT + '!');
})