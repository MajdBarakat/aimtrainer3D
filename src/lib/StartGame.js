import * as THREE from 'three';

const StartGame = (init) => {
	console.log('started');

	const { scene, camera, canvas, clock } = init;

	clock.start();
	//game;
	const params = {
		// start: startGame,
		gameDuration: 5,
		spawnRate: 2,
		despawnRate: 0.5,
		rangeX: 10,
		rangeY: 10,
		rangeZ: 10,
	};

	let started = true;
	let currentIntersect = null;
	let objects = [];

	let hits = 0;
	let misses = 0;
	let whiffs = 0;
	let accuracy = null;

	let targetsLeft = Math.floor(params.gameDuration * params.spawnRate);
	let interval = params.gameDuration / targetsLeft;
	let lastSpawn = params.gameDuration + interval;

	//raycaster
	const raycaster = new THREE.Raycaster();

	// gui.add(params, 'start');
	// gui.add(params, 'gameDuration').min(10).max(300).step(1);
	// gui.add(params, 'spawnRate').min(0.5).max(5).step(0.1);
	// gui.add(params, 'despawnRate').min(0.1).max(2).step(0.1);
	// gui.add(params, 'rangeX').min(1).max(15).step(0.1);
	// gui.add(params, 'rangeY').min(1).max(15).step(0.1);
	// gui.add(params, 'rangeZ').min(1).max(15).step(0.1);

	//shooting mechanic
	canvas.addEventListener('click', (e) => {
		if (currentIntersect) {
			scene.remove(currentIntersect.object);
			objects.splice(
				objects.findIndex(
					(obj) => obj.uuid == currentIntersect.object.uuid
				),
				1
			);
		} else if (started && !currentIntersect) whiffs++;
	});

	//animate
	const tick = () => {
		const elapsedTime = clock.getElapsedTime();
		const timeLeft = (params.gameDuration - elapsedTime).toFixed(2);

		const cameraPosition = new THREE.Vector3();
		const cameraDirection = new THREE.Vector3();
		camera.getWorldPosition(cameraPosition);
		camera.getWorldDirection(cameraDirection);

		raycaster.set(cameraPosition, cameraDirection);

		// timer.innerHTML = `${timeLeft}`;

		console.log(
			timeLeft,
			(lastSpawn - interval).toFixed(2),
			started,
			interval,
			targetsLeft
		);

		if (started && timeLeft <= (lastSpawn - interval).toFixed(2)) {
			lastSpawn = timeLeft;
			console.log(scene);
			const object = new THREE.Mesh(
				new THREE.SphereGeometry(0.5, 16, 16),
				new THREE.MeshBasicMaterial({ color: '#ff0000' })
			);

			object.position.x = (Math.random() - 0.5) * params.rangeX;
			object.position.y = Math.random() * (params.rangeY / 2);
			object.position.z = -Math.random() * (params.rangeZ / 2);

			scene.add(object);
			objects.push(object);

			targetsLeft--;

			setTimeout(() => {
				const index = objects.findIndex(
					(obj) => obj.uuid == object.uuid
				);
				if (index > -1) {
					scene.remove(object);
					objects.splice(
						objects.findIndex((obj) => obj.uuid == object.uuid),
						1
					);
					misses++;
				} else {
					hits++;
				}
			}, 1000 / params.despawnRate);
		}

		// if (timeLeft <= 0) timer.innerHTML = '0.00';

		if (accuracy === null && timeLeft <= 0 - 1 / params.despawnRate) {
			clock.stop();
			started = false;
			accuracy = (hits / (hits + whiffs + misses)) * 100;
			console.log('game over!');
			console.log(`You've hit ${hits} Targets!`);
			console.log(`You've missed ${misses} Targets!`);
			console.log(`You've whiffed ${whiffs} Times!`);
			console.log(`WOW you have an accuracy of ${accuracy}%!`);
			return hits, misses, whiffs;
		}

		if (targetsLeft === 0 && started) started = false;

		const intersects = raycaster.intersectObjects(objects);

		if (intersects.length) {
			if (!currentIntersect) {
				// console.log('entered')
			}
			currentIntersect = intersects[0];
		} else {
			if (currentIntersect) {
				// console.log('exited')
				currentIntersect = null;
			}
		}

		objects.forEach((obj) => obj.material.color.set(0xff0000));
		intersects.forEach((obj) => obj.object.material.color.set(0x00ff00));

		// Call tick again on the next frame
		window.requestAnimationFrame(tick);
	};

	tick();
};

export default StartGame;
