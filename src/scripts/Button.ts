import type P5 from "p5";
import Render from "./Render";

export function easeOutElastic(x: number, p5: P5) {
  const c4 = (2 * 180) / 3;
  return x === 0
    ? 0
    : x === 1
    ? 1
    : p5.pow(2, -10 * x) * p5.sin((x * 10 - 0.75) * c4) + 1;
}

export default class Button {
  ap: number; // 0 to 1
  x: number;
  y: number;
  w: number;
  h: number;
  bc: P5.Color;
  bc2: P5.Color;
  renderContent: () => void;
  clicked: () => void;

  constructor(
    [x, y, w, h]: [number, number, number, number],
    bc: P5.Color,
    p5: P5,
    render: Render,
    renderContent: () => void,
    clicked: () => void
  ) {
    this.ap = 1;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.bc = bc;
    this.bc2 = p5.lerpColor(bc, p5.color(0), 0.25);
    this.renderContent = renderContent;
    this.clicked = () => {
      render.playSound(render.clickingSound);
      this.ap = 0; // start animation
      clicked();
    };
  }

  checkHover(mx: number, my: number) {
    const hw = this.w / 2,
      hh = this.h / 2;
    return (
      mx > this.x - hw &&
      mx < this.x + hw &&
      my > this.y - hh &&
      my < this.y + hh
    );
  }

  render(p5: P5) {
    if (this.ap < 1) this.ap = Math.min(this.ap + 0.022, 1);

    // render button
    p5.push();
    p5.translate(this.x, this.y);
    if (this.ap < 0.08) {
      this.ap = 0.08;
    }
    let scaleFactor = easeOutElastic(this.ap, p5);
    scaleFactor *= 0.35; // animated range
    p5.scale(0.65 + scaleFactor, 1.35 - scaleFactor); // 1 - or + range

    p5.noStroke();
    p5.fill(p5.lerpColor(p5.color(200), this.bc, this.ap * 2));
    p5.rect(0, 0, this.w, this.h, 10);
    p5.fill(p5.lerpColor(p5.color(200), this.bc2, this.ap * 2));
    p5.rect(0, this.h * 0.5, this.w, this.h / 4, 0, 0, 10, 10);
    this.renderContent();
    p5.pop();
  }
}
