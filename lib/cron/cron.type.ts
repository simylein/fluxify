export type Tab = {
	timer: Timer | null;
	schedule: string;
	handler: () => void | Promise<void>;
};
