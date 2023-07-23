import { afterAll, afterEach, describe, expect, test } from 'bun:test';
import { column } from '../database/column/column';
import { created } from '../database/created/created';
import { deleted } from '../database/deleted/deleted';
import { entity } from '../database/entity/entity';
import { Infer } from '../database/entity/entity.type';
import { primary } from '../database/primary/primary';
import { updated } from '../database/updated/updated';
import { expectType } from '../test/expect-type';
import { repository } from './repository';
import { ExcludedInsertKeys } from './repository.type';

const userEntity = entity('repository_user', {
	id: primary(),
	age: column('int'),
	name: column('varchar').length(8),
	active: column('boolean').nullable(),
	isAdmin: column('boolean').name('is_admin'),
});
type User = Infer<typeof userEntity>;

const todoEntity = entity('repository_todo', {
	id: primary(),
	name: column('varchar').length(64),
	done: column('boolean'),
	createdAt: created(),
	updatedAt: updated(),
	deletedAt: deleted(),
});
type Todo = Infer<typeof todoEntity>;

const userRepository = repository(userEntity);

const user1: Omit<User, 'id'> = { age: 42, name: 'alice', active: true, isAdmin: false };
const user2: Omit<User, 'id'> = { age: 73, name: 'bob', active: false, isAdmin: true };

const todoRepository = repository(todoEntity);

const todo1: Omit<Todo, ExcludedInsertKeys> = { name: 'land', done: false };
const todo2: Omit<Todo, ExcludedInsertKeys> = { name: 'launch', done: true };

afterEach(() => Promise.all([userRepository.wipe(), todoRepository.wipe()]));

afterAll(() => Promise.all([userRepository.drop(), todoRepository.drop()]));

describe(userRepository.findMany.name, () => {
	test('should return an empty array when no entities exist', async () => {
		const result = await userRepository.findMany();
		expect(result).toEqual([]);
		expectType<User[]>(result);
	});

	test('should return all entities when no options are provided', async () => {
		const { id: id1 } = await userRepository.insert(user1);
		const { id: id2 } = await userRepository.insert(user2);

		const result = await userRepository.findMany();
		expect(result).toEqual([
			{ id: id1, ...user1 },
			{ id: id2, ...user2 },
		]);
		expectType<User[]>(result);
	});

	test('should return entities that match the where clause', async () => {
		const { id } = await userRepository.insert(user1);
		await userRepository.insert(user2);

		const result = await userRepository.findMany({ where: { age: 42 } });
		expect(result).toEqual([{ id, ...user1 }]);
		expectType<User[]>(result);
	});

	test('should return entities with selected fields only', async () => {
		await userRepository.insert(user1);
		await userRepository.insert(user2);

		const result = await userRepository.findMany({ select: { name: true } });
		expect(result).toEqual([{ name: user1.name }, { name: user2.name }]);
		expectType<Pick<User, 'name'>[]>(result);
	});

	test('should return entities ordered by given criteria', async () => {
		const { id: id1 } = await userRepository.insert(user1);
		const { id: id2 } = await userRepository.insert(user2);

		const result = await userRepository.findMany({ order: { name: 'desc' } });
		expect(result).toEqual([
			{ id: id2, ...user2 },
			{ id: id1, ...user1 },
		]);
		expectType<User[]>(result);
	});

	test('should return entities while skipping the given value', async () => {
		await userRepository.insert(user1);
		const { id } = await userRepository.insert(user2);

		const result = await userRepository.findMany({ skip: 1 });
		expect(result).toEqual([{ id, ...user2 }]);
		expectType<User[]>(result);
	});

	test('should return entities up to the given value', async () => {
		const { id } = await userRepository.insert(user1);
		await userRepository.insert(user2);

		const result = await userRepository.findMany({ take: 1 });
		expect(result).toEqual([{ id, ...user1 }]);
		expectType<User[]>(result);
	});

	test('should disregard undefined values as keys in the where clause', async () => {
		const { id: id1 } = await userRepository.insert(user1);
		const { id: id2 } = await userRepository.insert(user2);

		const result = await userRepository.findMany({ where: { age: undefined } });
		expect(result).toEqual([
			{ id: id1, ...user1 },
			{ id: id2, ...user2 },
		]);
		expectType<User[]>(result);
	});

	test('should respect null values as keys in the where clause', async () => {
		const inserted = await todoRepository.insert(todo1);
		await todoRepository.insert(todo2);
		await todoRepository.update(inserted.id, { done: true });

		const result = await todoRepository.findMany({ select: { name: true, done: true }, where: { updatedAt: null } });
		expect(result).toEqual([todo2]);
		expectType<Pick<Todo, 'name' | 'done'>[]>(result);
	});

	test('should only return entities which are not soft deleted', async () => {
		const { id } = await todoRepository.insert(todo1);
		await todoRepository.insert(todo2);
		await todoRepository.softDelete(id);

		const result = await todoRepository.findMany({ select: { name: true, done: true } });
		expect(result).toEqual([todo2]);
		expectType<Pick<Todo, 'name' | 'done'>[]>(result);
	});
});

describe(userRepository.findOne.name, () => {
	test('should return null when no entity with the id exists', async () => {
		const result = await userRepository.findOne({ where: { id: 'non-existing-id' } });
		expect(result).toEqual(null);
		expectType<User | null>(result);
	});

	test('should return the entity with the id using where', async () => {
		const { id } = await userRepository.insert(user1);
		await userRepository.insert(user2);

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toEqual({ id, ...user1 });
		expectType<User | null>(result);
	});

	test('should return the entity with the id using short form', async () => {
		const { id } = await userRepository.insert(user1);
		await userRepository.insert(user2);

		const result = await userRepository.findOne(id);
		expect(result).toEqual({ id, ...user1 });
		expectType<User | null>(result);
	});

	test('should return null when no entity matches the where clause', async () => {
		await userRepository.insert(user1);
		await userRepository.insert(user2);

		const result = await userRepository.findOne({ where: { id: 'non-existing-id', age: 69 } });
		expect(result).toEqual(null);
		expectType<User | null>(result);
	});

	test('should return the entity with selected fields only', async () => {
		const { id } = await userRepository.insert(user1);
		await userRepository.insert(user2);

		const result = await userRepository.findOne({ select: { age: true, name: true }, where: { id } });
		expect(result).toEqual({ age: user1.age, name: user1.name });
		expectType<Pick<User, 'age' | 'name'> | null>(result);
	});

	test('should disregard undefined values as keys in the where clause', async () => {
		const { id } = await userRepository.insert(user1);
		await userRepository.insert(user2);

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

	test('should insert insert the entity and provide a created at date', async () => {
		const { id } = await todoRepository.insert(todo1);

		const result = await todoRepository.findOne({ where: { id } });
		expect(result).toEqual({ id, ...todo1, createdAt: expect.any(Date), updatedAt: null, deletedAt: null });
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
		expect(result).toEqual(null);
	});

	test('should delete the entity with the id using long form', async () => {
		const { id } = await userRepository.insert(user2);
		await userRepository.delete({ name: user2.name });

		const result = await userRepository.findOne({ where: { id } });
		expect(result).toEqual(null);
	});
});

describe(todoRepository.softDelete.name, () => {
	test('should soft delete the entity with the id using short form', async () => {
		const { id } = await todoRepository.insert(todo1);
		await todoRepository.softDelete(id);

		const result = await todoRepository.findOne({ where: { id } });
		expect(result).toEqual(null);
	});

	test('should soft delete the entity with the id using long form', async () => {
		const { id } = await todoRepository.insert(todo2);
		await todoRepository.softDelete({ name: todo2.name });

		const result = await todoRepository.findOne({ where: { id } });
		expect(result).toEqual(null);
	});
});

describe(todoRepository.softDelete.name, () => {
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
