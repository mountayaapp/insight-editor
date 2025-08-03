import { useMemo } from "react";

import type { SVGProps } from "../types";

// Source of the SVG: https://tabler.io/icons/icon/chart-cohort
export const SVG = (props: SVGProps) => {
	const color = useMemo(() => {
		return props.isActive ? "#1FBAD6" : undefined;
	}, [props.isActive]);

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<title>Heatmap Chart</title>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path stroke={color} d="M3 9h18v-6h-18v18h6v-18" />
			<path stroke={color} d="M3 15h12v-12" />
		</svg>
	);
};
