import * as THREE from 'three'

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

  const simulation = d3.forceSimulation(
    [
      {
        "index": 0,
        "x": 0/0,
        "y": 0/0,
        "z": 0/0,
        "vx": 0,
        "vy": 0,
        "vz": 0
      },
      {
        "index": 1,
        "x": 0/0,
        "y": 0/0,
        "z": 0/0,
        "vx": 1,
        "vy": 0,
        "vz": 0
      },
      {
        "index": 2,
        "x": 0/0,
        "y": 0/0,
        "z": 0/0,
        "vx": 0,
        "vy": 0,
        "vz": 0
      },
      {
        "index": 3,
        "x": 0/0,
        "y": 0/0,
        "z": 0/0,
        "vx": 0,
        "vy": 0,
        "vz": 0
      },
      {
        "index": 4,
        "x": 0/0,
        "y": 0/0,
        "z": 0/0,
        "vx": 0,
        "vy": 0,
        "vz": 0
      }
    ], 3)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter())

    let nodes = simulation.nodes()
    let links = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i+1; j < nodes.length; j++) {
        links.push({"source": i, "target": j})
      }
    }
    simulation.force("link", d3.forceLink(links))
    simulation.on("tick", () => nodes = simulation.nodes())

    let camera = new THREE.PerspectiveCamera( 70, 1/1, 0.1, 100 );
    camera.position.z = 40;

    let scene = new THREE.Scene();

    let boxes = []
    for (var n of nodes) {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial();

      let mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(n.x, n.y, n.z)
      scene.add(mesh);
      boxes.push(mesh)
    }

    let renderer = new THREE.WebGLRenderer({antialias: true, canvas: $("#3d-graph").get(0)})
    renderer.setClearColor("#00000", 0)
    renderer.setPixelRatio(window.devicePixelRatio * 1/3);
    renderer.setSize($("#3d-graph").parent().width(), $("#3d-graph").parent().width())
    renderer.setAnimationLoop(animate);

    var current = 0
    function animate() {

      for (var i = 0; i < boxes.length; i++) {
        boxes[i].position.set(nodes[i].x, nodes[i].y, nodes[i].z)
      }

      boxes[0].rotation.x += 0.005;
      boxes[0].rotation.y += 0.01;
      camera.position.set(boxes[current].position)

      renderer.render( scene, camera );

    }
}