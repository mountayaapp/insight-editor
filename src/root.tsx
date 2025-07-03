import ReactDOM from "react-dom/client";

import { Editor } from "./editor";

const container = document.getElementById("root");
if (container) {
	const root = ReactDOM.createRoot(container);
	root.render(<Editor />);
}
