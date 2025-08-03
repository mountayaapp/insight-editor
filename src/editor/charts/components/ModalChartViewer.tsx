import { Modal } from "@kepler.gl/components";
import type KeplerTable from "@kepler.gl/table";
import type { Field } from "@kepler.gl/types";

import { BarChart, type BarChartFields } from "./charttypes/Bar";
import { HeatmapChart, type HeatmapChartFields } from "./charttypes/Heatmap";
import { LineChart, type LineChartFields } from "./charttypes/Line";
import type { Chart } from "../types";

const chartStyle: React.CSSProperties = {
	height: 520,
	width: "100%",
};

type ModalChartViewerProps = {
	chart: Chart<unknown>;
	dataset: KeplerTable<Field>;
	isModalOpen: boolean;
	onModalClose: () => void;
};

export const ModalChartViewer = (props: ModalChartViewerProps) => {
	return (
		<Modal
			title={props.chart.title}
			isOpen={props.isModalOpen}
			onCancel={props.onModalClose}
			portalClassName="chart-enlarge"
		>
			<p>{props.chart.description}</p>

			{props.chart.type === "line" ? (
				<LineChart
					readonly={true}
					dataset={props.dataset}
					chart={props.chart as Chart<LineChartFields>}
					style={chartStyle}
				/>
			) : null}
			{props.chart.type === "bar" ? (
				<BarChart
					readonly={true}
					dataset={props.dataset}
					chart={props.chart as Chart<BarChartFields>}
					style={chartStyle}
				/>
			) : null}
			{props.chart.type === "heatmap" ? (
				<HeatmapChart
					readonly={true}
					dataset={props.dataset}
					chart={props.chart as Chart<HeatmapChartFields>}
					style={chartStyle}
				/>
			) : null}
		</Modal>
	);
};
