export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    formatHeading = (value) => value,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading(value);

    this.render();
  }

  renderLink() {
    if (!this.link) return "";
    return `<a href="${this.link}" class="column-chart__link">View all</a>`;
  }

  renderData() {
    if (!this.data.length) return;
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    const displayValues = this.data
      .map((item) => {
        return `<div style="--value: ${Math.floor(item * scale).toFixed(
          0
        )}" data-tooltip="${((item / maxValue) * 100).toFixed(0)}%"></div>`;
      })
      .join("");

    return displayValues;
  }

  renderHTMLCode() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${
      this.chartHeight
    }">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.renderLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${
          this.formatHeading
        }</div>
        <div data-element="body" class="column-chart__chart">
          ${this.renderData()}
        </div>
      </div>
    </div>`;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.renderHTMLCode();
    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
  }

  update(data) {
    this.data = data;
    this.render();
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
  }
}
