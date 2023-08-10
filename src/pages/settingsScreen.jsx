import { useEffect, useState } from 'react';
import Slider from '../components/slider';
import { cloneDeep } from 'lodash';

const SettingsScreen = ({ onLeave }) => {
	const [settings, setSettings] = useState([
		{
			id: 'spawnRate',
			name: 'Spawn Rate',
			measuredIn: '(/s)',
			value: 0,
		},
		{
			id: 'despawnRate',
			name: 'Despawn Rate',
			measuredIn: '(/s)',
			value: 0,
		},
		{
			id: 'spread',
			name: 'Spread',
			measuredIn: '',
			value: 0,
		},
		// {
		// 	id: 'sensitivity',
		// 	name: 'Sensitivity',
		// 	measuredIn: '',
		// 	value: 0,
		// },
	]);

	const params = {
		spawnRate: {
			id: 'spawnRate',
			min: 0,
			max: 3,
			step: 0.01,
		},
		despawnRate: {
			id: 'despawnRate',
			min: 0,
			max: 1.5,
			step: 0.01,
		},
		spread: {
			id: 'spread',
			min: 0,
			max: 15,
			step: 0.01,
		},
		// sensitivity: {
		// 	id: 'sensitivity',
		// 	min: 0,
		// 	max: 5,
		// 	step: 0.01,
		// },
	};

	useEffect(() => {
		const fetchedSettings = [];
		settings.forEach((setting) =>
			fetchedSettings.push(
				JSON.parse(window.localStorage.getItem(setting.id))
			)
		);
		fetchedSettings && setSettings(fetchedSettings);
	}, []);

	const handleChange = (id, value) => {
		const settingsClone = cloneDeep(settings);
		const index = settings.findIndex((setting) => setting.id === id);
		settingsClone[index].value = value;
		setSettings(settingsClone);
		settingsClone.forEach((setting) =>
			window.localStorage.setItem(setting.id, JSON.stringify(setting))
		);
	};

	const renderRangeSetting = (param) => {
		const index = settings.findIndex((setting) => setting.id === param.id);
		const setting = settings[index];
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

	return (
		<div className="flex flex-col justify-center items-center w-screen h-screen absolute bg-black/75">
			<h1 className="text-8xl mb-24 -mt-24">SETTINGS</h1>
			<div className="flex flex-col text-4xl w-7/12">
				{settings.map((setting) =>
					renderRangeSetting(params[setting.id])
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
