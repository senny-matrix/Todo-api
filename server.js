var express = require('express');
var app = express();
var _ = require('underscore');
var db = require('./db.js')

var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var bodyParser = require('body-parser');

app.use(bodyParser.json());
var todos = [

];

app.get('/', function (req, res) {
    res.send('ToDo API Root');
});

// GET /todos?completed=true&q=work
app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    // if has property && completed = true
    // filteredTodos = _.where(filteredTodo, ?)
    // else if has property && completed is false
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {
            completed: true
        });
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {
            completed: false
        });
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }
    res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoID = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todoID
    });

    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

// POST Request /todos/
app.post('/todos', function (req, res) {
    body = _.pick(req.body, 'description', 'completed');

    // Call create on db.todo
    db.todo.create(body).then(function (todo) {
        res.json(todo.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });

    //    body.description = body.description.trim();
    //
    //    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    //        return res.status(400).send();
    //    }
    //    body.id = todoNextId++;
    //    todos.push(body);
    //
    //    console.log('description: ' + body.description);
    //    res.json(body);
});

// DELETE /todos/:id 
app.delete('/todos/:id', function (req, res) {
    var todoID = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todoID
    });

    if (!matchedTodo) {
        res.status(404).json({
            "error": "no todo found with that id"
        });
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }
});

// PUT /todos/:id 
app.put('/todos/:id', function (req, res) {

    var todoID = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todoID
    });

    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if (!matchedTodo) {
        return res.status(404).send();
    }
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        // Bad
        return res.status(400).send();
    } else {
        // Never provided attribute, no problem here
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        res.status(400).send();
    }
    //body.hasOwnProperty('completed');

    // HERE
    // Redundunt as extend will update matchTodo anyways
    //matchedTodo = _.extend(matchedTodo, validAttributes);
    // Just use extend
    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});

db.sequelize.sync().then((function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
}));