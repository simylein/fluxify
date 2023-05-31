import { Infer, number, object, string } from 'lib/validation';

export const todoQueryDto = object({
	title: string().optional().min(2).max(32),
	description: string().optional().min(8).max(256),
	take: number().optional().transform(),
	skip: number().optional().transform(),
});

export type TodoQueryDto = Infer<typeof todoQueryDto>;
