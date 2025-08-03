import { useMemo } from "react";

import type { SVGProps } from "../types";

// Source of the SVG: https://tabler.io/icons/icon/chart-line
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
			<title>Line Chart</title>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path stroke={color} d="M4 19l16 0" />
			<path stroke={color} d="M4 15l4 -6l4 2l4 -5l4 4" />
		</svg>
	);
};
