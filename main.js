import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const hobbies = ["programmer", "space pirate", "linguist", "conlanger", "card counter", "crocheter", "earthbounder", "FOSSer", "3d printer", "toki ponist", "wannabe polymath"]

function updateGradient(x, y) {
  let content = $("#content")[0];
  content.setAttribute("style", `background: radial-gradient(circle at ${x - content.getBoundingClientRect().left}px ${y - content.getBoundingClientRect().top}px, var(--primary) 0, var(--accent) 2.5vw, var(--text) 5vw); background-clip: text; -webkit-background-clip: text;`);
}

onmousemove = (e) => {
  if (!matchMedia('(pointer:fine)').matches) return
  updateGradient(e.x, e.y)
  onscroll = (e2) => {
    updateGradient(e.x, e.y)
  }
};



onload = () => {
  setInterval(() => {
    let switchTo = ""
    do {
      switchTo = hobbies[Math.floor(Math.random()*hobbies.length)]
    } while (switchTo == $("#switcher").html())
    $("#switcher").html(switchTo)
  }, 1000)
  let now = new Date();
  let dayOfYear = (Math.floor(now/8.64e7) % 365)/365 * 360;
  $("html")[0].style.setProperty('--accent', `hsl(${dayOfYear}deg 86% 47%)`);

  let exppar = $("exp");
  exppar.children("exs").css("display", "none")
  for (let par of exppar) {
    $(par).on("click", () => {
      if ($(par).children("exs").css("display") == "none") {
        $(par).children("exs").css("display", "inline")
        $(par).children("exs").before("<p id='extra-space'> </p>")
      } else {
        $(par).children("exs").css("display", "none")
        $(par).children("#extra-space").remove()
      }
    })
  }

  const node_ids = [
    {"id": "website", "tags": ["web", "3d"]},
    {"id": "trail", "tags": ["hackclub"]},
    {"id": "blot", "tags": ["hackclub", "3d"]},
    {"id": "quicklearn", "tags": ["math"]},
    {"id": "lambda", "tags": ["math"]},
    {"id": "controller-instrument", "tags": ["bodge", "music"]},
    {"id": "hack-hour-clock", "tags": ["electronics", "hackclub"]},
    {"id": "circuits", "tags": ["math"]},
    {"id": "domino", "tags": ["bodge"]},
    {"id": "planet-sim", "tags": ["bodge"]},
    {"id": "xkcd-guessr", "tags": ["web", "bodge"]},
    {"id": "desmos3d", "tags": ["3d", "math"]}
  ]

  let nodes = [{
    "id": node_ids[0].id,
    "tags": node_ids[0].tags,
    "x": 0,
    "y": 0,
    "z": 0,
    "vx": 0,
    "vy": 0,
    "vz": 0,
    "fx": 0,
    "fy": 0,
    "fz": 0
  }]
  for (var i of node_ids.slice(1)) {
    nodes.push({
      "id": i.id,
      "tags": i.tags,
      "x": 0/0,
      "y": 0/0,
      "z": 0/0,
      "vx": 0,
      "vy": 0,
      "vz": 0
    })
  }
  const simulation = d3.forceSimulation(nodes, 3)
  .force("charge", d3.forceManyBody().strength(-5))
  .force("center", d3.forceCenter());

  nodes = simulation.nodes()
  let links = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i+1; j < nodes.length; j++) {
      if (nodes[i].tags.some(r => nodes[j].tags.includes(r))) links.push({"source": i, "target": j})
    }
  }
  simulation.force("link", d3.forceLink(links).distance(5))
  simulation.on("tick", () => {
    nodes = simulation.nodes()
    links = simulation.force("link").links()
  })

  let camera = new THREE.PerspectiveCamera( 70, 1/1, 0.1, 100 );
  camera.position.z = -40;

  let scene = new THREE.Scene();

  let boxes = []
  for (var n of nodes) {
    var geometry = new THREE.BoxGeometry();
    var material = new THREE.MeshBasicMaterial();

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(n.x, n.y, n.z)
    scene.add(mesh);
    boxes.push(mesh)
  }

  var lines = []
  for (var l of links) {
    var geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(l.source.x, l.source.y, l.source.z), new THREE.Vector3(l.target.x, l.target.y, l.target.z)])
    var material = new THREE.LineBasicMaterial({color: 0x0000ff});

    let mesh = new THREE.Line(geometry, material);
    scene.add(mesh)
    lines.push(mesh)
  }
  

  let renderer = new THREE.WebGLRenderer({antialias: true, canvas: $("#3d-graph").get(0)})
  renderer.setClearColor("#00000", 0)
  renderer.setPixelRatio(window.devicePixelRatio * 1/3);
  renderer.setSize($("#content").width(), $("#content").width())
  renderer.setAnimationLoop(animate);

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.autoRotate = true
  controls.enablePan = false
  controls.enableZoom = false
  controls.maxDistance = 10
  controls.minDistance = 10
  controls.enableDamping = true

  var current = 0

  changeTargetTo(boxes[0])

  function animate() {

    var can_travel_to = []
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].position.set(nodes[i].x, nodes[i].y, nodes[i].z)
    }

    for (var i = 0; i < lines.length; i++) {
      var l = links[i]
      lines[i].geometry.setFromPoints([new THREE.Vector3(l.source.x, l.source.y, l.source.z), new THREE.Vector3(l.target.x, l.target.y, l.target.z)])
    }

    boxes[0].rotation.x -= 0.005;
    boxes[0].rotation.y -= 0.01;
    controls.update()
    renderer.render(scene, camera);

  }

  onkeydown = (e) => {
    if (e.key != "n") return

    current = (current + 1) % nodes.length
    changeTargetTo(boxes[current], controls)
  }

  var can_travel_to = []
  function changeTargetTo(box) {
    can_travel_to = []
    var counter = 0
    var interval = setInterval(() => {
      controls.target.lerp(box.position, (++counter)/10)
      if (counter >= 10) clearInterval(interval)
    }, 25)
    for (var n of nodes) if (n != nodes[current] && n.tags.some(r => nodes[current].tags.includes(r))) can_travel_to.push(n)
    console.log(can_travel_to)
    console.log(changeTargetTo)
}
}