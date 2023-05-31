import { jwtDto } from 'lib/auth';
import { router } from 'lib/router';
import { findUser } from '../user/user.service';
import { idDto } from '../utils/id.dto';
import { todoCreateDto } from './dto/todo-create.dto';
import { todoQueryDto } from './dto/todo-query.dto';
import { todoUpdateDto } from './dto/todo-update.dto';
import { createTodo, deleteTodo, findTodo, findTodos, streamTodos, updateTodo } from './todo.service';

const app = router('/todo');

app.get('', { query: todoQueryDto, jwt: jwtDto }, async ({ query, jwt }) => {
	const user = await findUser(jwt.id);
	return findTodos(user, query);
});

app.get('/sse', { jwt: jwtDto }, async ({ jwt, req }) => {
	const user = await findUser(jwt.id);
	return streamTodos(user, req);
});

app.get('/:id', { param: idDto, jwt: jwtDto }, async ({ param, jwt }) => {
	const user = await findUser(jwt.id);
	return findTodo(user, param.id);
});

app.post('', { body: todoCreateDto, jwt: jwtDto }, async ({ body, jwt }) => {
	const user = await findUser(jwt.id);
	return createTodo(user, body);
});

app.patch('/:id', { param: idDto, body: todoUpdateDto, jwt: jwtDto }, async ({ param, body, jwt }) => {
	const user = await findUser(jwt.id);
	return updateTodo(user, param.id, body);
});

app.delete('/:id', { param: idDto, jwt: jwtDto }, async ({ param, jwt }) => {
	const user = await findUser(jwt.id);
	return deleteTodo(user, param.id);
});
