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

  const myGraph = ForceGraph3D()(document.getElementById("3d-graph"))
    .graphData({
      "nodes": [
          {
            "id": "id1",
            "name": "name1",
            "val": 1
          },
          {
            "id": "id2",
            "name": "name2",
            "val": 10
          }
      ],
      "links": [
          {
              "source": "id1",
              "target": "id2"
          }
      ]
  })
  .width($("#content").innerWidth())
  .backgroundColor($("body").css("--background"))
}