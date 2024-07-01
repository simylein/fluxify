// TODO: legacy file remove when all test cases are covered in new traverse functions
import { describe, expect, test } from 'bun:test';
import { Route } from '../../router/router.type';
import { compareEndpoint, compareMethod } from './compare';

const makeMethod = (method: Route['method']): Route => {
	return { method, endpoint: '/auth', schema: null, handler: () => null };
};

const makeEndpoint = (endpoint: Route['endpoint']): Route => {
	return { method: 'get', endpoint, schema: null, handler: () => null };
};

describe(compareMethod.name, () => {
	test('should match methods given the same method', () => {
		expect(compareMethod(makeMethod('get'), 'get')).toEqual(true);
		expect(compareMethod(makeMethod('post'), 'post')).toEqual(true);
		expect(compareMethod(makeMethod('put'), 'put')).toEqual(true);
		expect(compareMethod(makeMethod('patch'), 'patch')).toEqual(true);
		expect(compareMethod(makeMethod('delete'), 'delete')).toEqual(true);
	});

	test('should not match methods given another method', () => {
		expect(compareMethod(makeMethod('get'), 'post')).toEqual(false);
		expect(compareMethod(makeMethod('post'), 'put')).toEqual(false);
		expect(compareMethod(makeMethod('put'), 'patch')).toEqual(false);
		expect(compareMethod(makeMethod('patch'), 'delete')).toEqual(false);
		expect(compareMethod(makeMethod('delete'), 'get')).toEqual(false);
	});

	test('should not match methods given yet another method', () => {
		expect(compareMethod(makeMethod('get'), 'delete')).toEqual(false);
		expect(compareMethod(makeMethod('post'), 'get')).toEqual(false);
		expect(compareMethod(makeMethod('put'), 'post')).toEqual(false);
		expect(compareMethod(makeMethod('patch'), 'put')).toEqual(false);
		expect(compareMethod(makeMethod('delete'), 'patch')).toEqual(false);
	});
});

describe(compareEndpoint.name, () => {
	test('should match simple endpoints', () => {
		expect(compareEndpoint(makeEndpoint('/'), '/')).toEqual(true);
		expect(compareEndpoint(makeEndpoint('/auth'), '/auth')).toEqual(true);
		expect(compareEndpoint(makeEndpoint('/user'), '/user')).toEqual(true);
		expect(compareEndpoint(makeEndpoint('/topic'), '/topic')).toEqual(true);
	});

	test('should not match endpoints with missing params', () => {
		expect(compareEndpoint(makeEndpoint('/:id'), '/')).toEqual(false);
		expect(compareEndpoint(makeEndpoint('/auth/:id'), '/')).toEqual(false);
	});

	test('should match nested endpoints', () => {
		expect(compareEndpoint(makeEndpoint('/auth/sign-in'), '/auth/sign-in')).toEqual(true);
		expect(compareEndpoint(makeEndpoint('/auth/sign-up'), '/auth/sign-up')).toEqual(true);
	});

	test('should not match endpoints with missing slashes', () => {
		expect(compareEndpoint(makeEndpoint('/auth/'), '/auth')).toEqual(false);
		expect(compareEndpoint(makeEndpoint('/auth/me/'), '/auth/me')).toEqual(false);
	});

	test('should not match miss spelled endpoints', () => {
		expect(compareEndpoint(makeEndpoint('/users'), '/user')).toEqual(false);
		expect(compareEndpoint(makeEndpoint('/auth/sign-in'), '/auth/signin')).toEqual(false);
		expect(compareEndpoint(makeEndpoint('/auth/sign-up'), '/auth/signup')).toEqual(false);
	});

	test('should match nested endpoints with params', () => {
		expect(compareEndpoint(makeEndpoint('/user/:id'), '/user/42')).toEqual(true);
		expect(compareEndpoint(makeEndpoint('/topic/:id'), '/topic/42')).toEqual(true);
		expect(compareEndpoint(makeEndpoint('/user/:id/profile'), '/user/42/profile')).toEqual(true);
	});

	test('should not match nested endpoints with missing params', () => {
		expect(compareEndpoint(makeEndpoint('/topic'), '/topic/42')).toEqual(false);
		expect(compareEndpoint(makeEndpoint('/user/:id'), '/user/')).toEqual(false);
		expect(compareEndpoint(makeEndpoint('/user/:id/profile'), '/user/')).toEqual(false);
	});

	test('should match deeply nested endpoints with params', () => {
		expect(compareEndpoint(makeEndpoint('/topic/:id/question'), '/topic/42/question')).toEqual(true);
		expect(compareEndpoint(makeEndpoint('/topic/:id/question/:id'), '/topic/42/question/73')).toEqual(true);
	});

	test('should not match deeply nested endpoints with extra params', () => {
		expect(compareEndpoint(makeEndpoint('/topic/:id'), '/topic/42/question')).toEqual(false);
		expect(compareEndpoint(makeEndpoint('/topic/:id/question'), '/topic/42/question/73')).toEqual(false);
		expect(compareEndpoint(makeEndpoint('/topic/:id/question/:id'), '/topic/42/question')).toEqual(false);
	});
});
