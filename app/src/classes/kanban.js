import {get, post} from  '../http.js'
import Board from './board.js';
import Card from './card.js';

export default class Kanban {
  boards;
  url;

  constructor(){
    this.boards = [];
    this.url = 'http://localhost:3000'
  }

  add(board) {
    this.boards.push(board);
    
    post(`${this.url}/new-board`, 'json', {
      id: board.id,
      title: board.title
    })
    .then( response => {
      console.log(response);
    })
  }

  addCard(card, boardIndex) {
    this.getBoard(boardIndex).add(card);
    post(`${this.url}/update-all`, 'json', {
      boards: this.toJSON()
    })
    .then( response => {
      console.log(response);
    })
  }

  getBoard(index) {
    return this.boards[index];
  }

  getIndex(id) {
    return this.boards.findIndex( board => board.id == id);
  }

  removeCard(boardIndex, cardIndex) {
    const card = this.getBoard(boardIndex).items.splice(cardIndex, 1)[0];

    get(`${this.url}/delete-card/${boardIndex}/${cardIndex}`)
    .then( response => {
      console.log(response);
    })

    return card;
  }

  insertCard(card, boardIndex, cardIndex) {
    this.getBoard(boardIndex).items.splice(cardIndex + 1, 0, card);
  }

  moveCard(srcBoardIndex, srcCardIndex, targetBoardIndex, targetCardIndex) {
    const srcCard = this.removeCard(srcBoardIndex, srcCardIndex);
    this.insertCard(srcCard, targetBoardIndex, targetCardIndex);

    post(`${this.url}/update-all`, 'json', {
      boards: this.toJSON()
    })
    .then( response => {
      console.log(response);
    })
  }

  updateBoard(id, index, title) {
    this.getBoard(index).title = title;

    post(`${this.url}/update-board`, 'json', {
      id: id,
      title: title
    })
    .then( response => {
      console.log(response);
    })
  }

  removeBoard(index) {
    const id = this.boards[index].id;
    this.boards.splice(index, 1);

    get(`${this.url}/delete-board/${id}`)
    .then( response => {
      console.log(response)
    })
  }

  updateCard(boardIndex, cardIndex, title) {
    const card = this.boards[boardIndex].items[cardIndex];
    card.title = title;

    post(`${this.url}/update-card`, 'json', {
      id: card.id,
      title: title,
      indexBoard: boardIndex
    })
    .then( response => {
      console.log(response);
    })
  }

  async loadBoards() {
    try {
      const data = await get(this.url);

      this.boards = data.boards.map( board => {
        const cards = board.cards.map( card => {
          const newCard = new Card(card.title);
          newCard.id = card.id;
          return newCard;
        });

        const newBoard = new Board(board.title, cards);
        newBoard.id = board.id;

        return newBoard;
      });
    } catch (ex) {
      
    }
  }

  toJSON() {
    const json = this.boards.map( board => {
      const cards = board.items.map( card => {
        return {
          id: card.id,
          title: card.title
        }
      });

      return {
        id: board.id,
        title: board.title,
        cards: cards
      }
    });

    return json;
  }
}
