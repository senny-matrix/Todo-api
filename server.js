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

    db.todo.destroy({
        where: {
            id: todoID
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: 'No to do with given id'
            });
        } else {
            res.status(204).send();
        }
    }, function () {
        res.status(500).send();
    });

});

// PUT /todos/:id 
app.put('/todos/:id', function (req, res) {
    var todoID = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findById(todoID).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    });
});
db.sequelize.sync().then((function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
}));