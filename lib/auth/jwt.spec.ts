import { describe, expect, mock, test } from 'bun:test';
import { config } from '../config/config';
import { signJwt, verifyJwt } from './jwt';

Date.now = mock(() => 42000);
const id = '36e12dd6-4efb-16c7-97d4-80a58b193540';

const manipulateToken = (jwt: string, index: number, payload: object): string => {
	const manipulatedToken = jwt
		.split('.')
		.map((frag, ind) => {
			if (ind === index) {
				const existing = JSON.parse(Buffer.from(frag, 'base64').toString());
				return {
					...existing,
					...payload,
				};
			} else {
				return frag;
			}
		})
		.join();
	return manipulatedToken;
};

describe(signJwt.name, () => {
	test('should generate a valid jwt', () => {
		const jwt = signJwt({ id });
		const parts = jwt.split('.');
		expect(parts).toHaveLength(3);

		const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
		const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

		expect(header).toEqual({ alg: 'HS256', typ: 'JWT' });
		expect(payload).toEqual({ id, iat: Math.floor(Date.now() / 1000), exp: +payload.iat + config.jwtExpiry });
	});
});

describe(verifyJwt.name, () => {
	test('should verify a valid jwt', () => {
		expect(verifyJwt(signJwt({ id }))).toEqual({
			id,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + config.jwtExpiry,
		});
	});

	test('should throw an error for an invalid token format', () => {
		expect(() => verifyJwt('invalid-token')).toThrow(Error('unauthorized'));
		expect(() => verifyJwt('header.payload.signature.extra')).toThrow(Error('unauthorized'));
		expect(() => verifyJwt('header.payload')).toThrow(Error('unauthorized'));
	});

	test('should throw an error for an invalid header', () => {
		const jwt = signJwt({ id });
		const invalidToken = manipulateToken(jwt, 0, { alg: 'RS256' });
		expect(() => verifyJwt(invalidToken)).toThrow(Error('unauthorized'));
	});

	test('should throw an error for an expired token', () => {
		const jwt = signJwt({ id });
		const expiredToken = manipulateToken(jwt, 1, {
			iat: Math.floor(Date.now() / 1000) - 3600,
			exp: Math.floor(Date.now() / 1000) - 1800,
		});
		expect(() => verifyJwt(expiredToken)).toThrow(Error('unauthorized'));
	});

	test('should throw an error for an invalid signature', () => {
		const jwt = signJwt({ id });
		const invalidToken = jwt.replace(jwt.split('.')[2], 'invalid-signature');
		expect(() => verifyJwt(invalidToken)).toThrow(Error('unauthorized'));
	});
});
