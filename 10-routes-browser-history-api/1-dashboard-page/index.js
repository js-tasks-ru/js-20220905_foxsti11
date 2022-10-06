import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element;
  subElements = {};
  range = this.getRange();

  components = {
    rangePicker: new RangePicker({ from: this.range.from, to: this.range.to }),

    ordersChart: new ColumnChart({
      label: "orders",
      link: "sales",
      url: "api/dashboard/orders",
      range: {
        from: this.range.from,
        to: this.range.to,
      },
    }),

    salesChart: new ColumnChart({
      label: "sales",
      formatHeading: (data) => "$" + data,
      url: "api/dashboard/sales",
      range: {
        from: this.range.from,
        to: this.range.to,
      },
    }),

    customersChart: new ColumnChart({
      label: "customers",
      url: "api/dashboard/customers",
      range: {
        from: this.range.from,
        to: this.range.to,
      },
    }),

    sortableTable: new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`,
    }),
  };

  getRange() {
    const now = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const to = new Date();

    return { from, to };
  }

  get templateHTML() {
    return `<div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <!-- RangePicker component -->
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <!-- column-chart components -->
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div
            data-element="customersChart"
            class="dashboard__chart_customers"
          ></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>`;
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.templateHTML;
    this.element = wrapper.firstElementChild;

    this.getSubElements();
    this.getComponents();
    this.initEventListners();

    return this.element;
  }

  getSubElements() {
    for (const subElement of this.element.querySelectorAll("[data-element]")) {
      this.subElements[subElement.dataset.element] = subElement;
    }
  }

  getComponents() {
    this.subElements.rangePicker.append(this.components.rangePicker.element);
    this.subElements.ordersChart.append(this.components.ordersChart.element);
    this.subElements.salesChart.append(this.components.salesChart.element);
    this.subElements.customersChart.append(
      this.components.customersChart.element
    );
    this.subElements.sortableTable.append(
      this.components.sortableTable.element
    );
  }

  initEventListners() {
    this.element.addEventListener(
      "date-select",
      this.onUpdateRangeSelectHandler
    );
  }

  onUpdateRangeSelectHandler = (event) => {
    this.range = event.detail;
    this.updateComponents();
  };

  async updateComponents() {
    try {
      const { from, to } = this.range;
      const url = new URL("api/dashboard/bestsellers", BACKEND_URL);
      url.searchParams.set("_start", 1);
      url.searchParams.set("_end", 30);
      url.searchParams.set("from", from.toISOString());
      url.searchParams.set("to", to.toISOString());

      const responseData = await fetchJson(url);

      this.components.sortableTable.addRows(responseData);

      this.components.ordersChart.update(from, to);
      this.components.salesChart.update(from, to);
      this.components.customersChart.update(from, to);
    } catch (error) {
      throw new Error(error);
    }
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    Object.values(this.components).forEach((item) => item.destroy());

    this.remove();
    this.element = null;
    this.subElements = {};
    this.components = {};
    this.range = {};
  }
}
