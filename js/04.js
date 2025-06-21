const scene0 = new THREE.Scene();
const scene1 = new THREE.Scene();
const scene2 = new THREE.Scene();

const camera0 = new THREE.PerspectiveCamera(30,
  window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color(0xEEEEEE));
renderer.autoClear = false;
document.body.appendChild(renderer.domElement);

camera0.position.set(0, 0, 20);
camera0.lookAt(new THREE.Vector3(0, 0, 0));

// GUI設定
const guiParams = {
  cameraFov: camera0.fov,
  showSphereA: true,
  showSphereB: true,
  lineColorA: '#00ff00',
  lineColorB: '#0000ff',
  lockSphereA: false,
  lockSphereB: false,
  resetSphereA: function () { resetSphere('A'); },
  resetSphereB: function () { resetSphere('B'); },
  resetBoth: function () { resetBothSpheres(); },
  syncSpheres: function () { syncSpheresToB(); }
};

// GUI作成
const gui = new dat.GUI();
const cameraFolder = gui.addFolder('カメラ設定');
cameraFolder.add(guiParams, 'cameraFov', 10, 120).step(1).name('視野角').onChange((v) => {
  camera0.fov = v;
  camera0.updateProjectionMatrix();
});
cameraFolder.open();

const displayFolder = gui.addFolder('表示設定');
displayFolder.add(guiParams, 'showSphereA').name('球A表示').onChange((v) => {
  ellipsesGroup.visible = v;
});
displayFolder.add(guiParams, 'showSphereB').name('球B表示').onChange((v) => {
  latitudeLines.visible = v;
});
displayFolder.addColor(guiParams, 'lineColorA').name('球A線色').onChange((v) => {
  curveMaterial1.color.setHex(parseInt(v.replace('#', '0x')));
});
displayFolder.addColor(guiParams, 'lineColorB').name('球B線色').onChange((v) => {
  curveMaterial2.color.setHex(parseInt(v.replace('#', '0x')));
});
displayFolder.open();

const controlFolder = gui.addFolder('固定設定');
controlFolder.add(guiParams, 'lockSphereA').name('球A固定');
controlFolder.add(guiParams, 'lockSphereB').name('球B固定');
controlFolder.open();

const actionFolder = gui.addFolder('アクション');
actionFolder.add(guiParams, 'resetSphereA').name('球Aリセット');
actionFolder.add(guiParams, 'resetSphereB').name('球Bリセット');
actionFolder.add(guiParams, 'resetBoth').name('両方リセット');
actionFolder.add(guiParams, 'syncSpheres').name('球Bに同期');
actionFolder.open();

// 球体の背景
const sphereGeometry = new THREE.SphereGeometry(4.99, 64, 64);
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  transparent: true,
  opacity: 0.1,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene0.add(sphere);

// 共通設定
const linesCount = 18;
const sphereRadius = 5;
const lineColor1 = parseInt(guiParams.lineColorA.replace('#', '0x'));
const lineColor2 = parseInt(guiParams.lineColorB.replace('#', '0x'));

// 円曲線の作成関数
function createCircleCurve(radius = sphereRadius) {
  return new THREE.EllipseCurve(
    0, 0,
    radius, radius,
    0, 2 * Math.PI,
    false,
    0
  );
}

// 円の線を作成する関数
function createCircleLine(material, segments = 64) {
  const curve = createCircleCurve();
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments));
  return new THREE.Line(geometry, material);
}

// 平行線（緯線）を作成する関数
function createLatitudeLine(radius, y, material) {
  const segments = 64;
  const curve = createCircleCurve(radius);
  const points = curve.getPoints(segments);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  line.position.y = y;
  line.rotateX(Math.PI / 2);
  return line;
}

// 材料の作成
const curveMaterial1 = new THREE.LineBasicMaterial({ color: lineColor1 });
const curveMaterial2 = new THREE.LineBasicMaterial({ color: lineColor2 });

// 球Aの線（楕円グループ）を生成
const ellipsesGroup = new THREE.Group();
for (let i = 0; i < linesCount; i++) {
  const angle = i * Math.PI / linesCount;

  // X軸回転の円
  const ellipse1 = createCircleLine(curveMaterial1);
  ellipse1.rotation.x = angle;
  ellipsesGroup.add(ellipse1);

  // Y軸回転の円
  const ellipse2 = createCircleLine(curveMaterial1);
  ellipse2.rotation.y = angle;
  ellipsesGroup.add(ellipse2);

  // 水平面内で回転する円
  const ellipse3 = createCircleLine(curveMaterial1);
  ellipse3.rotation.x = 0.5 * Math.PI;
  ellipse3.rotation.y = angle;
  ellipsesGroup.add(ellipse3);
}
scene1.add(ellipsesGroup);

// 球Bの線（緯度・経度線グループ）を生成
const latitudeLines = new THREE.Group();

// 経線を描画（垂直方向の円）
for (let i = 0; i < linesCount; i++) {
  const longitude = createCircleLine(curveMaterial2);
  longitude.rotation.y = (Math.PI * i) / linesCount - Math.PI / 2;
  latitudeLines.add(longitude);
}

// 緯線を描画
// 赤道
latitudeLines.add(createLatitudeLine(sphereRadius, 0, curveMaterial2));

// 北半球と南半球の緯線
const hemisphereDivisions = linesCount / 2 + 1;
for (let i = 1; i <= hemisphereDivisions; i++) {
  // 北半球
  const northLatitude = (i * 90 / hemisphereDivisions) * Math.PI / 180;
  const northY = sphereRadius * Math.sin(northLatitude);
  const northRadius = sphereRadius * Math.cos(northLatitude);
  latitudeLines.add(createLatitudeLine(northRadius, northY, curveMaterial2));

  // 南半球
  const southLatitude = (-i * 90 / hemisphereDivisions) * Math.PI / 180;
  const southY = sphereRadius * Math.sin(southLatitude);
  const southRadius = sphereRadius * Math.cos(southLatitude);
  latitudeLines.add(createLatitudeLine(southRadius, southY, curveMaterial2));
}
scene2.add(latitudeLines);

// 回転関連の関数
function resetSphere(sphereType) {
  if (sphereType === 'A') {
    ellipsesGroup.rotation.set(0, 0, 0);
  } else if (sphereType === 'B') {
    latitudeLines.rotation.set(0, 0, 0);
  }
}

function resetBothSpheres() {
  ellipsesGroup.rotation.set(0, 0, 0);
  latitudeLines.rotation.set(0, 0, 0);
}

function syncSpheresToB() {
  ellipsesGroup.rotation.copy(latitudeLines.rotation);
}

// マウス操作の変数
let isDragging = false;
let dragTarget = null; // 'sphereA', 'sphereB', または null
let previousMousePosition = { x: 0, y: 0 };
const rotationSpeed = 0.005;

// キーボード状態の管理
const keys = {
  shift: false,
  ctrl: false
};

// キーボードイベントリスナー
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'Shift':
      keys.shift = true;
      break;
    case 'Control':
      keys.ctrl = true;
      break;
    case 'h':
    case 'H':
      console.log('press h')
      // 操作方法パネルの表示/非表示を切り替え
      const infoPanel = document.getElementById('info');
      const toggleButton = document.getElementById('toggle-info');

      if (infoPanel && toggleButton) {
        if (infoPanel.classList.contains('hidden')) {
          infoPanel.classList.remove('hidden');
          toggleButton.classList.add('hidden');
        } else {
          infoPanel.classList.add('hidden');
          toggleButton.classList.remove('hidden');
        }
      }
      break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'Shift':
      keys.shift = false;
      break;
    case 'Control':
      keys.ctrl = false;
      break;
  }
});

// マウスイベントリスナー
renderer.domElement.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };

  // 操作対象を決定
  if (keys.shift && !guiParams.lockSphereA) {
    dragTarget = 'sphereA';
  } else if (keys.ctrl && !guiParams.lockSphereB) {
    dragTarget = 'sphereB';
  } else {
    // デフォルトの動作：両方操作可能なら両方回転、そうでなければ優先順位に基づいて決定
    if (!guiParams.lockSphereA && !guiParams.lockSphereB) {
      dragTarget = 'both';
    } else if (!guiParams.lockSphereB) {
      dragTarget = 'sphereB';
    } else if (!guiParams.lockSphereA) {
      dragTarget = 'sphereA';
    } else {
      dragTarget = null;
    }
  }
});

renderer.domElement.addEventListener('mousemove', (e) => {
  if (isDragging && dragTarget) {
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };

    const deltaX = deltaMove.y * rotationSpeed;
    const deltaY = deltaMove.x * rotationSpeed;

    switch (dragTarget) {
      case 'sphereA':
        ellipsesGroup.rotation.x += deltaX;
        ellipsesGroup.rotation.y += deltaY;
        break;
      case 'sphereB':
        latitudeLines.rotation.x += deltaX;
        latitudeLines.rotation.y += deltaY;
        break;
      case 'both':
        ellipsesGroup.rotation.x += deltaX;
        ellipsesGroup.rotation.y += deltaY;
        latitudeLines.rotation.x += deltaX;
        latitudeLines.rotation.y += deltaY;
        break;
    }

    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  dragTarget = null;
});

// マウスホイールによるズーム
renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = 1.1;
  if (e.deltaY < 0) {
    camera0.position.z /= zoomFactor;
  } else {
    camera0.position.z *= zoomFactor;
  }

  // ズーム範囲の制限
  camera0.position.z = Math.max(5, Math.min(50, camera0.position.z));
});

// タッチ操作（モバイル対応）
let initialPinchDistance = null;
let touchTarget = null;

renderer.domElement.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    // タッチでのデフォルト操作対象：両方操作可能なら両方回転
    if (!guiParams.lockSphereA && !guiParams.lockSphereB) {
      touchTarget = 'both';
    } else if (!guiParams.lockSphereB) {
      touchTarget = 'sphereB';
    } else if (!guiParams.lockSphereA) {
      touchTarget = 'sphereA';
    }
  } else if (e.touches.length === 2) {
    initialPinchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
});

renderer.domElement.addEventListener('touchmove', (e) => {
  e.preventDefault();

  if (e.touches.length === 1 && isDragging && touchTarget) {
    const deltaMove = {
      x: e.touches[0].clientX - previousMousePosition.x,
      y: e.touches[0].clientY - previousMousePosition.y
    };

    const deltaX = deltaMove.y * rotationSpeed;
    const deltaY = deltaMove.x * rotationSpeed;

    if (touchTarget === 'sphereA') {
      ellipsesGroup.rotation.x += deltaX;
      ellipsesGroup.rotation.y += deltaY;
    } else if (touchTarget === 'sphereB') {
      latitudeLines.rotation.x += deltaX;
      latitudeLines.rotation.y += deltaY;
    } else if (touchTarget === 'both') {
      ellipsesGroup.rotation.x += deltaX;
      ellipsesGroup.rotation.y += deltaY;
      latitudeLines.rotation.x += deltaX;
      latitudeLines.rotation.y += deltaY;
    }

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2 && initialPinchDistance) {
    const currentDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const zoomChange = initialPinchDistance / currentDistance;
    camera0.position.z *= zoomChange;
    camera0.position.z = Math.max(5, Math.min(50, camera0.position.z));
    initialPinchDistance = currentDistance;
  }
});

renderer.domElement.addEventListener('touchend', () => {
  isDragging = false;
  touchTarget = null;
  initialPinchDistance = null;
});

// 操作説明をコンソールに出力
console.log(`
=== 04.js 操作方法 ===
マウス操作:
- 通常ドラッグ: 両方操作可能なら両方回転、そうでなければ球B優先→球A
- Shift + ドラッグ: 球A単独回転（球A固定時は無効）
- Ctrl + ドラッグ: 球B単独回転（球B固定時は無効）
- マウスホイール: ズーム

タッチ操作:
- シングルタッチドラッグ: 両方操作可能なら両方回転、そうでなければ球B優先→球A
- ピンチ: ズーム

キーボード:
- H キー: 操作方法パネルの表示/非表示切り替え

GUI設定:
- 各球体の表示/非表示
- 各球体の固定/解除
- 色変更
- リセット機能
- 同期機能
`);

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);

  renderer.clear();
  renderer.render(scene0, camera0);

  if (guiParams.showSphereA) {
    renderer.render(scene1, camera0);
  }
  if (guiParams.showSphereB) {
    renderer.render(scene2, camera0);
  }
}

animate();
