import { useEffect, useState } from 'react';
import Slider from '../components/slider';
import { cloneDeep } from 'lodash';

const SettingsScreen = ({}) => {
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
		{
			id: 'sensitivity',
			name: 'Sensitivity',
			measuredIn: '',
			value: 0,
		},
	]);

	const params = {
		spawnRate: {
			id: 'spawnRate',
			min: 0,
			max: 5,
			step: 0.01,
		},
		despawnRate: {
			id: 'despawnRate',
			min: 0,
			max: 5,
			step: 0.01,
		},
		spread: {
			id: 'spread',
			min: 0,
			max: 5,
			step: 0.01,
		},
		sensitivity: {
			id: 'sensitivity',
			min: 0,
			max: 5,
			step: 0.01,
		},
	};

	useEffect(() => {
		// const fetchedSettings = localStorage.getItem('settings');
		// fetchedSettings && setSettings(fetchedSettings);
	}, []);

	const handleChange = (id, value) => {
		const settingsClone = cloneDeep(settings);
		const index = settings.findIndex((setting) => setting.id === id);
		settingsClone[index].value = value;
		setSettings(settingsClone);
		window.localStorage.setItem('settings', settingsClone);
	};

	const renderRangeSetting = (param) => {
		const index = settings.findIndex((setting) => setting.id === param.id);
		const setting = settings[index];
		return (
			<div className="flex flex-row" key={param.id}>
				<div className="w-1/3">
					<h1>{setting.name}</h1>
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
			<div className="flex flex-col text-4xl w-6/12">
				{settings.map((setting) =>
					renderRangeSetting(params[setting.id])
				)}
			</div>
		</div>
	);
};

export default SettingsScreen;
