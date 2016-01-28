var express = require('express');
var app = express();
var _ = require('underscore');

var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var bodyParser = require('body-parser');

app.use(bodyParser.json());
var todos = [

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
    var matchedTodo = _.findWhere(todos, {id:todoID});
    
    if(matchedTodo){
        res.json(matchedTodo);
    }else{
        res.status(404).send();
    }
});

// POST Request /todos/
app.post('/todos', function(req, res){
    body = _.pick(req.body, 'description', 'completed');
    
    body.description = body.description.trim();
    
    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
        return res.status(400).send();
    }
    body.id = todoNextId++;
    todos.push(body);
    
    console.log('description: ' + body.description);
    res.json(body);
});

app.listen(PORT, function(){
    console.log('Express listening on port ' + PORT + '!');
})