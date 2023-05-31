import { emit, subscribe } from 'lib/events';
import { Forbidden, NoContent } from 'lib/exception';
import { info, mask } from 'lib/logger';
import { repository } from 'lib/repository';
import { AuthUser } from '../auth/auth.service';
import { TodoCreateDto } from './dto/todo-create.dto';
import { TodoQueryDto } from './dto/todo-query.dto';
import { TodoUpdateDto } from './dto/todo-update.dto';
import { Todo, todoEntity } from './todo.entity';

const todoRepository = repository(todoEntity);

const findExisting = async (user: AuthUser, id: Todo['id']): Promise<Todo> => {
	const todo = await todoRepository.findOne({ where: { id, userId: user.id } });

	if (!todo) {
		throw Forbidden();
	}
	return todo;
};

export const findTodos = async (
	user: AuthUser,
	query: TodoQueryDto,
): Promise<Omit<Todo, 'userId' | 'createdAt' | 'updatedAt' | 'deletedAt'>[]> => {
	info('finding all todos');

	const todos = await todoRepository.findMany({
		select: { id: true, title: true, description: true, done: true, dueAt: true },
		where: { userId: user.id, title: query.title ? `%${query.title}%` : undefined },
		take: query.take,
		skip: query.skip,
	});

	if (todos.length === 0) {
		throw NoContent('no todos found');
	}
	return todos;
};

export const streamTodos = (user: AuthUser, req: Request): Response => {
	return subscribe(req, `/todo/${user.id}`);
};

export const findTodo = async (user: AuthUser, id: Todo['id']): Promise<Todo> => {
	info(`finding todo with id '${mask(id)}'`);

	const todo = await findExisting(user, id);
	return todo;
};

export const createTodo = async (user: AuthUser, body: TodoCreateDto): Promise<Todo> => {
	info('creating new todo');

	const { id } = await todoRepository.insert({ userId: user.id, ...body });
	emit(`/todo/${user.id}`, 'create');
	return findExisting(user, id);
};

export const updateTodo = async (user: AuthUser, id: Todo['id'], body: TodoUpdateDto): Promise<Todo> => {
	info(`updating todo with id '${mask(id)}'`);

	await findExisting(user, id);
	await todoRepository.update(id, body);
	emit(`/todo/${user.id}`, 'update');
	return findExisting(user, id);
};

export const deleteTodo = async (user: AuthUser, id: Todo['id']): Promise<void> => {
	info(`deleting todo with id '${mask(id)}'`);

	await findExisting(user, id);
	emit(`/todo/${user.id}`, 'delete');
	return todoRepository.softDelete(id);
};
