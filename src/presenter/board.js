import {
  render,
  renderPosition,
  replace,
  remove
} from "../utils/render.js";
import {updateItem} from "../utils/common.js";
import TaskPresenter from "./task.js";
import {
  sortTaskUp,
  sortTaskDown
} from "../utils/task.js";
import {
  SortType
} from "../constants.js";
import BoardView from "../view/board.js";
import SortView from "../view/sort.js";
import TaskListView from "../view/task-list.js";
import NoTaskView from "../view/no-task.js";
import LoadMoreButtonView from "../view/load-more-button.js";


const TASKS_COUNT_PER_STEP = 8;

export default class Board {
  constructor(boardContainer) {
    this._boardContainer = boardContainer;
    this._renderedTaskCount = TASKS_COUNT_PER_STEP;
    this._currentSortType = SortType.DEFAULT;
    this._taskPresenter = {};

    this._boardComponent = new BoardView();
    this._sortComponent = new SortView();
    this._taskListComponent = new TaskListView();
    this._noTaskComponent = new NoTaskView();
    this._loadMoreButtonComponent = new LoadMoreButtonView();

    this._handleLoadMoreButtonClick = this._handleLoadMoreButtonClick.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._handleTaskChange = this._handleTaskChange.bind(this);
  }

  init(boardTasks) {
    this._boardTasks = boardTasks.slice();
    this._sourcedBoardTasks = boardTasks.slice();

    render(this._boardContainer, this._boardComponent, renderPosition.BEFOREEND);
    render(this._boardComponent, this._taskListComponent, renderPosition.BEFOREEND);

    this._renderBoard();
  }

  _handleTaskChange(updatedTask) {
    this._boardTasks = updateItem(this._boardTasks, updatedTask);
    this._sourcedBoardTasks = updateItem(this._sourcedBoardTasks, updatedTask);
    this._taskPresenter[updatedTask.id].init(updatedTask);
  }

  _sortTasks(sortType) {
    switch (sortType) {
      case SortType.DATE_UP:
        this._boardTasks.sort(sortTaskUp);
        break;
      case SortType.DATE_DOWN:
        this._boardTasks.sort(sortTaskDown);
        break;
      default:
        this._boardTasks = this._sourcedBoardTasks.slice();
        break;
    }

    this._currentSortType = sortType;
  }

  _renderSort() {
    render(this._boardComponent, this._sortComponent, renderPosition.AFTERBEGIN);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
  }

  _renderTask(task) {
    const taskPresenter = new TaskPresenter(this._taskListComponent);
    taskPresenter.init(task);
    this._taskPresenter[task.id] = taskPresenter;
  }

  _renderTasks(from, to) {
    this._boardTasks
      .slice(from, to)
      .forEach((boardTask) => this._renderTask(boardTask));
  }

  _renderNoTasks() {
    render(this._boardComponent, this._noTaskComponent, renderPosition.BEFOREEND);
  }

  _handleLoadMoreButtonClick() {
    this._renderTasks(this._renderedTaskCount, this._renderedTaskCount + TASKS_COUNT_PER_STEP);
    this._renderedTaskCount += TASKS_COUNT_PER_STEP;

    if (this._renderedTaskCount >= this._boardTasks.length) {
      remove(this._loadMoreButtonComponent);
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._sortTasks(sortType);
    this._clearTaskList();
    this._renderTaskList();
  }

  _renderLoadMoreButton() {
    render(this._boardComponent, this._loadMoreButtonComponent, renderPosition.BEFOREEND);
    this._loadMoreButtonComponent.setClickHandler(this._handleLoadMoreButtonClick);
  }

  _clearTaskList() {
    Object
    .values(this._taskPresenter)
    .forEach((presenter) => presenter.destroy());
    this._taskPresenter = {};
    this._renderedTaskCount = TASKS_COUNT_PER_STEP;
  }

  _renderTaskList() {
    this._renderTasks(0, Math.min(this._boardTasks.length, TASKS_COUNT_PER_STEP));
    if (this._boardTasks.length > TASKS_COUNT_PER_STEP) {
      this._renderLoadMoreButton();
    }
  }

  _renderBoard() {
    if (this._boardTasks.every((task) => task.isArchive)) {
      this._renderNoTasks();
      return;
    }
    this._renderSort();
    this._renderTaskList();
  }
}
