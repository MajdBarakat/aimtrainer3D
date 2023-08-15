import ReactSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
// import '../index.css';

const Slider = ({ defaultValue, value, params, onChange, disabled }) => {
	return (
		<ReactSlider
			defaultValue={defaultValue}
			value={value}
			min={params.min}
			max={params.max}
			step={params.step}
			onChange={(newValue) => onChange(params.id, newValue)}
			disabled={disabled}
			style={{
				height: '1rem',
				margin: '0',
				padding: '0',
				overflow: 'hidden',
				borderRadius: '2px',
				marginTop: '0.5rem',
			}}
			handleStyle={{
				background: 'white',
				width: '3rem',
				height: '1rem',
				border: 'solid 1px white',
				borderRadius: '2px',
				padding: '0',
				margin: '0',
				opacity: '1',
				marginLeft: '-1rem',
			}}
			trackStyle={{
				background: 'white',
				height: '1rem',
				borderRadius: '2px',
			}}
			railStyle={{
				background: 'rgba(255,255,255,0.25)',
				height: '1rem',
				borderRadius: '2px',
			}}
		/>
	);
};

export default Slider;
