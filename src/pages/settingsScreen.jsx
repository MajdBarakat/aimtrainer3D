import { useEffect, useState } from 'react';
import Slider from '../components/slider';
import { cloneDeep } from 'lodash';
import config from '../config/config.json';

const SettingsScreen = ({ onLeave }) => {
	const [settings, setSettings] = useState(config.settingsFormat);

	const sliderParams = config.settingsSliderParamaters;

	useEffect(() => {
		const fetchedSettings = [];
		settings.forEach((setting) =>
			fetchedSettings.push(
				window.localStorage.getItem(setting.id)
					? JSON.parse(window.localStorage.getItem(setting.id))
					: undefined
			)
		);
		fetchedSettings[0] !== undefined
			? setSettings(fetchedSettings)
			: setDefaultValues();
	}, []);

	const setDefaultValues = () => {
		const defaultSettings = cloneDeep(settings);
		defaultSettings.forEach(
			(setting) =>
				(setting.value = config.settingsDefaultValues[setting.id])
		);
		setSettings(defaultSettings);
	};

	const handleChange = (id, newValue) => {
		const settingsClone = cloneDeep(settings);
		const index = settingsClone.findIndex((setting) => setting.id === id);
		settingsClone[index].value = newValue;
		setSettings(settingsClone);
		settingsClone.forEach((setting) =>
			window.localStorage.setItem(setting.id, JSON.stringify(setting))
		);
	};

	const renderTextOption = (settingId, option, active, onClick) => {
		return (
			<button
				className={`${
					active
						? 'active text-white'
						: 'text-transparent text-outline'
				} `}
				onClick={() => onClick(settingId, option.id)}
				key={option.id}
			>
				{option.name}
			</button>
		);
	};

	const renderOptions = (options, settingId) => {
		const setting = settings.find((setting) => setting.id === settingId);
		return options.map((option) =>
			renderTextOption(
				setting.id,
				option,
				setting.value === option.id,
				handleChange
			)
		);
	};

	const renderSliderSetting = (param, setting, disabled) => {
		return (
			<div className="flex flex-row" key={param.id}>
				<div className="w-1/3">
					<h1>
						{setting.name}
						<span className="text-xl"> {setting.measuredIn}</span>
					</h1>
				</div>
				<div className="flex items-center w-2/3">
					<div className="w-10/12">
						<Slider
							defaultValue={1}
							value={setting.value}
							params={param}
							onChange={handleChange}
							disabled={disabled}
						/>
					</div>
					<div className="w-2/12 text-right">
						<h1>{setting.value.toFixed(1)}</h1>
					</div>
				</div>
			</div>
		);
	};

	const gameMode = settings.find(
		(setting) => setting.id === 'gameMode'
	).value;
	// console.log(gameMode);

	return (
		<div className="flex flex-col justify-center items-center w-screen h-screen absolute bg-black/75">
			<div className="w-5/6">
				<h1 className="text-7xl -mt-24 font-light">SETTINGS</h1>
			</div>
			<div className=" flex flex-col text-4xl w-7/12 items-center">
				<h2 className="text-6xl ">GAME MODE</h2>
			</div>
			<div className=" flex flex-row text-4xl font-semibold w-7/12 items-center justify-center gap-10">
				{renderOptions(config.gameModeOptions, 'gameMode')}
			</div>
			<div className=" flex flex-col text-4xl w-7/12 items-center">
				<h2 className="text-6xl ">DIFFICULTY</h2>
			</div>
			<div className=" flex flex-row text-4xl font-semibold w-7/12 items-center justify-center gap-10">
				{renderOptions(config.difficultyOptions, 'difficulty')}
			</div>
			<div className="flex flex-col text-4xl w-7/12">
				{settings.map(
					(setting) =>
						sliderParams[setting.id] !== undefined &&
						renderSliderSetting(
							sliderParams[setting.id],
							setting,
							!setting.gameModes.includes(gameMode)
						)
				)}
				<button
					className="bg-transparent mt-8 p-0 font-semibold hover:opacity-75"
					onClick={onLeave}
				>
					Leave
				</button>
			</div>
		</div>
	);
};

export default SettingsScreen;
