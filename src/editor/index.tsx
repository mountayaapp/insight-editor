import {
	injectComponents,
	MapControlFactory,
	PanelHeaderFactory,
} from "@kepler.gl/components";
import keplerGlDuckdbPlugin, {
	DuckDBWasmAdapter,
	KeplerGlDuckDbTable,
	SqlPanel,
} from "@kepler.gl/duckdb";
import keplerGlReducer, {
	enhanceReduxMiddleware,
	type KeplerGlState,
} from "@kepler.gl/reducers";
import { theme } from "@kepler.gl/styles";
import { initApplicationConfig } from "@kepler.gl/utils";
import { configureStore } from "@reduxjs/toolkit";
import type React from "react";
import { IntlProvider } from "react-intl";
import { connect, Provider, useSelector } from "react-redux";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AutoSizer } from "react-virtualized/dist/commonjs/AutoSizer";
import { combineReducers } from "redux";
import { ThemeProvider } from "styled-components";

import { ChartsPanel } from "./charts";
import { MESSAGES } from "./constants/localization";
import { type CustomKeplerGlState, INITIAL_STATE } from "./constants/state";
import CustomMapControlFactory from "./factories/CustomMapControlFactory";
import CustomPanelHeaderFactory from "./factories/CustomPanelHeaderFactory";

import "./design.css";

initApplicationConfig({
	plugins: [keplerGlDuckdbPlugin],
	table: KeplerGlDuckDbTable,
	database: new DuckDBWasmAdapter({
		config: {
			query: {
				castBigIntToDouble: true,
				castTimestampToDate: true,
				castDurationToTime64: true,
				castDecimalToDouble: true,
			},
		},
	}),
	useArrowProgressiveLoading: false,
});

type ReduxState = {
	keplerGl: {
		map?: CustomKeplerGlState;
	};
};

export const Editor = () => {
	const middleware = enhanceReduxMiddleware([]);
	const reducer = combineReducers({
		keplerGl: keplerGlReducer.initialState(INITIAL_STATE),
	});

	const store = configureStore({ reducer, middleware });

	const KeplerGl = injectComponents([
		[MapControlFactory, CustomMapControlFactory] as never,
		[PanelHeaderFactory, CustomPanelHeaderFactory] as never,
	]);

	const CustomMap = () => {
		const isChartsPanelOpen = useSelector<ReduxState, boolean>((state) => {
			return state.keplerGl.map?.uiState.mapControls.chartsPanel?.active ?? false;
		});

		const isSqlPanelOpen = useSelector<ReduxState, boolean>((state) => {
			return state.keplerGl.map?.uiState.mapControls.sqlPanel?.active ?? false;
		});

		return (
			<ThemeProvider theme={theme}>
				<IntlProvider locale="en" messages={MESSAGES.en}>
					<div className={`fullscreen theme-${process.env.KEPLERGL_THEME}`}>
						<PanelGroup direction="horizontal">
							<Panel defaultSize={isChartsPanelOpen ? 70 : 100}>
								<PanelGroup direction="vertical">
									<Panel defaultSize={isSqlPanelOpen ? 70 : 100}>
										<AutoSizer>
											{({ height, width }) => (
												<KeplerGl
													width={width}
													height={height}
													theme={
														process.env.KEPLERGL_THEME === "light" ? "light" : undefined
													}
													mapboxApiAccessToken={process.env.MAPBOX_API_TOKEN}
													localeMessages={MESSAGES}
													appWebsite="https://mountaya.com"
													appName="Insight Editor"
													version="for Mountaya Insights."
												/>
											)}
										</AutoSizer>
									</Panel>

									{isSqlPanelOpen ? (
										<>
											<PanelResizeHandle className="panel-sql" />
											<Panel defaultSize={30} minSize={20} maxSize={50}>
												<SqlPanel initialSql='SELECT * FROM "dataset";' />
											</Panel>
										</>
									) : null}
								</PanelGroup>
							</Panel>

							{isChartsPanelOpen ? (
								<>
									<PanelResizeHandle className="panel-charts" />
									<Panel defaultSize={30} minSize={20} maxSize={50}>
										<ChartsPanel />
									</Panel>
								</>
							) : null}
						</PanelGroup>
					</div>
				</IntlProvider>
			</ThemeProvider>
		);
	};

	// biome-ignore lint/suspicious/noExplicitAny: Use same type.
	const dispatchToProps = (dispatch: React.Dispatch<any>) => ({ dispatch });
	const mapStateToProps = (state: KeplerGlState) => state;
	const ConnectedKeplerGl = connect(mapStateToProps, dispatchToProps)(CustomMap);

	return (
		<Provider store={store}>
			<ConnectedKeplerGl />
		</Provider>
	);
};
