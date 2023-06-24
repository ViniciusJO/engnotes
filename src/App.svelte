<script lang="ts">
  import { onMount } from "svelte";
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let gridSize = [25,5];

  type Position = {
    center: {
      x: number;
      y:number
    };
    zoom: number;
  };

  type Item = {
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  };

  let itens: Array<Item> = [];
  itens.push({x: 100, y:100, width: 150, height: 150, color: "#ff9911"});
  itens.push({x: 300, y:300, width: 150, height: 150, color: "#ff7700"});
  itens.push({x: 1000, y:1000, width: 150, height: 150, color: "#a010cc"});

  let pos: Position;

  $: console.log(pos?.center.x, pos?.center.y, pos?.zoom);
  
  onMount(() => {
    pos = {center: {x: 0, y: 0}, zoom: 1};
    resize();
  });

  function resize(){
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    ctx = canvas.getContext("2d");
    render();
  
  }

  window.addEventListener("resize", resize);

  function render() {
    clearCanvas();

    // Background grid
    ctx.strokeStyle = "#56789a";
    ctx.setLineDash([gridSize[1], gridSize[1]]);
    for(let i=gridSize[0]; i < (canvas.width > canvas.height ? canvas.width : canvas.height); i+= gridSize[0]) {
      if(i<=canvas.width){
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      
      if(i<=canvas.height){
        ctx.beginPath();
        ctx.moveTo(0,i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    }
    ctx.setLineDash([0]);
    
    // Items
    itens.forEach((item: Item, i: number) => {
      ctx.beginPath();
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x,item.y,item.width,item.height);

      let offset = 8;
      if(i === current_item){
        ctx.beginPath();
        ctx.setLineDash([gridSize[1], gridSize[1]])
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 4;
        ctx.strokeRect(item.x-offset,item.y-offset,item.width+2*offset,item.height+2*offset);
        ctx.setLineDash([0]);
        ctx.lineWidth = 1;
      }
    })
  }
  
  function clearCanvas() { ctx.clearRect(0,0,window.innerWidth, window.innerHeight); }

  // function draw(e: MouseEvent){}

  function mouseOnItem(x: number, y: number, item: Item): boolean{
    return (x >= item.x && x <= item.x + item.width) && (y >= item.y && y <= item.y + item.height);
  }

  let current_item: number = 0;
  let isDragging = false;
  let startX: number, startY: number;

  function mouseDown(e: MouseEvent){
    startX = e.x; startY = e.y;
    for(let item in itens){
      if(mouseOnItem(e.x, e.y, itens[item])) {
        console.log(itens[item]);
        current_item = Number(item);
        isDragging = true;
        return;
      }
    }
    isDragging = true;
  }

  function mouseUp(_e: MouseEvent){
    if(!isDragging) return;
    isDragging = false;
    current_item = -1;
    render();
  }

  function mouseMove(e: MouseEvent){
    if(!isDragging) return;
    let dx = e.x - startX;
    let dy = e.y - startY;
    if(current_item >= 0){
      itens[current_item].x += dx;
      itens[current_item].y += dy;
    } else {
      pos.center = {
        x: pos.center.x + dx/pos.zoom,
        y: pos.center.y + dy/pos.zoom
      }
    }
    render();

    startX = e.x;
    startY = e.y;
  }

  function mouseWheel(e: WheelEvent) {
    // let {deltaX, deltaY, deltaZ, deltaMode, x, y} = e;
    let speedZoom = 0.1;
    if(e.ctrlKey)
      return pos.zoom += Math.sign(e.deltaY) * (e.altKey ? speedZoom / 2 : speedZoom); 
    else if(e.shiftKey) return pos.center.x += e.deltaY; 
    else if(e.altKey) return; 
    else return pos.center.y += e.deltaY; 
  }

</script>

<div>
  <canvas 
    bind:this={canvas}
    id="canvas"
    on:mousedown|preventDefault={mouseDown}
    on:mouseup|preventDefault={mouseUp}
    on:mouseout|preventDefault={mouseUp}
    on:mousemove|preventDefault={mouseMove}
    on:mousewheel|preventDefault={mouseWheel}
    on:blur|preventDefault={()=>console.log("blur")}
  >

  </canvas>
</div>

<style>
  :global(body) {
		margin: 0;
		padding: 0;
	}

  div {
    width: 100%;
    height: 100%;
    background-color: #fedca9;
  }

  #canvas {
    display: block;
    touch-action: none;
    -ms-touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }
</style>
