import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const hobbies = ["programmer", "space pirate", "linguist", "conlanger", "card counter", "crocheter", "earthbounder", "FOSSer", "3d printer", "toki ponist", "wannabe polymath"]

const now = new Date();
const dayOfYear = (Math.floor(now/8.64e7) % 365)/365 * 360;
$("html")[0].style.setProperty('--accent', `hsl(${dayOfYear}deg 86% 47%)`);

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
  for (let i of node_ids.slice(1)) {
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
  for (let n of nodes) {
    let geometry = new THREE.BoxGeometry();
    let material = new THREE.MeshBasicMaterial();

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(n.x, n.y, n.z)
    scene.add(mesh);
    boxes.push(mesh)
  }

  let lines = []
  for (let l of links) {
    let geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(l.source.x, l.source.y, l.source.z), new THREE.Vector3(l.target.x, l.target.y, l.target.z)])
    let material = new THREE.LineBasicMaterial({color: 0x0000ff});

    let mesh = new THREE.Line(geometry, material);
    mesh.frustumCulled = false;
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

  let current = 0

  changeTargetTo()

  function animate() {

    for (let i = 0; i < boxes.length; i++) {
      boxes[i].position.set(nodes[i].x, nodes[i].y, nodes[i].z)
    }

    for (let i = 0; i < lines.length; i++) {
      let l = links[i]
      lines[i].geometry.setFromPoints([new THREE.Vector3(l.source.x, l.source.y, l.source.z), new THREE.Vector3(l.target.x, l.target.y, l.target.z)])
    }

    boxes[0].rotation.x -= 0.005;
    boxes[0].rotation.y -= 0.01;
    controls.update()
    renderer.render(scene, camera);

  }

  function changeTargetTo() {
    let box = boxes[current]
    let counter = 0
    let interval = setInterval(() => {
      controls.target.lerp(box.position, (++counter)/10)
      if (counter >= 10) clearInterval(interval)
    }, 25)
    $("#info-card-header").html(nodes[current].id)
    $("#info-card-next").html("")
    for (let n = 0; n < nodes.length; n++) {
      let node = nodes[n]
      if (node != nodes[current] && node.tags.some(r => nodes[current].tags.includes(r))) {
        $("#info-card-next").append(`<div class="info-card-btn">${node.id}</div>`)
        $("#info-card-next").children().last().on("click", (
            () => {
              current = n
              changeTargetTo()
            })) // hacky workaround
      }
    }
    $("#info-card-next").children().first().css("border-top-left-radius", "15px")
    $("#info-card-next").children().first().css("border-top-right-radius", "15px")
    $("#info-card-next").children().last().css("border-bottom-left-radius", "15px")
    $("#info-card-next").children().last().css("border-bottom-right-radius", "15px")
  }
}