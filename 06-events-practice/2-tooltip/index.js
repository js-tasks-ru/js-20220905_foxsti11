class Tooltip {
  static activeTooltip;
  element;

  constructor() {
    if (!Tooltip.activeTooltip) {
      Tooltip.activeTooltip = this;
    } else {
      return Tooltip.activeTooltip;
    }
  }

  initialize() {
    this.initEventListners();
  }

  showTooltipPointeroverHandle = (e) => {
    const target = e.target.closest("[data-tooltip]");
    if (!target) return;
    this.render(e.target.dataset?.tooltip);

    document.addEventListener("pointermove", this.elementPointermoveHandle);
  };

  elementPointermoveHandle = (e) => {
    this.element.style.top = e.clientY + 20 + "px";
    this.element.style.left = e.clientX + "px";
  };

  hideTooltipPointeroutHandle = (e) => {
    this.remove();

    document.removeEventListener("pointermove", this.elementPointermoveHandle);
  };

  initEventListners() {
    document.addEventListener("pointerover", this.showTooltipPointeroverHandle);
    document.addEventListener("pointerout", this.hideTooltipPointeroutHandle);
  }

  removeEventListeners() {
    document.removeEventListener(
      "pointerover",
      this.showTooltipPointeroverHandle
    );
    document.removeEventListener(
      "pointerout",
      this.hideTooltipPointeroutHandle
    );
  }

  render(textLabel) {
    this.element = document.createElement("div");
    this.element.classList = "tooltip";
    this.element.innerHTML = textLabel;
    document.body.append(this.element);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    this.element = null;
    Tooltip.activeTooltip = null;
  }
}

export default Tooltip;
