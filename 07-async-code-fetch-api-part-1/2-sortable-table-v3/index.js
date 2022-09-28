import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  element;
  sorted = { id: "", order: "" };
  subElements = {};
  cardsHeight = 73;
  countCardsShown = Math.round(window.innerHeight / this.cardsHeight);
  isServerEmpty;
  currentStep = 0;

  constructor(
    headerConfig = [],
    {
      data = [],
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      url = "",
      isSortLocally = false,
    } = {}
  ) {
    this.headerConfig = [...headerConfig];
    this.data = [...data];
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;

    this.render();
  }

  get templateTableHeader() {
    return this.headerConfig
      .map(
        (item) => `<div
          class="sortable-table__cell"
          data-id="${item.id}"
          data-sortable="${item.sortable}"
          data-order=""
        >
          <span>${item.title}</span>
          ${this.templateArrowTableHeader}
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
      <div
        data-element="table"
        class="sortable-table"
      >
        <div
          data-element="header"
          class="sortable-table__header
          sortable-table__row"
        >
        </div>
        <div
          data-element="body"
          class="sortable-table__body"
        >
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

  async render() {
    if (this.element) this.remove();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.templateHTML;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();

    const newURL = this.getDataURL({
      id: this.sorted?.id,
      order: this.sorted?.order,
      start: 0,
      end: this.countCardsShown,
    });

    this.data = await this.getDataFromServer(newURL);

    this.subElements.header.innerHTML = this.templateTableHeader;
    this.subElements.header.querySelector(
      `[data-id="${this.sorted.id}"]`
    ).dataset.order = this.sorted.order;

    this.update();
  }

  async sort() {
    const { id, order } = this.sorted;
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.data = await this.sortOnServer(id, order);
    }
  }

  sortOnClient(id, order) {
    const directions = {
      asc: 1,
      desc: -1,
    };
    const currentDirection = directions[order];
    const columnType = this.headerConfig.find(
      (item) => item.id === id
    )?.sortType;

    this.subElements.header.querySelector(`[data-id="${id}"]`).dataset.order =
      order;

    this.data.sort((itemPrev, itemNext) => {
      if (columnType === "string")
        return (
          currentDirection *
          itemPrev[id].localeCompare(itemNext[id], ["ru", "en"], {
            caseFirst: "upper",
          })
        );

      if (columnType === "number")
        return currentDirection * (itemPrev[id] - itemNext[id]);
    });

    this.update();
  }

  async sortOnServer(id, order) {
    const newSortUrl = this.getDataURL({
      id: id,
      order: order,
      start: this.currentStep,
      end: this.currentStep + this.countCardsShown,
    });
    const newData = await this.getDataFromServer(newSortUrl);

    if (newData.length < this.countCardsShown) {
      this.isServerEmpty = true;
      this.isSortLocally = true;
    }

    this.data = this.currentStep > 0 ? [...this.data, ...newData] : newData;

    this.currentStep += this.countCardsShown;

    this.update();

    this.subElements.header.querySelector(`[data-id="${id}"]`).dataset.order =
      order;

    return newData;
  }

  getDataURL({
    id = this.headerConfig.find((item) => item.sortable).id,
    order = "asc",
    start = 0,
    end = this.countCardsShown,
  }) {
    const dataURL = new URL(this.url);

    dataURL.searchParams.append("_embed", "subcategory.category");
    dataURL.searchParams.append("_sort", id);
    dataURL.searchParams.append("_order", order);
    dataURL.searchParams.append("_start", start);
    dataURL.searchParams.append("_end", end);

    return dataURL;
  }

  async getDataFromServer(url = this.url) {
    const { table } = this.subElements;
    table.classList.add("sortable-table_loading");

    const data = await fetchJson(url);

    table.classList.remove("sortable-table_loading");

    return data;
  }

  getSubElements(parent = this.element) {
    const result = {};
    const elementsDOM = parent.querySelectorAll("[data-element]");

    for (const subElement of elementsDOM) {
      result[subElement.dataset.element] = subElement;
    }

    return result;
  }

  async update() {
    const { body, table } = this.subElements;

    if (!this.data.length) {
      table.classList.add("sortable-table_empty");
      return;
    } else {
      table.classList.remove("sortable-table_empty");
    }

    body.innerHTML = this.templateTableBody;
  }

  initEventListeners() {
    this.subElements.header.addEventListener(
      "pointerdown",
      this.pointerDownSortHandler
    );
    document.addEventListener("scroll", this.scrollingDataLoading);
  }

  removeEventListeners() {
    document.removeEventListener("pointerdown", this.pointerDownSortHandler);
    document.removeEventListener("scroll", this.scrollingDataLoading);
  }

  pointerDownSortHandler = (event) => {
    const currentTarget = event.target.closest(
      ".sortable-table__cell[data-id]"
    );

    if (currentTarget.dataset.sortable === "true") {
      this.currentStep = 0;
      if (this.sorted.id !== currentTarget.dataset.id) {
        this.subElements.header.querySelector(
          `[data-id="${this.sorted.id}"]`
        ).dataset.order = "";
        this.sorted.id = currentTarget.dataset.id;
      }

      this.sorted.order =
        currentTarget.dataset.order === "desc" ? "asc" : "desc";
      this.sort();
    }
  };

  scrollingDataLoading = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (!this.isServerEmpty && clientHeight + scrollTop >= scrollHeight - 5) {
      this.sortOnServer(this.sorted.id, this.sorted.order);
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
