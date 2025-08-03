import {
	DatasetTagFactory,
	Modal,
	PanelLabel,
	SourceDataSelectorFactory,
} from "@kepler.gl/components";
import SourceDataSelectorContentFactory from "@kepler.gl/components/dist/side-panel/common/source-data-selector-content";
import { FormattedMessage } from "@kepler.gl/localization";
import type { KeplerGlState } from "@kepler.gl/reducers";
import type { Datasets } from "@kepler.gl/table";
import type { MapControlItem, MapControls } from "@kepler.gl/types";
import { nanoid } from "nanoid";
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { ChartTypeSelector } from "./ChartTypeSelector";
import { BarChart, type BarChartFields } from "./charttypes/Bar";
import { HeatmapChart, type HeatmapChartFields } from "./charttypes/Heatmap";
import { LineChart, type LineChartFields } from "./charttypes/Line";
import type { Chart, ChartType } from "../types";

const chartStyle: React.CSSProperties = {
	height: 300,
	width: "100%",
};

export type CustomKeplerGlState = KeplerGlState & {
	uiState: KeplerGlState["uiState"] & {
		mapControls: MapControls & {
			sqlPanel: MapControlItem;
			chartsPanel: MapControlItem;
		};
	};
};

type ModalChartEditorProps = {
	chart?: Chart<unknown>;
	datasets: Datasets;
	isModalOpen: boolean;
	onChartSave: (chart: Chart<unknown>) => void;
	onModalClose: () => void;
};

export const ModalChartEditor = (props: ModalChartEditorProps) => {
	const intl = useIntl();
	const chartId = useMemo(() => {
		return nanoid(13);
	}, []);

	const initialDatasetId =
		props.chart?.datasetId && props.datasets[props.chart.datasetId]
			? props.chart.datasetId
			: Object.keys(props.datasets)[0];

	const [selectedChartType, setSelectedChartType] = useState<ChartType>(
		props.chart?.type || "line",
	);

	const [selectedDatasetId, setSelectedDatasetId] = useState<string>(initialDatasetId);

	const [chartDraft, setChartDraft] = useState<Chart<unknown>>(() => {
		if (props.chart) {
			return props.chart;
		}

		return {
			id: chartId,
			position: 0,
			type: selectedChartType,
			datasetId: initialDatasetId,
			title: "",
			description: "",
			fields: {},
			settings: {},
		};
	});

	const [titleValue, setTitleValue] = useState(chartDraft.title || "");
	const [descriptionValue, setDescriptionValue] = useState(chartDraft.description || "");

	const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newTitle = event.target.value;
		setTitleValue(newTitle);
		setChartDraft((prev) => ({
			...prev,
			title: newTitle,
		}));
	};

	const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newDescription = event.target.value;
		setDescriptionValue(newDescription);
		setChartDraft((prev) => ({
			...prev,
			description: newDescription,
		}));
	};

	const SourceDataSelectorContent = SourceDataSelectorContentFactory(DatasetTagFactory());
	const SourceDataSelector = SourceDataSelectorFactory(SourceDataSelectorContent);

	const handleChartConfigChange = useCallback(
		(updatedFieldsAndSettings: Partial<Chart<unknown>>) => {
			setChartDraft((prevChart) => ({
				...prevChart,
				...updatedFieldsAndSettings,
				type: selectedChartType,
				datasetId: selectedDatasetId,
			}));
		},
		[selectedChartType, selectedDatasetId],
	);

	const handleChartTypeSelect = useCallback(
		(
			chartType:
				| string
				| number
				| boolean
				| object
				| readonly (string | number | boolean | object)[]
				| null,
		) => {
			setSelectedChartType(chartType as ChartType);
			setChartDraft((prevChart) => ({
				...prevChart,
				type: chartType as ChartType,
				fields: {},
				settings: {},
			}));
		},
		[],
	);

	const handleDatasetSelect = useCallback(
		(
			datasetId:
				| string
				| number
				| boolean
				| object
				| readonly (string | number | boolean | object)[]
				| null,
		) => {
			setSelectedDatasetId(datasetId as string);
			setChartDraft((prevChart) => ({
				...prevChart,
				datasetId: datasetId as string,
			}));
		},
		[],
	);

	const currentDataset = useMemo(() => {
		return props.datasets[selectedDatasetId];
	}, [props.datasets, selectedDatasetId]);

	const confirmButton = useMemo(
		() => ({
			large: true,
			disabled: !(titleValue && chartDraft.settings.xAxis && chartDraft.settings.yAxis),
			children: props.chart ? "charts.editor.button.edit" : "charts.editor.button.create",
		}),
		[titleValue, props.chart, chartDraft.settings.xAxis, chartDraft.settings.yAxis],
	);

	const cancelButton = useMemo(
		() => ({
			large: true,
			children: "charts.editor.button.cancel",
		}),
		[],
	);

	return (
		<Modal
			title={
				props.chart
					? "charts.editor.modal.title.edit"
					: "charts.editor.modal.title.create"
			}
			isOpen={props.isModalOpen}
			footer={true}
			cancelButton={cancelButton}
			onCancel={props.onModalClose}
			confirmButton={confirmButton}
			onConfirm={() => {
				props.onChartSave(chartDraft);
			}}
			portalClassName="chart-editor"
		>
			<div className="chart-editor-wrapper">
				<div className="chart-editor-left">
					<SourceDataSelector
						inputTheme="light"
						disabled={!!props.chart}
						dataId={[selectedDatasetId ?? Object.keys(props.datasets)[0]]}
						datasets={props.datasets}
						onSelect={handleDatasetSelect}
					/>

					<ChartTypeSelector
						chart={props.chart}
						readonly={!!props.chart}
						onMapToggleLayer={handleChartTypeSelect}
					/>
				</div>
				<div className="chart-editor-right">
					<PanelLabel inputMode="text" aria-required>
						<FormattedMessage id="charts.editor.form.title.label" /> *
					</PanelLabel>
					<input
						id="title"
						type="text"
						name="title"
						placeholder={intl.formatMessage({
							id: "charts.editor.form.title.placeholder",
						})}
						value={titleValue}
						onChange={handleTitleChange}
					/>

					<PanelLabel inputMode="text">
						<FormattedMessage id="charts.editor.form.description.label" />
					</PanelLabel>
					<textarea
						id="description"
						name="description"
						placeholder={intl.formatMessage({
							id: "charts.editor.form.description.placeholder",
						})}
						value={descriptionValue}
						onChange={handleDescriptionChange}
					/>

					{selectedChartType === "line" ? (
						<LineChart
							key={`line-${chartId}`}
							readonly={false}
							chart={chartDraft as Chart<LineChartFields>}
							dataset={currentDataset}
							onChartChange={handleChartConfigChange}
							style={chartStyle}
						/>
					) : null}
					{selectedChartType === "bar" ? (
						<BarChart
							key={`bar-${chartId}`}
							readonly={false}
							chart={chartDraft as Chart<BarChartFields>}
							dataset={currentDataset}
							onChartChange={handleChartConfigChange}
							style={chartStyle}
						/>
					) : null}
					{selectedChartType === "heatmap" ? (
						<HeatmapChart
							key={`heatmap-${chartId}`}
							readonly={false}
							chart={chartDraft as Chart<HeatmapChartFields>}
							dataset={currentDataset}
							onChartChange={handleChartConfigChange}
							style={chartStyle}
						/>
					) : null}
				</div>
			</div>
		</Modal>
	);
};
