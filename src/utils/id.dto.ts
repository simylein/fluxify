import { Infer, object, uuid } from 'lib/validation';

export const idDto = object({
	id: uuid(),
});

export type IdDto = Infer<typeof idDto>;
