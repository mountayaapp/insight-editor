import type { EChartsOption } from "echarts";

export type ChartType = "line" | "bar" | "heatmap";

export type Chart<Fields> = {
	id: string;
	position: number;
	type: ChartType;
	datasetId: string;
	title: string;
	description: string;
	fields: Fields;
	settings: EChartsOption;
};

export type Aggregate = "count" | "sum";
