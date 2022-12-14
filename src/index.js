const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(user) {  // Complete aqui
  let userExists = null;
  if (user.id?.length > 0) {
    userExists = users.find(user => user.id === user.id);
  } 
  if (user.username?.length > 0) {
    userExists = users.find(user => user.username === user.username);
  }
  return userExists;
}

app.post('/users', (request, response) => {
  const params = request.body
  userId = uuidv4();  
  if (checksExistsUserAccount(request.body)) {
    return response.status(400).json({ error: 'Username already exists' });
  } else {
    users.push({...params, id: userId, todos:[]});
    return response.status(201).json({...params, id: userId, todos:[]});
  }
});

app.get('/todos', (request, response) => {
  let user = checksExistsUserAccount(request.headers)
  return response.json(user?.todos);
});

app.post('/todos', (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  let todo = {};
  if (checksExistsUserAccount(request.headers)){
    todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }
    users.find(user => user.username === username).todos.push(todo);
    return response.status(201).json(todo);
  }
  return response.status(404).json({ error: 'User not found' });
});

app.put('/todos/:id', (request, response) => {
  let { id } = request.params;
  let { username } = request.headers;
  let { title, deadline } = request.body;
  if (checksExistsUserAccount(request.headers)){
    let user = users.find(user => user.username == username)
    let todo = user.todos.find(todo => todo.id == id)
    todo = {...todo, title, deadline: new Date(deadline)}
    return response.status(201).json(todo);
  }
  return response.status(404).json({ error: 'Todo not found' });
});

app.patch('/todos/:id/done', (request, response) => {
  let { id } = request.params;
  let { username } = request.headers;
  if (checksExistsUserAccount(request.headers)){
    let user = users.find(user => user.username == username)
    let todo = user.todos.find(todo => todo.id == id)
    if (todo) { 
    todo.done = true;
      return response.status(201).json(todo);
    } else {
      return response.status(404).json({ error: 'Todo not found' });
    }
  }
  return response.status(404).json({error: 'User not found'})
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;
