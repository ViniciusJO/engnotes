import type { Coordinate } from "./Mouse";

export interface Item {
  x: number;
  y: number;
  color: string;

  geometry: any;

  render(c: CanvasRenderingContext2D): void;
  highlight(c: CanvasRenderingContext2D): void;
  contains(point: Coordinate): boolean;
}

export class Canvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  gridSize: Array<number>;
  itens: Array<Item>;
  selected: Array<number>;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.resize();
    this.ctx = this.canvas.getContext("2d");
  }

  resize(): void {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  clear(): void { this.ctx.clearRect(0,0,window.innerWidth, window.innerHeight); }

  render(itens: Array<Item> = this.itens): void {
    this.renderBackground();

    itens.forEach((item: Item, i: number) => {
      // this.ctx.beginPath();
      // this.ctx.fillStyle = item.color;
      // this.ctx.fillRect(item.x,item.y,item.geometry.width,item.geometry.height);
      item.render(this.ctx);

      let offset = 8;
      if(this.selected.find(el => el === i)){
        // this.ctx.beginPath();
        // this.ctx.setLineDash(this.gridSize);
        // this.ctx.strokeStyle = item.color;
        // this.ctx.lineWidth = 4;
        // this.ctx.strokeRect(item.x-offset,item.y-offset,item.geometry.width+2*offset,item.geometry.height+2*offset);
        // this.ctx.setLineDash([0]);
        // this.ctx.lineWidth = 1;
        item.highlight(this.ctx);
      }
    });
  }

  renderBackground(): void {
    this.ctx.strokeStyle = "#56789a";
    this.ctx.setLineDash([this.gridSize[1], this.gridSize[1]]);
    for(let i=this.gridSize[0]; i < (this.canvas.width > this.canvas.height ? this.canvas.width : this.canvas.height); i+= this.gridSize[0]) {
      if(i<=this.canvas.width){
        this.ctx.beginPath();
        this.ctx.moveTo(i, 0);
        this.ctx.lineTo(i, this.canvas.height);
        this.ctx.stroke();
      }
      
      if(i<=this.canvas.height){
        this.ctx.beginPath();
        this.ctx.moveTo(0,i);
        this.ctx.lineTo(this.canvas.width, i);
        this.ctx.stroke();
      }
    }
    this.ctx.setLineDash([0]);
  }

  addSelected(i: number | Array<number>): void { 
    if(i instanceof Array)
      for(let a of i) this.selected.push(a);
    else this.selected.push(i);
  }

  clearSelected(): void { this.selected = []; }

  addItem(item: Item): Item {
    this.itens.push(item);
    return item;
  }

  removeItem(i: number): Item {
    return this.itens.splice(i,1)[0];
  }

  bringFront(i: number): number {
    let item = this.itens.splice(i, 1)[0];
    if(item) {
      this.itens.splice(i+1,0,item);
      return i+1;
    }
  }

  bringBack(i: number): number {
    let item = this.itens.splice(i, 1)[0];
    if(item){
      this.itens.splice(i-1,0,item);
      return i-1;
    }
  }

  bringAllFront(i: number): number {
    let item = this.itens.splice(i, 1)[0];
    if(item){ 
      this.itens.push(item);
      return this.itens.length - 1;
    }
  }

  bringAllBack(i: number): number {
    let item = this.itens.splice(i, 1)[0];
    if(item){
      this.itens.splice(0,0,item);
      return 0;
    }
  }

  itensWithPoint(pos: Coordinate): Array<number> {
    let arr: number[] = [];
    for(let item in this.itens){
      if(this.itens[item].contains(pos))
        arr.push(Number(item));
    }
    return arr; 
  }
}
