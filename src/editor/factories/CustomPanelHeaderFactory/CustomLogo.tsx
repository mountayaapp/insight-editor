import "./design.css";

type CustomLogoProps = {
	appName: string;
	appWebsite: string;
	version: string;
};

const CustomLogo = (props: CustomLogoProps) => {
	return (
		<div className="logo-wrapper">
			<img
				src={`https://app.mountaya.com/brand/icon-${process.env.KEPLERGL_THEME}.svg`}
				alt="Mountaya"
			/>
			<div className="logo-titles">
				<span className="logo-title">{props.appName}</span>
				<span className="logo-subtitle">{props.version}</span>
			</div>
		</div>
	);
};

export default CustomLogo;
