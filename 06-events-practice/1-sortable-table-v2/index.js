export default class SortableTable {
  element;
  sorted = { id: "", order: "" };
  subElements = {};
  isSortLocally = true;

  constructor(headersConfig = [], { data = [], sorted = {} } = {}) {
    this.headersConfig = [...headersConfig];
    this.data = [...data];
    this.sorted = sorted;

    this.render();
    this.sort(sorted.id, sorted.order);
    this.initEventListeners();
  }

  get templateTableHeader() {
    return this.headersConfig
      .map(
        (item) => `<div
          class="sortable-table__cell"
          data-id="${item.id}"
          data-sortable="${item.sortable}"
          data-order=""
        >
          <span>${item.title}</span>
          <span
            data-element="arrow"
            class="sortable-table__sort-arrow"
          >
            <span class="sort-arrow"></span>
          </span>
        </div>`
      )
      .join("");
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
    return this.headersConfig
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
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, sortValue);
    } else {
      this.sortOnServer();
    }

    this.update();
  }

  sortOnClient(fieldValue, sortValue) {
    const directions = {
      asc: 1,
      desc: -1,
    };
    const currentDirection = directions[sortValue];
    const columnType = this.headersConfig.find(
      (item) => item.id === fieldValue
    )?.sortType;

    this.subElements.header.querySelector(
      `[data-id="${fieldValue}"]`
    ).dataset.order = sortValue;

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
  }

  sortOnServer() {}

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
    const { body } = this.subElements;
    body.innerHTML = this.templateTableBody;
  }

  initEventListeners() {
    document.addEventListener("pointerdown", this.pointerDownSortHandler);
  }

  removeEventListeners() {
    document.removeEventListener("pointerdown", this.pointerDownSortHandler);
  }

  pointerDownSortHandler = (event) => {
    const currentTarget = event.target.closest(
      ".sortable-table__cell[data-id]"
    );

    if (currentTarget.dataset.sortable === "true") {
      if (this.sorted.id !== currentTarget.dataset.id) {
        this.subElements.header.querySelector(
          `[data-id="${this.sorted.id}"]`
        ).dataset.order = "";
        this.sorted.id = currentTarget.dataset.id;
      }

      this.sorted.order =
        currentTarget.dataset.order === "desc" ? "asc" : "desc";
      this.sort(this.sorted.id, this.sorted.order);
    }
  };

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    this.element = null;
    this.subElements = {};
    this.sorted.id = "";
    this.sorted.order = "";
    this.sorted = {};
  }
}
