import AbstractView from "./abstract.js";
import {
  SortType
} from "../constants.js";

const createSortTemplate = (currentSortType) => {
  return (
    `<div class="board__filter-list">
      <a href="#" class="board__filter ${currentSortType === SortType.DEFAULT ? `board__filter--active` : ``}" data-sort-type="${SortType.DEFAULT}">SORT BY DEFAULT</a>
      <a href="#" class="board__filter ${currentSortType === SortType.DATE_UP ? `board__filter--active` : ``}" data-sort-type="${SortType.DATE_DOWN}">SORT BY DATE up</a>
      <a href="#" class="board__filter ${currentSortType === SortType.DATE_DOWN ? `board__filter--active` : ``}" data-sort-type="${SortType.DATE_UP}">SORT BY DATE down</a>
    </div>`
  );
};

export default class Sort extends AbstractView {
  constructor(currentSortType) {
    super();
    this._currentSortType = currentSortType;
    this._sortTypeChangeHandler = this._sortTypeChangeHandler.bind(this);
  }
  getTemplate() {
    return createSortTemplate(this._currentSortType);
  }

  _sortTypeChangeHandler(evt) {
    if (evt.target.tagName !== `A`) {
      return;
    }

    evt.preventDefault();
    this._callback.sortTypeHandler(evt.target.dataset.sortType);
  }

  setSortTypeChangeHandler(callback) {
    this._callback.sortTypeHandler = callback;
    this.getElement().addEventListener(`click`, this._sortTypeChangeHandler);
  }
}
