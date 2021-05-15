const scene = new THREE.Scene();
let perspectiveCamera = new THREE.PerspectiveCamera(30,
  window.innerWidth / window.innerHeight, 0.1, 1000);
let orthographicCamera = new THREE.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color(0xEEEEEE));
document.body.appendChild(renderer.domElement);

let controls = new THREE.OrbitControls(perspectiveCamera, renderer.domElement);
controls.addEventListener('change', (o) => {
  gui.updateDisplay();
});

const sphereGeometry = new THREE.SphereGeometry(4.99, 64, 64);
let sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  transparent: true,
});
let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const curve = new THREE.EllipseCurve(
  0, 0,
  5, 5,
  0, 2 * Math.PI,
  false,
  0
);
const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
const curveMaterial = new THREE.LineBasicMaterial({ color: 0xbbbbbb});
const curveMaterial2 = new THREE.LineBasicMaterial({ color: 0xbbbbbb});
const curveMaterial3 = new THREE.LineBasicMaterial({ color: 0xbbbbbb});
for (let i=0; i<18; i++) {
  const ellipse1 = new THREE.Line(curveGeometry, curveMaterial);
  const ellipse2 = new THREE.Line(curveGeometry, curveMaterial2);
  const ellipse3 = new THREE.Line(curveGeometry, curveMaterial3);
  ellipse1.rotation.x = i * Math.PI / 18;
  ellipse2.rotation.y = i * Math.PI / 18;
  ellipse3.rotation.x = 0.5 * Math.PI;
  ellipse3.rotation.y = i * Math.PI / 18;
  scene.add(ellipse1);
  scene.add(ellipse2);
  scene.add(ellipse3);
}

perspectiveCamera.position.x = 14;
perspectiveCamera.position.y = 11;
perspectiveCamera.position.z = 15;
perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));

const guiObj = {
  'fov' : perspectiveCamera.fov,
  'color' : "#c2dc94",
  'camera' : 14,
  'camera_x': 0,
};

const gui = new dat.GUI();
// gui.add(guiObj, 'camera', { 'Perspective': 0, 'Orthographic': 1 }).onChange((v) => {
//   switch (v) {
//     case '0':
//       break;
//     case '1':
//       break;
//   }
// });
gui.add(perspectiveCamera.position, 'x', -500, 500).step(1).onChange((v) => {
  perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
});
gui.add(perspectiveCamera.position, 'y', -500, 500).step(1).onChange((v) => {
  perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
});
gui.add(perspectiveCamera.position, 'z', 0, 500).step(1).onChange((v) => {
  perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
});
gui.add(guiObj, 'fov', 0, 200).step(1).onChange((v) => {
  perspectiveCamera.fov = v;
  perspectiveCamera.updateProjectionMatrix();
});
// gui.addColor(guiObj, 'color').onChange(setColor);

function setColor() {
  console.log(guiObj.color);
  sphere.color = guiObj.color;
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, perspectiveCamera);
}

animate();