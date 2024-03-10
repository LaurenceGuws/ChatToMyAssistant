// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Enhanced Controls for interaction (freedom to focus any celestial body)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // An aesthetic choice, granting a smooth camera movement.
controls.dampingFactor = 0.05; // The viscosity of space, if you will.
controls.target.set(0, 0, 0); // A neutral starting point, from whence you may direct your gaze wherever you wish.


// Planets data
const planetsData = [
    { name: "Mercury", texture: "/SOLARSYSTEM/static/mercury.jpg", size: 0.38, orbitRadius: 30, orbitSpeed: 0.001 }, // Slower than 0.04
    { name: "Venus", texture: "/SOLARSYSTEM/static/venus.jpg", size: 0.949, orbitRadius: 44, orbitSpeed: 0.00075 }, // Slower than 0.03
    { name: "Earth", texture: "/SOLARSYSTEM/static/earth.jpg", size: 1, orbitRadius: 58, orbitSpeed: 0.0005 }, // Slower than 0.02
    { name: "Mars", texture: "/SOLARSYSTEM/static/mars.jpg", size: 0.532, orbitRadius: 72, orbitSpeed: 0.00045 }, // Slower than 0.018
    { name: "Jupiter", texture: "/SOLARSYSTEM/static/jupiter.jpg", size: 11.21, orbitRadius: 96, orbitSpeed: 0.0004 }, // Slower than 0.016
    { name: "Saturn", texture: "/SOLARSYSTEM/static/saturn.jpg", size: 9.45, orbitRadius: 140, orbitSpeed: 0.00035 }, // Slower than 0.014
    { name: "Uranus", texture: "/SOLARSYSTEM/static/uranus.jpg", size: 4, orbitRadius: 182, orbitSpeed: 0.0003 }, // Slower than 0.012
    { name: "Neptune", texture: "/SOLARSYSTEM/static/neptune.jpg", size: 3.88, orbitRadius: 224, orbitSpeed: 0.00025 }, // Slower than 0.010
    { name: "Pluto", texture: "/SOLARSYSTEM/static/pluto.jpg", size: 0.186, orbitRadius: 248, orbitSpeed: 0.0002 }, // Slower than 0.008
];

// Texture loading utility
function loadTextureAsync(path) {
    return new Promise((resolve, reject) => {
        new THREE.TextureLoader().load(path, resolve, undefined, (error) => reject(error));
    });
}

// Sun creation with asynchronous texture loading
async function createSun() {
    const sunGeometry = new THREE.SphereGeometry(20, 64, 64);
    const sunTexture = await loadTextureAsync('/SOLARSYSTEM/static/sun.jpg');
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    sun.position.set(0, 0, 0);
    return sun; // To be used for rotation in the animate function
}

// Planets creation with asynchronous texture loading
async function createPlanets(planetsData) {
    for (let planetData of planetsData) {
        const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);
        const texture = await loadTextureAsync(planetData.texture);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const planet = new THREE.Mesh(geometry, material);
        scene.add(planet);
        planet.position.x = planetData.orbitRadius;
        planetData.sphere = planet; // Storing the mesh for animation
    }
}

function onDocumentKeyDown(event) {
    const keyCode = event.which;
    const moveSpeed = 0.15; // Speed of the camera's movement around the target
    const vector = new THREE.Vector3(); // Vector pointing from the camera to the controls target
    const quaternion = new THREE.Quaternion(); // Quaternion for rotation

    switch(keyCode) {
        case 37: // Left arrow - rotate left
            quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), moveSpeed); // Rotate around Y axis
            camera.position.sub(controls.target).applyQuaternion(quaternion).add(controls.target); // Apply rotation
            camera.lookAt(controls.target); // Ensure the camera still looks at the target
            break;
        case 39: // Right arrow - rotate right
            quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -moveSpeed); // Rotate around Y axis in the opposite direction
            camera.position.sub(controls.target).applyQuaternion(quaternion).add(controls.target);
            camera.lookAt(controls.target);
            break;
        case 38: // Up arrow - rotate up
            vector.copy(camera.position).sub(controls.target);
            quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), moveSpeed); // Rotate around X axis
            if (vector.applyQuaternion(quaternion).angleTo(new THREE.Vector3(0, 1, 0)) < Math.PI / 2) {
                camera.position.sub(controls.target).applyQuaternion(quaternion).add(controls.target);
                camera.lookAt(controls.target);
            }
            break;
        case 40: // Down arrow - rotate down
            vector.copy(camera.position).sub(controls.target);
            quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -moveSpeed); // Rotate around X axis in the opposite direction
            if (vector.applyQuaternion(quaternion).angleTo(new THREE.Vector3(0, -1, 0)) < Math.PI / 2) {
                camera.position.sub(controls.target).applyQuaternion(quaternion).add(controls.target);
                camera.lookAt(controls.target);
            }
            break;
    }
}
document.addEventListener("keydown", onDocumentKeyDown, false);


// Raycaster for mouse interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    // Convert the mouse position to normalized device coordinates (-1 to +1) for both axes
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
        // Assuming your planets are added directly to the scene, this checks if a planet is clicked
        if (planetsData.some(planetData => planetData.sphere === intersects[i].object)) {
            // Update controls target to the position of the clicked planet
            controls.target.copy(intersects[i].object.position);
            // You might want to add some offset here if needed, to not look directly at the planet's surface
            break; // Break after finding the first intersected planet
        }
    }
}

// Listen for mouse click to update target
window.addEventListener('click', onMouseClick, false);

// Animation loop
function animate(planetsData, sun) {
    requestAnimationFrame(() => animate(planetsData, sun));

    // Optional: Sun rotation
    if (sun) sun.rotation.y += 0.004;

    planetsData.forEach(planetData => {
        if (planetData.sphere) {
            planetData.sphere.rotation.y += 0.01; // Rotate each planet on its axis
            planetData.orbitAngle = (planetData.orbitAngle || 0) + planetData.orbitSpeed;
            planetData.sphere.position.x = sun.position.x + planetData.orbitRadius * Math.cos(planetData.orbitAngle);
            planetData.sphere.position.z = sun.position.z + planetData.orbitRadius * Math.sin(planetData.orbitAngle);
        }
    });

    controls.update(); // Required for smooth damping movement
    renderer.render(scene, camera);
}

// Initialize everything
async function init() {
    camera.position.z = 120;
    const sun = await createSun();
    await createPlanets(planetsData);
    animate(planetsData, sun);
}

init().catch(error => console.error(error));