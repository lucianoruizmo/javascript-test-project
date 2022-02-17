export default class Board {
  id;
  title;
  items;

  constructor(title, items) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.items = [ ...items ];  //Remember that this way, it creates a copy of the received array, instead of referencing the same array.
  }

  getIndex(id) {
    return this.items.findIndex( item => item.id == id);
  }

  get(index) {
    return this.items[index];
  }

  add(card) {
    this.items.push(card);
  }

  get length() {
    return this.items.length;
  }

  getHTML(boardIndex, cards) {
    return `<div class="board" id="board--${this.id}">
              <div class="header">
                <div class="title">
                  ${this.title}
                </div>
                <div class="options">
                  <button class="more-options">...</button>
                  <div class="submenu">
                    <ul>
                      <li><a href="#" class="board-submenu-edit" data-id="${this.id}" data-index="${boardIndex}">Edit</a></li>
                      <li><a href="#" class="board-submenu-delete" data-id="${this.id}" data-index="${boardIndex}">Delete</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="items">
                ${cards.join('')}
              </div>
              <div class="new-item">
                <form action="#" class="form-new">
                  <input type="text" class="new-input text" placeholder="+ Add Another Card">
                  <input type="hidden" class="index-board" value="${boardIndex}">
                </form>
              </div>
            </div>`
  }
}
