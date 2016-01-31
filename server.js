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
    var query = req.query;

    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({
        where: where
    }).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    });

});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoID = parseInt(req.params.id, 10);

    db.todo.findById(todoID).then(function (todo) {
        if (!!todo) {
            res.json(todo.toJSON());
            console.log('Found todo')
        } else {
            res.status(404).send();
            console.log('Did not find todo!')
        }
    }, function (e) {
        res.status(500).send();
    });

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