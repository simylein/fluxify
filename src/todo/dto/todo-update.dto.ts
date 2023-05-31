import { Infer, boolean, date, object, string } from 'lib/validation';

export const todoUpdateDto = object({
	title: string().optional().min(2).max(32),
	description: string().optional().min(8).max(256),
	done: boolean().optional(),
	dueAt: date().optional(),
});

export type TodoUpdateDto = Infer<typeof todoUpdateDto>;
