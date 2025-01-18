const scene0 = new THREE.Scene();
const scene1 = new THREE.Scene();
const scene2 = new THREE.Scene();

const camera0 = new THREE.PerspectiveCamera(30,
  window.innerWidth / window.innerHeight, 0.1, 1000);
const camera1 = new THREE.PerspectiveCamera(30,
  window.innerWidth / window.innerHeight, 0.1, 1000);
const camera2 = new THREE.PerspectiveCamera(30,
  window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer1 = new THREE.WebGLRenderer();
renderer1.setSize(window.innerWidth, window.innerHeight);
renderer1.setClearColor(new THREE.Color(0xEEEEEE));
renderer1.autoClear = false;
document.body.appendChild(renderer1.domElement);

camera0.position.set(0, 0, 20);
camera0.lookAt(new THREE.Vector3(0, 0, 0));
camera1.position.set(0, 0, 20);
camera1.lookAt(new THREE.Vector3(0, 0, 0));
camera2.position.set(0, 0, 20);
camera2.lookAt(new THREE.Vector3(0, 0, 0));

const controls0 = new THREE.OrbitControls(camera0, renderer1.domElement);
controls0.enablePan = false;
controls0.addEventListener('change', (o) => {
  gui.updateDisplay();
});
const controls1 = new THREE.OrbitControls(camera1, renderer1.domElement);
controls1.enablePan = false;
controls1.addEventListener('change', (o) => {
  gui.updateDisplay();
});
const controls2 = new THREE.OrbitControls(camera2, renderer1.domElement);
controls2.enablePan = false;
controls2.addEventListener('change', (o) => {
  gui.updateDisplay();
});

const guiFov = {
  '視野角': camera1.fov,
};

const guiScenes = {
  showScene1: true,
  showScene2: true
};

const guiLineColors = {
  lineColor1: '#00ff00',
  lineColor2: '#0000ff',
};

const guiControls = {
  controls1Enabled: true,
  controls2Enabled: true,
};

const gui = new dat.GUI();

gui.add(guiFov, '視野角', 0, 200).step(1).onChange((v) => {
  camera0.fov = v;
  camera1.fov = v;
  camera2.fov = v;
  camera0.updateProjectionMatrix();
  camera1.updateProjectionMatrix();
  camera2.updateProjectionMatrix();
});
gui.add(guiScenes, 'showScene1')
  .name('球A表示')
  .onChange((v) => {
    scene1.traverse((o) => {
      o.visible = v;
    });
  });
gui.add(guiScenes, 'showScene2')
  .name('球B表示')
  .onChange((v) => {
    scene2.traverse((o) => {
      o.visible = v;
    });
  });
gui.addColor(guiLineColors, 'lineColor1')
  .name('球A線色')
  .onChange((v) => {
    curveMaterial1.color.setHex(parseInt(v.replace('#', '0x')));
  });
gui.addColor(guiLineColors, 'lineColor2')
  .name('球B線色')
  .onChange((v) => {
    curveMaterial2.color.setHex(parseInt(v.replace('#', '0x')));
  });
gui.add(guiControls, 'controls1Enabled')
  .name('球A操作')
  .onChange((v) => {
    controls1.enabled = v;
  });
gui.add(guiControls, 'controls2Enabled')
  .name('球B操作')
  .onChange((v) => {
    controls2.enabled = v;
  });

const sphereGeometry = new THREE.SphereGeometry(4.99, 64, 64);
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  transparent: true,
  opacity: 1.0,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene0.add(sphere);

const linesCount = 18;
// const lineColor1 = 0x00ff00;
const lineColor1 = parseInt(guiLineColors.lineColor1.replace('#', '0x'));

const curve = new THREE.EllipseCurve(
  0, 0,
  5, 5,
  0, 2 * Math.PI,
  false,
  0
);
const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
const curveMaterial1 = new THREE.LineBasicMaterial({ color: lineColor1 });
for (let i = 0; i < linesCount; i++) {
  const ellipse1 = new THREE.Line(curveGeometry, curveMaterial1);
  const ellipse2 = new THREE.Line(curveGeometry, curveMaterial1);
  const ellipse3 = new THREE.Line(curveGeometry, curveMaterial1);
  ellipse1.rotation.x = i * Math.PI / linesCount;
  ellipse2.rotation.y = i * Math.PI / linesCount;
  ellipse3.rotation.x = 0.5 * Math.PI;
  ellipse3.rotation.y = i * Math.PI / linesCount;
  scene1.add(ellipse1);
  scene1.add(ellipse2);
  scene1.add(ellipse3);
}

// const lineColor2 = 0x0000ff;
const lineColor2 = parseInt(guiLineColors.lineColor2.replace('#', '0x'));

const curveMaterial2 = new THREE.LineBasicMaterial({ color: lineColor2 });

//経線を描画(垂直方向の円)
for (let i = 0; i < linesCount; i++) {
  const latitude = new THREE.Line(curveGeometry, curveMaterial2);
  latitude.rotation.y = (Math.PI * i) / linesCount - Math.PI / 2;
  scene2.add(latitude);
}

const latitudeLines = new THREE.Group();

// 赤道の線
latitudeLines.add(createLatitudeLine(5, 0));

// 北半球の線
for (let i = 0; i <= linesCount; i++) {
  const latitude = (i * 90 / (linesCount / 2 + 1)) * Math.PI / 180;
  const y = 5 * Math.sin(latitude);
  const radius = 5 * Math.cos(latitude);
  latitudeLines.add(createLatitudeLine(radius, y));
}

// 南半球の線
for (let i = 0; i <= linesCount; i++) {
  const latitude = (-i * 90 / (linesCount / 2 + 1)) * Math.PI / 180;
  const y = 5 * Math.sin(latitude);
  const radius = 5 * Math.cos(latitude);
  latitudeLines.add(createLatitudeLine(radius, y));
}

scene2.add(latitudeLines);

function createLatitudeLine(radius, y) {
  const segments = 64;
  const curve = new THREE.EllipseCurve(
    0, 0,
    radius, radius,
    0, 2 * Math.PI,
    false
  );

  const points = curve.getPoints(segments);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  // const material = new THREE.LineBasicMaterial({ color: lineColor2 });
  const line = new THREE.Line(geometry, curveMaterial2);

  line.position.y = y;
  line.rotateX(Math.PI / 2);

  return line;
}

function animate() {
  requestAnimationFrame(animate);

  renderer1.clear();
  renderer1.render(scene0, camera0);
  if (guiScenes.showScene1) {
    renderer1.render(scene1, camera1);
  }
  // renderer1.clearDepth();
  if (guiScenes.showScene2) {
    renderer1.render(scene2, camera2);
  }
}

animate();