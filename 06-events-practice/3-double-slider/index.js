export default class DoubleSlider {
  element;
  subElements = {};
  dragging;

  constructor({
    min = 50,
    max = 150,
    formatValue = (value) => "$" + value,
    selected = { from: min, to: max },
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;

    this.render();
    this.initEventListeners();
  }

  get templateHTMLComponent() {
    return `<div class="range-slider">
    <span data-element="from">${this.formatValue(this.selected.from)}</span>
    <div data-element="inner" class="range-slider__inner">
      <span class="range-slider__progress" data-element="progress" style="left: 0; right: 0">
      </span>
      <span class="range-slider__thumb-left" data-element="thumbLeft" style="left: 0">
      </span>
      <span class="range-slider__thumb-right" data-element="thumbRight" style="right: 0">
      </span>
    </div>
    <span data-element="to">${this.formatValue(this.selected.to)}</span>
  </div>`;
  }

  render() {
    this.element = document.createElement("div");
    this.element.innerHTML = this.templateHTMLComponent;
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  update() {
    const { from, to } = this.subElements;
    from.innerHTML = this.formatValue(this.selected.from.toFixed(0));
    to.innerHTML = this.formatValue(this.selected.to.toFixed(0));
  }

  initEventListeners() {
    this.subElements.thumbLeft.addEventListener(
      "pointerdown",
      this.onThumbPointerDownHandler
    );
    this.subElements.thumbRight.addEventListener(
      "pointerdown",
      this.onThumbPointerDownHandler
    );
  }

  onThumbPointerDownHandler = (e) => {
    e.preventDefault();

    this.dragging = e.target;
    this.element.classList.add("range-slider_dragging");

    document.addEventListener("pointermove", this.onThumbPointerMoveHandler);
    document.addEventListener("pointerup", this.onThumbPointerUpHandler);
  };

  onThumbPointerMoveHandler = (e) => {
    e.preventDefault();

    const { inner, progress, thumbLeft, thumbRight } = this.subElements;
    const { right: fromThumbBoundingRight } = thumbLeft.getBoundingClientRect();
    const { left: toThumbBoundingLeft } = thumbRight.getBoundingClientRect();
    const {
      left: innerBoundingLeft,
      right: innerBoundingRight,
      width: innerBoundingWidth,
    } = inner.getBoundingClientRect();
    const directions = {
      left: "left",
      right: "right",
    };

    let currentDirection;
    let currentThumbCoordinateOnRange;

    switch (this.dragging) {
      case thumbLeft:
        {
          currentDirection = directions.left;
          if (
            e.clientX < toThumbBoundingLeft &&
            e.clientX > innerBoundingLeft
          ) {
            currentThumbCoordinateOnRange = e.clientX - innerBoundingLeft;
          }
        }
        break;
      case thumbRight:
        {
          currentDirection = directions.right;
          if (
            e.clientX > fromThumbBoundingRight &&
            e.clientX < innerBoundingRight
          ) {
            currentThumbCoordinateOnRange = e.clientX - innerBoundingLeft;
          }
        }
        break;
    }

    const changedX = (
      (currentThumbCoordinateOnRange / innerBoundingWidth) *
      100
    ).toFixed(2);

    if (currentDirection === "right") {
      this.dragging.style.right = progress.style.right = 100 - changedX + "%";
    }
    if (currentDirection === "left") {
      this.dragging.style.left = progress.style.left = changedX + "%";
    }

    const subtractionMaxMin = this.max - this.min;
    this.selected.from =
      this.min + parseInt(thumbLeft.style.left) * 0.01 * subtractionMaxMin;
    this.selected.to =
      this.max - parseInt(thumbRight.style.right) * 0.01 * subtractionMaxMin;

    this.update();
  };

  onThumbPointerUpHandler = (e) => {
    this.element.classList.remove("range-slider_dragging");

    document.removeEventListener("pointermove", this.onThumbPointerMoveHandler);
    /* document.removeEventListener("pointerup", this.onThumbPointerUpHandler); */

    this.element.dispatchEvent(
      new CustomEvent("range-select", {
        detail: this.getValues(),
        bubbles: true,
      })
    );
  };

  getValues() {
    return { from: this.selected.from, to: this.selected.to };
  }

  getSubElements(parent = this.element) {
    const result = {};
    const elementsDOM = parent.querySelectorAll("[data-element]");

    for (const subElement of elementsDOM) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    document.removeEventListener("pointerdown", this.onThumbPointerDownHandler);
    document.removeEventListener("pointermove", this.onThumbPointerMoveHandler);
    document.removeEventListener("pointerup", this.onThumbPointerUpHandler);

    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
