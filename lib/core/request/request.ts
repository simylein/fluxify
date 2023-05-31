import { ValidationError } from '../../validation/error';

export const parseBody = async (request: Request): Promise<unknown | null> => {
	try {
		if (request.body) {
			const body = await request.json();
			return body;
		} else {
			return null;
		}
	} catch (err) {
		throw new ValidationError((err as { message?: string }).message);
	}
};
