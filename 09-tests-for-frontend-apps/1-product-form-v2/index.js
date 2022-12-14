import SortableList from "../2-sortable-list/index.js";
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  element;
  formElements = {};
  subElements = {};

  constructor(productId = null) {
    this.productId = productId;
  }

  get templateTitle() {
    return `<div
        class="form-group
        form-group__half_left"
      >
        <fieldset>
          <label class="form-label">Название товара</label>
          <input
            required=""
            type="text"
            name="title"
            class="form-control"
            placeholder="Название товара"
            id="title"
          />
        </fieldset>
      </div>`;
  }

  get templateDescription() {
    return `<div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea
          required=""
          class="form-control"
          name="description"
          data-element="productDescription"
          placeholder="Описание товара"
          id="description"
        ></textarea>
      </div>`;
  }

  get templateUploadImage() {
    return `<div
        class="form-group form-group__wide"
        data-element="sortable-list-container"
      >
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list">
          </ul>
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>`;
  }

  getTemplateImageList(data = []) {
    return data.map((item) => {
      const element = document.createElement("li");
      element.classList.add("products-edit__imagelist-item");

      element.innerHTML = `<input
          type="hidden"
          name="url"
          value="${item.url}"
        />
        <input
          type="hidden"
          name="source"
          value="${item.source}"
        />
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab" />
          <img
            class="sortable-table__cell-img"
            alt="Image"
            src="${item.url}"
          />
          <span>${item.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete" />
        </button>`;

      return element;
    });
  }

  get templateCategory() {
    return `<div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
        </select>
      </div>`;
  }

  getTemplateOptionsCategory(data) {
    return data.subcategories?.map(
      (item) => `<option value="${item.id}">
        ${escapeHtml(data.title + " > " + item.title)}
      </option>`
    );
  }

  get templatePriceAndDiscount() {
    return `<div class="form-group form-group__half_left form-group__two-col">
      <fieldset>
        <label class="form-label">Цена ($)</label>
        <input
          required=""
          type="number"
          name="price"
          class="form-control"
          placeholder="100"
          id="price"
        />
      </fieldset>
      <fieldset>
        <label class="form-label">Скидка ($)</label>
        <input
          required=""
          type="number"
          name="discount"
          class="form-control"
          placeholder="0"
          id="discount"
        />
      </fieldset>
    </div>`;
  }

  get templateQuantityProduct() {
    return `<div class="form-group form-group__part-half">
      <label class="form-label">Количество</label>
      <input
        required=""
        type="number"
        class="form-control"
        name="quantity"
        placeholder="1"
        id="quantity"
      />
    </div>`;
  }

  get templateStatus() {
    return `<div class="form-group form-group__part-half">
      <label class="form-label">Статус</label>
      <select class="form-control" name="status" id="status">
        <option value="1">Активен</option>
        <option value="0">Неактивен</option>
      </select>
    </div>`;
  }

  get templateButton() {
    return `<div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          ${this.productId ? "Сохранить товар" : "Добавить товар"}
        </button>
      </div>`;
  }

  get templateHTML() {
    return `<div class="product-form">
      <form data-element="productForm" class="form-grid">
        ${this.templateTitle}
        ${this.templateDescription}
        ${this.templateUploadImage}
        ${this.templateCategory}
        ${this.templatePriceAndDiscount}
        ${this.templateQuantityProduct}
        ${this.templateStatus}
        ${this.templateButton}
      </form>
    </div>`;
  }

  setCategoriesDataOnForm(data = []) {
    this.formElements.subcategory.innerHTML = data
      .map((item) => this.getTemplateOptionsCategory(item).join(""))
      .join("");
  }

  setProductDataOnForm(data) {
    const {
      title,
      description,
      subcategory,
      price,
      discount,
      quantity,
      status,
    } = this.formElements;

    const sortableImageList = new SortableList({
      items: this.getTemplateImageList(data.images),
    });
    this.subElements.imageListContainer.firstElementChild.append(
      sortableImageList.element
    );

    title.value = data.title;
    description.value = data.description;
    subcategory.value = data.subcategory;
    price.value = data.price;
    discount.value = data.discount;
    quantity.value = data.quantity;
    status.value = data.status;
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.templateHTML;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.formElements = this.subElements.productForm.elements;

    this.initEventListeners();

    this.setCategoriesDataOnForm(await this.loadCategoriesData());
    if (this.productId) {
      this.setProductDataOnForm(await this.loadProductData());
    }

    return this.element;
  }

  async loadCategoriesData() {
    const requestURL = new URL("api/rest/categories", BACKEND_URL);
    requestURL.searchParams.set("_sort", "weight");
    requestURL.searchParams.set("_refs", "subcategory");

    try {
      const data = await fetchJson(requestURL);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async loadProductData() {
    const requestURL = new URL("api/rest/products", BACKEND_URL);
    requestURL.searchParams.set("id", this.productId);

    try {
      const data = await fetchJson(requestURL);
      return data[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  initEventListeners() {
    this.formElements.uploadImage.addEventListener(
      "click",
      this.onUploadImageButtonClickHandler
    );

    this.element.addEventListener("submit", (event) => {
      event.preventDefault();
      this.save();
    });
  }

  async save() {
    const saveFormObject = this.getSendFormObject();

    try {
      const responseURL = new URL("api/rest/products", BACKEND_URL);
      const response = fetchJson(responseURL, {
        method: this.productId ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "sec-fetch-mode": "cors",
        },
        body: saveFormObject,
      });
    } catch (error) {
      throw new Error(error.message);
    }

    if (this.productId) {
      this.element.dispatchEvent(
        new CustomEvent("product-updated", { detail: "Данные обновлены" })
      );
    } else {
      this.element.dispatchEvent(
        new CustomEvent("product-saved", { detail: "Данные сохранены" })
      );
    }
  }

  getSendFormObject() {
    const { imageListContainer } = this.subElements;
    const {
      title,
      description,
      subcategory,
      price,
      discount,
      quantity,
      status,
    } = this.formElements;

    const sendFormObject = {
      id: this.productId,
      title: title.value,
      description: description.value,
      subcategory: subcategory.value,
      price: price.value,
      discount: discount.value,
      quantity: quantity.value,
      status: status.value,
      images: [],
    };

    const imageList = imageListContainer.querySelectorAll(
      ".products-edit__imagelist-item"
    );

    for (const image of imageList) {
      const url = image.querySelector("[name='url']").value;
      const source = image.querySelector("[name='source']").value;
      sendFormObject.images.push({
        url,
        source,
      });
    }

    return sendFormObject;
  }

  onUploadImageButtonClickHandler = (event) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage } = this.formElements;
        const { imageListContainer } = this.subElements;

        formData.append("image", file);

        uploadImage.classList.add("is-loading");
        uploadImage.disable = true;

        const response = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: "Client-ID " + IMGUR_CLIENT_ID,
          },
          body: formData,
        });

        const wrapperForImage = document.createElement("div");
        wrapperForImage.innerHTML = this.getTemplateImageList([
          {
            url: response.data.link,
            source: file.name,
          },
        ]);
        imageListContainer.firstElementChild.append(
          wrapperForImage.firstElementChild
        );

        uploadImage.classList.remove("is-loading");
        uploadImage.disable = false;
      }
    };

    fileInput.hidden = true;
    this.subElements.productForm.append(fileInput);
    fileInput.click();

    fileInput.remove();
  };

  getSubElements() {
    const result = {};
    const elementsDOM = this.element.querySelectorAll("[data-element]");

    for (const subElement of elementsDOM) {
      result[subElement.dataset.element] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.formElements = {};
    this.subElements = {};
  }
}
