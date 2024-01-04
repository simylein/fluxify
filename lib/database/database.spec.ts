import { afterAll, describe, expect, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { IdEntity } from '../repository/repository.type';
import { expectType } from '../test/expect-type';
import { runQuery, selectMany, selectOne } from './database';

const user = {
	id: randomUUID(),
	username: 'simylein',
	password: 'simylein',
};

const users = [
	{ id: randomUUID(), username: 'alice', password: 'alice-password' },
	{ id: randomUUID(), username: 'bob', password: 'bob-password' },
	{ id: randomUUID(), username: 'charlie', password: 'charlie-password' },
];

afterAll(() => runQuery('drop table database_user'));

describe(runQuery.name, () => {
	test('should create a table named database_user', () => {
		expect(() =>
			runQuery(
				'create table database_user (id text primary key not null, username text not null unique, password text not null)',
			),
		).not.toThrow();
	});

	test('should insert a user into said table', () => {
		expect(() =>
			runQuery('insert into database_user (id, username, password) values (?, ?, ?)', [
				user.id,
				user.username,
				user.password,
			]),
		).not.toThrow();
	});

	expectType<void>(runQuery('pragma testing_purpose'));
});

describe(selectOne.name, () => {
	test('should select the create user by id', () => {
		expect(selectOne('select * from database_user where id = ?', [user.id])).toEqual(user);
	});

	test('should select nothing given an invalid id', () => {
		expect(selectOne('select * from database_user where id = ?', ['non-existing-id'])).toBeNull();
	});

	expectType<IdEntity | null>(selectOne('pragma testing_purpose'));
});

describe(selectMany.name, () => {
	test('should select the all created users', () => {
		users.forEach((usr) => {
			runQuery('insert into database_user (id, username, password) values (?, ?, ?)', [
				usr.id,
				usr.username,
				usr.password,
			]);
		});

		expect(selectMany('select * from database_user')).toEqual([user, ...users]);
	});

	test('should select the user simylein', () => {
		expect(selectMany('select * from database_user where username = ?', [user.username])).toEqual([user]);
	});

	test('should select all users with a password string', () => {
		expect(selectMany(`select * from database_user where password like ?`, ['%password'])).toEqual(users);
	});

	expectType<IdEntity[]>(selectMany('pragma testing_purpose'));
});
