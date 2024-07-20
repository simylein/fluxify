export type Tab = {
	timer: Timer | null;
	schedule: string;
	handler: () => unknown | Promise<unknown>;
};
