import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragHandle, Tooltip } from "@kepler.gl/components";
import {
	Settings,
	Trash,
	VertDots,
	ZoomIn,
} from "@kepler.gl/components/dist/common/icons";
import { FormattedMessage } from "@kepler.gl/localization";
import type KeplerTable from "@kepler.gl/table";
import type { Field } from "@kepler.gl/types";
import { useCallback } from "react";

import { BarChart, type BarChartFields } from "./charttypes/Bar";
import { HeatmapChart, type HeatmapChartFields } from "./charttypes/Heatmap";
import { LineChart, type LineChartFields } from "./charttypes/Line";
import type { Chart } from "../types";

const chartStyle: React.CSSProperties = {
	height: 300,
	width: "100%",
};

type ChartListItemProps = {
	chart: Chart<unknown>;
	dataset: KeplerTable<Field>;
	onClickEnlarge: (chart: Chart<unknown>) => void;
	onClickEdit: (chart: Chart<unknown>) => void;
	onClickDelete: (chart: Chart<unknown>) => void;
};

export const ChartListItem = (props: ChartListItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: props.chart.id,
	});

	const handleOnClickEnlarge = useCallback(
		(event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
			event.stopPropagation();
			props.onClickEnlarge(props.chart);
		},
		[props.chart, props.onClickEnlarge],
	);

	const handleOnClickEdit = useCallback(
		(event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
			event.stopPropagation();
			props.onClickEdit(props.chart);
		},
		[props.chart, props.onClickEdit],
	);

	const handleOnClickDelete = useCallback(
		(event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
			event.stopPropagation();
			props.onClickDelete(props.chart);
		},
		[props.chart, props.onClickDelete],
	);

	return (
		<div
			key={JSON.stringify(props.chart)}
			ref={setNodeRef}
			className="chart-item"
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}
			{...attributes}
		>
			<div className="chart-header">
				<div className="chart-title-wrapper" {...listeners}>
					<DragHandle className="chart-title-dnd">
						<VertDots />
					</DragHandle>
					<span>{props.chart.title}</span>
				</div>
				<div className="chart-actions">
					<div className="chart-action" data-tip data-for={`enlarge-${props.chart.id}`}>
						<ZoomIn height="16px" onClick={handleOnClickEnlarge} />
						<Tooltip id={`enlarge-${props.chart.id}`} effect="solid" type="info">
							<FormattedMessage id="charts.list.action.enlarge" />
						</Tooltip>
					</div>
					<div className="chart-action" data-tip data-for={`edit-${props.chart.id}`}>
						<Settings height="16px" onClick={handleOnClickEdit} />
						<Tooltip id={`edit-${props.chart.id}`} effect="solid" type="info">
							<FormattedMessage id="charts.list.action.edit" />
						</Tooltip>
					</div>
					<div className="chart-action" data-tip data-for={`delete-${props.chart.id}`}>
						<Trash height="16px" onClick={handleOnClickDelete} />
						<Tooltip id={`delete-${props.chart.id}`} effect="solid" type="error">
							<FormattedMessage id="charts.list.action.delete" />
						</Tooltip>
					</div>
				</div>
			</div>

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
		</div>
	);
};
