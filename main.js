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
        "vx": 0,
        "vy": 0,
        "vz": 0
      }
    ], 3)
    
    d3.forceLink([{"source": 0, "target": 1}])
    let nodes = simulation.nodes()
    simulation.on("tick", () => nodes = simulation.nodes())

    let camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.z = 2;

    let scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();

    let mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    let renderer = new THREE.WebGLRenderer({canvas: $("#3d-graph").get()});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );


    window.addEventListener( 'resize', onWindowResize );


    function animate() {

      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;

      renderer.render( scene, camera );

    }
}