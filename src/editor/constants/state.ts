import type { KeplerGlState } from "@kepler.gl/reducers";
import {
	INITIAL_MAP_STATE,
	INITIAL_MAP_STYLE,
	INITIAL_PROVIDER_STATE,
	INITIAL_UI_STATE,
	INITIAL_VIS_STATE,
} from "@kepler.gl/reducers";
import type { MapControlItem, MapControls } from "@kepler.gl/types";

export type CustomKeplerGlState = KeplerGlState & {
	uiState: KeplerGlState["uiState"] & {
		mapControls: MapControls & {
			sqlPanel: MapControlItem;
		};
	};
};

export const INITIAL_STATE: CustomKeplerGlState = {
	mapState: INITIAL_MAP_STATE,
	mapStyle: {
		...INITIAL_MAP_STYLE,
		styleType: process.env.KEPLERGL_THEME === "light" ? "positron" : "dark-matter",
	},
	providerState: INITIAL_PROVIDER_STATE,
	uiState: {
		...INITIAL_UI_STATE,
		mapControls: {
			mapLegend: {
				show: true,
				active: false,
			},
			mapLocale: {
				show: true,
				active: false,
			},
			mapDraw: {
				show: true,
				active: false,
			},
			sqlPanel: {
				show: true,
				active: false,
			},
			visibleLayers: {
				show: false,
				active: false,
			},
			toggle3d: {
				show: true,
				active: false,
			},
			effect: {
				show: false,
				active: false,
			},
			splitMap: {
				show: false,
				active: false,
			},
			aiAssistant: {
				show: false,
				active: false,
			},
		},
	},
	visState: INITIAL_VIS_STATE,
};
