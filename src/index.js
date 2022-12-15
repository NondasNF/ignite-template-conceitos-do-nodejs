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
    userExists = users.find(u => u.id === user.id);
  } 
  if (user.username?.length > 0) {
    userExists = users.find(u => u.username === user.username);
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
    let userIndex = users.findIndex(user => user.username === username)
    let todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id)
    
    console.log("🚀 ~ file: index.js:67 ~ app.put ~ todoIndex", todoIndex)

    if (todoIndex < 0)
    return response.status(404).json({ error: 'Todo not found' });
    
    let todo = users[userIndex].todos[todoIndex];
    users[userIndex][todoIndex] = {...todo, title: title, deadline: new Date(deadline)}
    
    console.log("🚀 ~ file: index.js:74 ~ app.put ~ todo", todo)
    
    return response.status(201).json(users[userIndex][todoIndex]);
  }
  return response.status(404).json({ error: 'Todo not found' });
});

app.patch('/todos/:id/done', (request, response) => {
  let { id } = request.params;
  let { username } = request.headers;
  if (checksExistsUserAccount(request.headers)){
    let user = users.find(user => user.username == username)
    let todo = user.todos.find(todo => todo.id == id)
    if (!todo) return response.status(404).json({ error: 'Todo not found' });
    todo.done = true;
    return response.status(201).json(todo);
  }
  return response.status(404).json({error: 'User not found'})
});

app.delete('/todos/:id', (request, response) => {
  let { id } = request.params;
  let { username } = request.headers;
  if (checksExistsUserAccount(request.headers)){
    let user = users.find(user => user.username == username)
    let todo = user.todos.find(todo => todo.id == id)
    if (!todo) return response.status(404).json({ error: 'Todo not found' });
    user.todos.splice(user.todos.indexOf(todo), 1);
    return response.status(204).json();
  }
  return response.status(404).json({error: 'User not found'})
});

module.exports = app;
