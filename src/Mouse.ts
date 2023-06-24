import type { Canvas, Item } from "./Canvas";
import type { Sheet } from "./Sheet";

export type Coordinate = {x:number, y:number};

enum MouseTools {
  PAN,
  SELECT,
  DRAW,
  TEXT,
  VIDEO,
  IMAGE,
  ROTATE,
  MATH
}

export class Mouse {
  x: number;
  y: number;

  tool: MouseTools;

  history: Array<Coordinate>;
  historyLimit: number;
  start: Coordinate;
  dragging: Array<boolean>;
  firstClick: boolean;

  constructor(historyLimit: number = 100) {
    this.tool = MouseTools.SELECT;
    this.historyLimit = historyLimit;
    this.dragging = [false, false, false, false];
    this.firstClick = false;
  }

  isDragging(): boolean { for(let d of this.dragging) if(d) return true; }

  mouseDown(e: MouseEvent, canvas: Canvas): any{
    this.start.x = e.x; this.start.y = e.y;
    this.dragging[e.button] = true;
    
    if(e.button == 0) {
      this.firstClick = true;
      setTimeout(() => this.firstClick = false, 500);
    }

    const selectTools = [MouseTools.SELECT];
    if(this.toolContain(selectTools, this.tool)){
      if(!e.ctrlKey) canvas.clearSelected();
      const sel = canvas.itensWithPoint({x: e.x, y: e.y});
      canvas.addSelected(sel);
      this.firstClick = false;
    }
  }

  mouseUp(e: MouseEvent, canvas: Canvas, itens: Array<Item>, pos: Sheet){
    if(!this.dragging[e.button]) return;
    this.dragging[e.button] = false;
    canvas.render();
  }

  mouseMove(e: MouseEvent, canvas: Canvas, itens: Array<Item>, pos: Sheet){
    if(!this.isDragging()) return;
    let dx = e.x - this.start.x;
    let dy = e.y - this.start.y;
    if(current_item >= 0){
      itens[current_item].x += dx;
      itens[current_item].y += dy;
    } else {
      pos.center = {
        x: pos.center.x + dx/pos.zoom,
        y: pos.center.y + dy/pos.zoom
      }
    }
    canvas.render(itens);

    this.start.x = e.x;
    this.start.y = e.y;
  }

  mouseWheel(e: WheelEvent, pos: Sheet) {
    // let {deltaX, deltaY, deltaZ, deltaMode, x, y} = e;
    let speedZoom = 0.1;
    if(e.ctrlKey)
      return pos.zoom += Math.sign(e.deltaY) * (e.altKey ? speedZoom / 2 : speedZoom); 
    else if(e.shiftKey) return pos.center.x += e.deltaY; 
    else if(e.altKey) return; 
    else return pos.center.y += e.deltaY; 
  }

  registerHistory(reg: {x: number, y: number}) {
    if(this.history.push(reg) > this.historyLimit){
      this.history.shift();
    }
  }

  clearHistory() { this.history = []; }

  toolContain(tolls: Array<MouseTools>, tool: MouseTools): boolean {
    for(let t of tolls)
      if(t === tool) return true;
    return false;
  }

}
