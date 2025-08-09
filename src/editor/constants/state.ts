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
			chartsPanel: MapControlItem;
			sqlPanel: MapControlItem;
		};
	};
};

export const INITIAL_STATE: CustomKeplerGlState = {
	mapState: {
		...INITIAL_MAP_STATE,
		zoom: 8,
		longitude: 6.86667,
		latitude: 45.916672,
	},
	mapStyle: {
		...INITIAL_MAP_STYLE,
		styleType: "visualization",
		mapStyles: {
			visualization: {
				id: "visualization",
				label: "Visualization",
				icon: "https://cloud.maptiler.com/static/img/maps/dataviz.png",
				url: `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.MAPTILER_API_KEY}`,
				layerGroups: [],
			},
			satellite: {
				id: "satellite",
				label: "Satellite",
				icon: "https://cloud.maptiler.com/static/img/maps/satellite.png",
				url: `https://api.maptiler.com/maps/satellite/style.json?key=${process.env.MAPTILER_API_KEY}`,
				layerGroups: [],
			},
			topo: {
				id: "topo",
				label: "General topo",
				icon: "https://cloud.maptiler.com/static/img/maps/topo.png",
				url: `https://api.maptiler.com/maps/topo-v2/style.json?key=${process.env.MAPTILER_API_KEY}`,
				layerGroups: [],
			},
			winter: {
				id: "winter",
				label: "Winter topo",
				icon: "https://cloud.maptiler.com/static/img/maps/winter.png",
				url: `https://api.maptiler.com/maps/winter-v2/style.json?key=${process.env.MAPTILER_API_KEY}`,
				layerGroups: [],
			},
		},
	},
	providerState: INITIAL_PROVIDER_STATE,
	uiState: {
		...INITIAL_UI_STATE,
		mapControls: {
			toggle3d: {
				show: true,
				active: false,
			},
			mapDraw: {
				show: true,
				active: false,
			},
			mapLocale: {
				show: true,
				active: false,
			},
			mapLegend: {
				show: true,
				active: false,
			},
			chartsPanel: {
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
