import { describe, expect, test } from 'bun:test';
import { hash } from './hash';

describe(hash.name, () => {
	test('should hash passwords and return a string', () => {
		expect(hash('123456', 'sha256')).toEqual('8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
		expect(hash('password', 'sha256')).toEqual('5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8');
	});
});
