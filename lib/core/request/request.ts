import { ValidationError } from '../../validation/error';
import { serializer } from '../serialize/serialize';

export const parseBody = async (request: Request): Promise<unknown | null> => {
	try {
		if (request.body) {
			const body = await serializer.req(request);
			return body;
		} else {
			return null;
		}
	} catch (err) {
		throw new ValidationError((err as { message?: string }).message);
	}
};
