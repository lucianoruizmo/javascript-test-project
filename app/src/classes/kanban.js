export default class Kanban {
  boards;

  constructor(){
    this.boards = [];
  }

  add(board) {
    this.boards.push(board);
  }

  addCard(card, boardIndex) {
    this.getBoard(boardIndex).add(card);
  }

  getBoard(index) {
    return this.boards[index];
  }

  getIndex(id) {
    return this.boards.findIndex( board => board.id == id);
  }

  removeCard(boardIndex, cardIndex) {
    const card = this.getBoard(boardIndex).items.splice(cardIndex, 1)[0];
    return card;
  }

  insertCard(card, boardIndex, cardIndex) {
    this.getBoard(boardIndex).items.splice(cardIndex + 1, 0, card);
  }

  moveCard(srcBoardIndex, srcCardIndex, targetBoardIndex, targetCardIndex) {
    const srcCard = this.removeCard(srcBoardIndex, srcCardIndex);
    this.insertCard(srcCard, targetBoardIndex, targetCardIndex);
  }

  updateBoard(id, index, title) {
    this.getBoard(index).title = title;
  }

  removeBoard(index) {
    const id = this.boards[index].id;
    this.boards.splice(index, 1);
  }

  updateCard(boardIndex, cardIndex, title) {
    const card = this.boards[boardIndex].items[cardIndex];
    card.title = title;
  }
}
