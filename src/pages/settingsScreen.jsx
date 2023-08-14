import { useEffect, useState } from 'react';
import Slider from '../components/slider';
import { cloneDeep } from 'lodash';
import config from '../config/config.json';

const SettingsScreen = ({ onLeave }) => {
	const [settings, setSettings] = useState(config.settingsFormat);

	const params = config.settingsSliderParamaters;

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

	const handleChange = (id, value) => {
		const settingsClone = cloneDeep(settings);
		const index = settings.findIndex((setting) => setting.id === id);
		settingsClone[index].value = value;
		setSettings(settingsClone);
		settingsClone.forEach((setting) =>
			window.localStorage.setItem(setting.id, JSON.stringify(setting))
		);
	};

	const renderRangeSetting = (param, setting) => {
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
						/>
					</div>
					<div className="w-2/12 text-right">
						<h1>{setting.value.toFixed(1)}</h1>
					</div>
				</div>
			</div>
		);
	};

	const renderTextOptions = () => {};

	return (
		<div className="flex flex-col justify-center items-center w-screen h-screen absolute bg-black/75">
			<div className="w-5/6">
				<h1 className="text-7xl -mt-24 font-light">SETTINGS</h1>
			</div>
			<div className=" flex flex-col text-4xl w-7/12 items-center">
				<h2 className="text-6xl ">GAME MODE</h2>
			</div>
			<div className=" flex flex-col text-4xl w-7/12 items-center"></div>
			<div className="flex flex-col text-4xl w-7/12">
				{settings.map((setting) =>
					renderRangeSetting(params[setting.id], setting)
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
