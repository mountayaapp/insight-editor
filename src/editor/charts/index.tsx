import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { VisStateActions } from "@kepler.gl/actions";
import { Button, PanelTitleFactory, SidePanelSection } from "@kepler.gl/components";
import { Add } from "@kepler.gl/components/dist/common/icons";
import { FormattedMessage } from "@kepler.gl/localization";
import type { KeplerGlState } from "@kepler.gl/reducers";
import type { Datasets, KeplerTable } from "@kepler.gl/table";
import type { Field, MapControlItem, MapControls } from "@kepler.gl/types";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { ChartListItem } from "./components/ChartListItem";
import { ModalChartDelete } from "./components/ModalChartDelete";
import { ModalChartEditor } from "./components/ModalChartEditor";
import { ModalChartViewer } from "./components/ModalChartViewer";
import type { Chart } from "./types";

import "./design.css";

export type CustomKeplerGlState = KeplerGlState & {
	uiState: KeplerGlState["uiState"] & {
		mapControls: MapControls & {
			sqlPanel: MapControlItem;
			chartsPanel: MapControlItem;
		};
	};
};

type ReduxState = {
	keplerGl: {
		map?: CustomKeplerGlState;
	};
};

export const ChartsPanel = () => {
	const intl = useIntl();
	const dispatch = useDispatch();

	const hasDatasets = useSelector<ReduxState, boolean>((state) => {
		if (!state.keplerGl.map?.visState.datasets) {
			return false;
		}

		return Object.keys(state.keplerGl.map?.visState.datasets).length > 0;
	});

	const [selectedChart, setSelectedChart] = useState<Chart<unknown> | undefined>(
		undefined,
	);

	const datasets = useSelector<ReduxState, Datasets | undefined>((state) => {
		return state.keplerGl.map?.visState.datasets;
	});

	const isReadOnly = useSelector<ReduxState, boolean>((state) => {
		return state.keplerGl.map?.uiState.readOnly ?? true;
	});

	const savedCharts = useSelector<ReduxState, Chart<unknown>[]>((state) => {
		return Object.values(state.keplerGl.map?.visState.datasets ?? {})
			.reduce(
				(acc: Chart<unknown>[], current) =>
					acc.concat(Object.values(current.metadata?.charts || {})),
				[],
			)
			.sort((a, b) => a.position - b.position);
	});

	const [openedChartModal, setOpenedChartModal] = useState<
		"editor" | "enlarge" | "delete" | null
	>(null);

	const handleModalClose = useCallback(() => {
		setSelectedChart(undefined);
		setOpenedChartModal(null);
	}, []);

	const handleEnlargeClick = useCallback((chart: Chart<unknown>) => {
		setSelectedChart(chart);
		setOpenedChartModal("enlarge");
	}, []);

	const handleEditClick = useCallback((chart: Chart<unknown>) => {
		setSelectedChart(chart);
		setOpenedChartModal("editor");
	}, []);

	const handleDeleteClick = useCallback((chart: Chart<unknown>) => {
		setSelectedChart(chart);
		setOpenedChartModal("delete");
	}, []);

	const handleChartSave = useCallback(
		(chart: Chart<unknown>) => {
			setSelectedChart(undefined);
			if (!chart.position || chart.position === 0) {
				chart.position = savedCharts.length + 1;
			}

			const filteredCharts = savedCharts
				.filter((saved) => saved.id !== chart.id && saved.datasetId === chart.datasetId)
				.sort((a, b) => a.position - b.position);

			const chartsWithNewOrUpdated = [...filteredCharts, chart];

			const uniqueChartsById = Array.from(
				new Map(chartsWithNewOrUpdated.map((item) => [item.id, item])).values(),
			);

			dispatch(
				VisStateActions.updateDatasetProps(chart.datasetId, {
					metadata: {
						charts: null,
					},
				}),
			);

			dispatch(
				VisStateActions.updateDatasetProps(chart.datasetId, {
					metadata: {
						charts: uniqueChartsById,
					},
				}),
			);

			setOpenedChartModal(null);
		},
		[savedCharts, dispatch],
	);

	const handleChartDelete = useCallback(
		(chart: Chart<unknown>) => {
			setSelectedChart(undefined);

			if (!datasets) {
				return;
			}

			const chartsAfterDeletion = savedCharts.filter(
				(savedChart) => savedChart.id !== chart.id,
			);

			chartsAfterDeletion.sort((a, b) => a.position - b.position);

			chartsAfterDeletion.forEach((chart, index) => {
				chart.position = index + 1;
			});

			Object.values(datasets).forEach((dataset) => {
				const chartsForThisDataset = chartsAfterDeletion.filter(
					(chart) => chart.datasetId === dataset.id,
				);

				dispatch(
					VisStateActions.updateDatasetProps(dataset.id, {
						metadata: {
							charts: null,
						},
					}),
				);

				dispatch(
					VisStateActions.updateDatasetProps(dataset.id, {
						metadata: {
							charts: chartsForThisDataset,
						},
					}),
				);
			});

			setOpenedChartModal(null);
		},
		[savedCharts, datasets, dispatch],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;

			if (active.id !== over?.id) {
				const oldIndex = savedCharts.findIndex((chart) => chart.id === active.id);
				const newIndex = savedCharts.findIndex((chart) => chart.id === over?.id);

				if (oldIndex === -1 || newIndex === -1) {
					return;
				}

				const globallyReorderedCharts = [...savedCharts];
				const [movedChart] = globallyReorderedCharts.splice(oldIndex, 1);
				globallyReorderedCharts.splice(newIndex, 0, movedChart);

				const updatedGloballyPositionedCharts = globallyReorderedCharts.map(
					(chart, index) => ({
						...chart,
						position: index,
					}),
				);

				const updatedChartsGroupedByDataset = new Map<string, Chart<unknown>[]>();
				const impactedDatasetIds = new Set<string>();

				updatedGloballyPositionedCharts.forEach((chart) => {
					if (!updatedChartsGroupedByDataset.has(chart.datasetId)) {
						updatedChartsGroupedByDataset.set(chart.datasetId, []);
					}
					updatedChartsGroupedByDataset.get(chart.datasetId)?.push(chart);
					impactedDatasetIds.add(chart.datasetId);
				});

				impactedDatasetIds.forEach((datasetId) => {
					const chartsForThisDataset = updatedChartsGroupedByDataset.get(datasetId);
					if (chartsForThisDataset) {
						dispatch(
							VisStateActions.updateDatasetProps(datasetId, {
								metadata: {
									charts: null,
								},
							}),
						);

						dispatch(
							VisStateActions.updateDatasetProps(datasetId, {
								metadata: {
									charts: chartsForThisDataset,
								},
							}),
						);
					}
				});
			}
		},
		[dispatch, savedCharts],
	);

	const PanelTitle = PanelTitleFactory();

	return (
		<div className="sidebar-charts">
			<div className="charts-manager-header">
				<SidePanelSection>
					<PanelTitle
						className="charts-manager-title"
						title={intl.formatMessage({ id: "charts.list.title" })}
					>
						{!isReadOnly ? (
							<Button
								type="button"
								onClick={() => setOpenedChartModal("editor")}
								disabled={!hasDatasets}
							>
								<Add height="12px" />
								<FormattedMessage id="charts.list.create" />
							</Button>
						) : null}
					</PanelTitle>
				</SidePanelSection>
				{!hasDatasets ? (
					<p>
						<FormattedMessage id="charts.list.no-datasets" />
					</p>
				) : null}
				{hasDatasets && savedCharts.length === 0 ? (
					<p>
						<FormattedMessage id="charts.list.no-charts" />
					</p>
				) : null}
			</div>

			{hasDatasets && datasets && selectedChart ? (
				<>
					<ModalChartViewer
						key={`viewer-${selectedChart.id}`}
						chart={selectedChart}
						dataset={
							Object.values(datasets).find(
								(d) => d.id === selectedChart.datasetId,
							) as KeplerTable<Field>
						}
						isModalOpen={openedChartModal === "enlarge"}
						onModalClose={handleModalClose}
					/>

					<ModalChartDelete
						key={`delete-${selectedChart.id}`}
						chart={selectedChart}
						isModalOpen={openedChartModal === "delete"}
						onModalClose={handleModalClose}
						onChartDelete={handleChartDelete}
					/>
				</>
			) : null}

			{hasDatasets && datasets ? (
				<>
					<ModalChartEditor
						key={`editor-${selectedChart?.id || nanoid(13)}`}
						chart={selectedChart}
						datasets={datasets}
						isModalOpen={openedChartModal === "editor"}
						onModalClose={handleModalClose}
						onChartSave={handleChartSave}
					/>
					<DndContext
						modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={savedCharts.map((chart) => chart.id)}
							strategy={verticalListSortingStrategy}
						>
							{savedCharts.map((chart) => {
								return (
									<ChartListItem
										key={chart.id}
										chart={chart}
										dataset={
											Object.values(datasets).find(
												(d) => d.id === chart.datasetId,
											) as KeplerTable<Field>
										}
										onClickEnlarge={handleEnlargeClick}
										onClickEdit={handleEditClick}
										onClickDelete={handleDeleteClick}
									/>
								);
							})}
						</SortableContext>
					</DndContext>
				</>
			) : null}
		</div>
	);
};
