export default class SortableTable {
  element;
  subElements = {};
  fieldValue = "";
  sortValue = "";

  constructor(headerConfig = [], data = []) {
    this.headerConfig = [...headerConfig];
    this.data = [...data];

    this.render();
  }

  get templateTableHeader() {
    return this.headerConfig
      .map(
        (item) => `<div
          class="sortable-table__cell"
          data-id="${item.id}"
          data-sortable="${item.sortable}"
          data-order="${this.fieldValue === item.id ? this.sortValue : ""}"
        >
          <span>${item.title}</span>
          ${this.fieldValue === item.id ? this.templateArrowTableHeader : ""}
        </div>`
      )
      .join("");
  }

  get templateArrowTableHeader() {
    return `<span
      data-element="arrow"
      class="sortable-table__sort-arrow"
    >
      <span class="sort-arrow"></span>
    </span>`;
  }

  get templateTableBody() {
    return this.data
      .map(
        (item) => `<a
          href="/products/${item.id}"
          class="sortable-table__row"
        >
            ${this.getCellsTableBody(item)}
        </a>
        `
      )
      .join("");
  }

  getCellsTableBody(product) {
    return this.headerConfig
      .map((item) =>
        item.template
          ? item.template(product.images)
          : `<div
            class="sortable-table__cell"
          >${product[item.id]}</div>`
      )
      .join("");
  }

  get templateHTML() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div
          data-element="header"
          class="sortable-table__header
          sortable-table__row"
        >
          ${this.templateTableHeader}
        </div>

        <div
          data-element="body"
          class="sortable-table__body"
        >
          ${this.templateTableBody}
        </div>

        <div
          data-element="loading"
          class="loading-line
            sortable-table__loading-line"
        >
        </div>

        <div
          data-element="emptyPlaceholder"
          class="sortable-table__empty-placeholder"
        >
          <div>
            <p>No products satisfies your filter criteria</p>
            <button
              type="button"
              class="button-primary-outline"
            >
              Reset all filters
            </button>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  render() {
    if (this.element) this.remove();
    const element = document.createElement("div");
    element.innerHTML = this.templateHTML;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  sort(fieldValue, sortValue) {
    this.fieldValue = fieldValue;
    this.sortValue = sortValue;

    const directions = {
      asc: 1,
      desc: -1,
    };
    const currentDirection = directions[sortValue];
    const columnType = this.headerConfig.find(
      (item) => item.id === fieldValue
    )?.sortType;

    this.data.sort((itemPrev, itemNext) => {
      if (columnType === "string")
        return (
          currentDirection *
          itemPrev[fieldValue].localeCompare(
            itemNext[fieldValue],
            ["ru", "en"],
            {
              caseFirst: "upper",
            }
          )
        );

      if (columnType === "number")
        return currentDirection * (itemPrev[fieldValue] - itemNext[fieldValue]);
    });

    this.update();
  }

  getSubElements() {
    const result = {};
    const elementsDOM = this.element.querySelectorAll("[data-element]");

    for (const item of elementsDOM) {
      const name = item.dataset.element;
      result[name] = item;
    }

    return result;
  }

  update() {
    this.subElements.header.innerHTML = this.templateTableHeader;
    this.subElements.body.innerHTML = this.templateTableBody;
    this.subElements = this.getSubElements();
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.fieldValue = "";
    this.sortValue = "";
  }
}
