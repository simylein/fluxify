import { afterAll, afterEach, describe, expect, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { column } from '../database/column/column';
import { created } from '../database/created/created';
import { deleted } from '../database/deleted/deleted';
import { entity } from '../database/entity/entity';
import { Infer } from '../database/entity/entity.type';
import { primary } from '../database/primary/primary';
import { updated } from '../database/updated/updated';
import { expectType } from '../test/expect-type';
import { lessThan, like, moreThan, not } from './operators/operators';
import { repository } from './repository';
import { OptionalKeys } from './repository.type';

const userEntity = entity('repository_user', {
	id: primary('uuid'),
	age: column('int'),
	name: column('varchar').length(8),
	active: column('boolean').nullable(),
	isAdmin: column('boolean').name('is_admin'),
});
type User = Infer<typeof userEntity>;

const todoEntity = entity('repository_todo', {
	id: primary('increment'),
	name: column('varchar').length(64),
	done: column('boolean'),
	createdAt: created(),
	updatedAt: updated(),
	deletedAt: deleted(),
});
type Todo = Infer<typeof todoEntity>;

const userRepository = repository(userEntity);
const todoRepository = repository(todoEntity);

const user1: Omit<User, OptionalKeys> = { age: 42, name: 'alice', active: true, isAdmin: false };
const user2: Omit<User, OptionalKeys> = { age: 73, name: 'bob', active: false, isAdmin: true };
const user3: Omit<User, OptionalKeys> = { age: 12, name: 'charlie', active: true, isAdmin: false };
const user4: Omit<User, OptionalKeys> = { age: 24, name: 'dave', active: false, isAdmin: false };

const todo1: Omit<Todo, OptionalKeys> = { name: 'land', done: false };
const todo2: Omit<Todo, OptionalKeys> = { name: 'launch', done: true };
const todo3: Omit<Todo, OptionalKeys> = { name: 'compile', done: true };
const todo4: Omit<Todo, OptionalKeys> = { name: 'execute', done: false };

const users = [user1, user2, user3, user4];
const todos = [todo1, todo2, todo3, todo4];

const seedUsers = async (userData: Omit<User, OptionalKeys>[]): Promise<User['id'][]> => {
	const data = await Promise.all(userData.map((user) => userRepository.insert(user)));
	return data.map((user) => user.id);
};

const seedTodos = async (todoData: Omit<Todo, OptionalKeys>[]): Promise<Todo['id'][]> => {
	const data = await Promise.all(todoData.map((todo) => todoRepository.insert(todo)));
	return data.map((todo) => todo.id);
};

afterEach(() => Promise.all([userRepository.wipe(), todoRepository.wipe()]));

afterAll(() => Promise.all([userRepository.drop(), todoRepository.drop()]));

describe(userRepository.find.name, () => {
	test('should return an empty array when no entities exist', async () => {
		const result = await userRepository.find();
		expect(result).toEqual([]);
		expectType<User[]>(result);
	});

	test('should return all entities when no options are provided for users', async () => {
		const [id1, id2, id3, id4] = await seedUsers(users);

		const result = await userRepository.find();
		expect(result).toEqual([
			{ id: expect.any(String), ...user1 },
			{ id: expect.any(String), ...user2 },
			{ id: expect.any(String), ...user3 },
			{ id: expect.any(String), ...user4 },
		]);
		expect(result).toEqual([
			{ id: id1, ...user1 },
			{ id: id2, ...user2 },
			{ id: id3, ...user3 },
			{ id: id4, ...user4 },
		]);
		expectType<User[]>(result);
	});

	test('should return all entities when no options are provided for todos', async () => {
		const [id1, id2, id3, id4] = await seedTodos(todos);

		const result = await todoRepository.find({ select: { id: true, name: true, done: true } });
		expect(result).toEqual([
			{ id: expect.any(Number), ...todo1 },
			{ id: expect.any(Number), ...todo2 },
			{ id: expect.any(Number), ...todo3 },
			{ id: expect.any(Number), ...todo4 },
		]);
		expect(result).toEqual([
			{ id: id1, ...todo1 },
			{ id: id2, ...todo2 },
			{ id: id3, ...todo3 },
			{ id: id4, ...todo4 },
		]);
		expectType<Pick<Todo, 'id' | 'name' | 'done'>[]>(result);
	});

	test('should return entities that match the where clause', async () => {
		const [id] = await seedUsers(users);

		const result = await userRepository.find({ where: { age: 42 } });
		expect(result).toEqual([{ id, ...user1 }]);
		expectType<User[]>(result);
	});

	test('should return entities that match the where clause with or', async () => {
		const [id1, , id3] = await seedUsers(users);

		const result = await userRepository.find({ where: [{ age: 42 }, { age: 12 }] });
		expect(result).toEqual([
			{ id: id1, ...user1 },
			{ id: id3, ...user3 },
		]);
		expectType<User[]>(result);
	});

	test('should return entities with selected fields only', async () => {
		await seedUsers(users);

		const result = await userRepository.find({ select: { name: true } });
		expect(result).toEqual([{ name: user1.name }, { name: user2.name }, { name: user3.name }, { name: user4.name }]);
		expectType<Pick<User, 'name'>[]>(result);
	});

	test('should return entities ordered by given criteria', async () => {
		const [id1, id2, id3, id4] = await seedUsers(users);

		const result = await userRepository.find({ order: { name: 'desc' } });
		expect(result).toEqual([
			{ id: id4, ...user4 },
			{ id: id3, ...user3 },
			{ id: id2, ...user2 },
			{ id: id1, ...user1 },
		]);
		expectType<User[]>(result);
	});

	test('should return entities while skipping the given value', async () => {
		const [, id2, id3, id4] = await seedUsers(users);

		const result = await userRepository.find({ skip: 1 });
		expect(result).toEqual([
			{ id: id2, ...user2 },
			{ id: id3, ...user3 },
			{ id: id4, ...user4 },
		]);
		expectType<User[]>(result);
	});

	test('should return entities up to the given value', async () => {
		const [id] = await seedUsers(users);

		const result = await userRepository.find({ take: 1 });
		expect(result).toEqual([{ id, ...user1 }]);
		expectType<User[]>(result);
	});

	test('should disregard undefined values as keys in the where clause', async () => {
		const [id1, id2, id3, id4] = await seedUsers(users);

		const result = await userRepository.find({ where: { age: undefined } });
		expect(result).toEqual([
			{ id: id1, ...user1 },
			{ id: id2, ...user2 },
			{ id: id3, ...user3 },
			{ id: id4, ...user4 },
		]);
		expectType<User[]>(result);
	});

	test('should respect null values as keys in the where clause', async () => {
		const [id] = await seedTodos(todos);
		await todoRepository.update(id, { done: true });

		const result = await todoRepository.find({ select: { name: true, done: true }, where: { updatedAt: null } });
		expect(result).toEqual([todo2, todo3, todo4]);
		expectType<Pick<Todo, 'name' | 'done'>[]>(result);
	});

	test('should only return entities which are not soft deleted', async () => {
		const [id] = await seedTodos(todos);
		await todoRepository.softDelete(id);

		const result = await todoRepository.find({ select: { name: true, done: true } });
		expect(result).toEqual([todo2, todo3, todo4]);
		expectType<Pick<Todo, 'name' | 'done'>[]>(result);
	});

	test('should also return entities which are soft deleted', async () => {
		const [id] = await seedTodos(todos);
		await todoRepository.softDelete(id);

		const result = await todoRepository.find({ select: { name: true, done: true }, deleted: true });
		expect(result).toEqual(todos);
		expectType<Pick<Todo, 'name' | 'done'>[]>(result);
	});

	test('should respect not operator in where clause', async () => {
		const [id1, , id3, id4] = await seedUsers(users);

		const result = await userRepository.find({ where: { name: not(user2.name) } });
		expect(result).toEqual([
			{ id: id1, ...user1 },
			{ id: id3, ...user3 },
			{ id: id4, ...user4 },
		]);
		expectType<User[]>([
			{ id: id1, ...user1 },
			{ id: id3, ...user3 },
			{ id: id4, ...user4 },
		]);
	});

	test('should respect like operator in where clause', async () => {
		await seedTodos(todos);

		const result = await todoRepository.find({ select: { name: true, done: true }, where: { name: like('%nd%') } });
		expect(result).toEqual([todo1]);
		expectType<Pick<Todo, 'name' | 'done'>[]>(result);
	});

	test('should respect less than operator in where clause', async () => {
		const [, , id3, id4] = await seedUsers(users);

		const result = await userRepository.find({ where: { age: lessThan(25) } });
		expect(result).toEqual([
			{ id: id3, ...user3 },
			{ id: id4, ...user4 },
		]);
		expectType<User[]>(result);
	});

	test('should respect more than operator in where clause', async () => {
		const [, id] = await seedUsers(users);

		const result = await userRepository.find({ where: { age: moreThan(60) } });
		expect(result).toEqual([{ id, ...user2 }]);
		expectType<User[]>(result);
	});

	test('should return all entities which conform to all constraints', async () => {
		const [, id] = await seedTodos(todos);
		await todoRepository.update(id, { name: 'fly' });

		const result = await todoRepository.find({
			select: { name: true },
			where: { updatedAt: null },
			order: { name: 'desc' },
		});
		expect(result).toEqual([{ name: todo1.name }, { name: todo4.name }, { name: todo3.name }]);
		expectType<Pick<Todo, 'name'>[]>(result);
	});
});

describe(userRepository.findOne.name, () => {
	test('should return null when no entity with the id exists', async () => {
		const result = await userRepository.findOne({ where: { id: 'non-existing-id' } });
		expect(result).toBeNull();
		expectType<User | null>(result);
	});

	test('should return the entity with the id using where', async () => {
		const [id] = await seedUsers(users);

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toEqual({ id, ...user1 });
		expectType<User | null>(result);
	});

	test('should return the entity with the id using short form', async () => {
		const [id] = await seedUsers(users);

		const result = await userRepository.findOne(id);
		expect(result).toEqual({ id, ...user1 });
		expectType<User | null>(result);
	});

	test('should return null when no entity matches the where clause', async () => {
		await seedUsers(users);

		const result = await userRepository.findOne({ where: { id: 'non-existing-id', age: 69 } });
		expect(result).toBeNull();
		expectType<User | null>(result);
	});

	test('should return the entity with selected fields only', async () => {
		const [id] = await seedUsers(users);

		const result = await userRepository.findOne({ select: { age: true, name: true }, where: { id } });
		expect(result).toEqual({ age: user1.age, name: user1.name });
		expectType<Pick<User, 'age' | 'name'> | null>(result);
	});

	test('should disregard undefined values as keys in the where clause', async () => {
		const [id] = await seedUsers(users);

		const result = await userRepository.findOne({ where: { name: undefined } });
		expect(result).toEqual({ id, ...user1 });
		expectType<User | null>(result);
	});
});

describe(userRepository.insert.name, () => {
	test('should insert a new entity', async () => {
		const { id } = await userRepository.insert(user1);

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toEqual({ id, ...user1 });
	});

	test('should insert the entity and ignore values which are undefined', async () => {
		const { id } = await userRepository.insert({ ...user1, active: undefined });

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toEqual({ id, ...user1, active: null });
	});

	test('should insert the entity and provide a created at date', async () => {
		const { id } = await todoRepository.insert(todo1);

		const result = await todoRepository.findOne({ where: { id } });
		expect(result).toEqual({ id, ...todo1, createdAt: expect.any(Date), updatedAt: null, deletedAt: null });
	});

	test('should insert the entity and respect the primary key', async () => {
		const uuid = randomUUID();
		const id = 42;
		const { id: userId } = await userRepository.insert({ id: uuid, ...user1 });
		const { id: todoId } = await todoRepository.insert({ id, ...todo1 });
		expect(userId).toEqual(uuid);
		expect(todoId).toEqual(id);
	});
});

describe(userRepository.insertMany.name, () => {
	test('should insert multiple new entities', async () => {
		const [{ id: id1 }, { id: id2 }] = await userRepository.insertMany([user1, user2]);

		const result = await userRepository.find();
		expect(result).toEqual([
			{ id: id1, ...user1 },
			{ id: id2, ...user2 },
		]);
	});

	test('should insert multiple entities and ignore values which are undefined', async () => {
		const [{ id: id1 }, { id: id2 }] = await userRepository.insertMany([
			{ ...user1, active: undefined },
			{ ...user2, active: undefined },
		]);

		const result = await userRepository.find();
		expect(result).toEqual([
			{ id: id1, ...user1, active: null },
			{ id: id2, ...user2, active: null },
		]);
	});

	test('should insert multiple entities and provide a created at date', async () => {
		const [{ id: id1 }, { id: id2 }] = await todoRepository.insertMany([todo1, todo2]);

		const result = await todoRepository.find();
		expect(result).toEqual([
			{ id: id1, ...todo1, createdAt: expect.any(Date), updatedAt: null, deletedAt: null },
			{ id: id2, ...todo2, createdAt: expect.any(Date), updatedAt: null, deletedAt: null },
		]);
	});

	test('should insert multiple entities and respect the primary key', async () => {
		const [id, uuid] = [42, randomUUID()];
		const [{ id: userId }] = await userRepository.insertMany([{ id: uuid, ...user1 }]);
		const [{ id: todoId }] = await todoRepository.insertMany([{ id, ...todo1 }]);
		expect(userId).toEqual(uuid);
		expect(todoId).toEqual(id);
	});
});

describe(userRepository.update.name, () => {
	test('should update the entity with the id using short form', async () => {
		const { id } = await userRepository.insert(user1);
		await userRepository.insert(user2);
		await userRepository.update(id, { age: 69 });

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toEqual({ ...user1, id, age: 69 });
	});

	test('should update the entity with the id using long form', async () => {
		await userRepository.insert(user1);
		const { id } = await userRepository.insert(user2);
		await userRepository.update({ name: user2.name }, { age: 69 });

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toEqual({ ...user2, id, age: 69 });
	});

	test('should update the entity and ignore values which are undefined', async () => {
		const { id } = await userRepository.insert(user1);
		await userRepository.insert(user2);
		await userRepository.update(id, { name: undefined, age: 69 });

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toEqual({ ...user1, id, age: 69 });
	});

	test('should provide an updated at date', async () => {
		const { id } = await todoRepository.insert(todo1);
		await todoRepository.update(id, {});

		const result = await todoRepository.findOne({ where: { id } });
		expect(result).toEqual({ id, ...todo1, createdAt: expect.any(Date), updatedAt: expect.any(Date), deletedAt: null });
	});
});

describe(userRepository.delete.name, () => {
	test('should delete the entity with the id using short form', async () => {
		const { id } = await userRepository.insert(user1);
		await userRepository.delete(id);

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toBeNull();
	});

	test('should delete the entity with the id using long form', async () => {
		const { id } = await userRepository.insert(user2);
		await userRepository.delete({ name: user2.name });

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toBeNull();
	});
});

describe(todoRepository.softDelete.name, () => {
	test('should soft delete the entity with the id using short form', async () => {
		const { id } = await todoRepository.insert(todo1);
		await todoRepository.softDelete(id);

		const result = await todoRepository.findOne({ where: { id } });
		expect(result).toBeNull();
	});

	test('should soft delete the entity with the id using long form', async () => {
		const { id } = await todoRepository.insert(todo2);
		await todoRepository.softDelete({ name: todo2.name });

		const result = await todoRepository.findOne({ where: { id } });
		expect(result).toBeNull();
	});
});

describe(todoRepository.restore.name, () => {
	test('should restore the entity with the id using short form', async () => {
		const { id } = await todoRepository.insert(todo1);
		await todoRepository.softDelete(id);
		await todoRepository.restore(id);

		const result = await todoRepository.findOne({ where: { id } });
		expect(result).toEqual({ id, ...todo1, createdAt: expect.any(Date), updatedAt: null, deletedAt: null });
	});

	test('should restore the entity with the id using long form', async () => {
		const { id } = await todoRepository.insert(todo2);
		await todoRepository.softDelete(id);
		await todoRepository.restore({ name: todo2.name });

		const result = await todoRepository.findOne({ where: { id } });
		expect(result).toEqual({ id, ...todo2, createdAt: expect.any(Date), updatedAt: null, deletedAt: null });
	});
});
