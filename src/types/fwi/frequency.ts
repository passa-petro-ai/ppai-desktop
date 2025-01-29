export type Group = {
	start: number;
	end: number;
	increment: number;
};

export type Frequency = {
	csgfDirectory: string;
	frequencies: Group[];
};
