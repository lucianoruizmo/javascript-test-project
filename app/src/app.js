import Board from './classes/board.js'
import Card from './classes/card.js'
import Kanban from './classes/kanban.js'

let dropOk = false;
const kanban = new Kanban();

await kanban.loadBoards();

const container = document.querySelector("#container");
const newBoardButton = document.querySelector("#new-board-button");

newBoardButton.addEventListener('click', addBoard);

renderUI();

function renderUI() {
  const boardsHTML = kanban.boards.map( (board, boardIndex) => {
    const cardsHTML = board.items.map ( (card, cardIndex) => {
      return card.getHTML(board, boardIndex, cardIndex);
    })

    return board.getHTML(boardIndex, cardsHTML);
  })

  container.innerHTML = boardsHTML;
  enableNewCard();

  enableDragAndDropEvents();
}

function addBoard(e) {
  const name = prompt("Name of the new board?");
  if (name) {
    const board = new Board(name, []);
    kanban.add(board);
    renderUI();
  }
}

function enableNewCard() {
  document.querySelectorAll(".form-new").forEach( form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const text = form.querySelector(".text").value;
      const card = new Card(text);
      const boardIndex = form.querySelector(".index-board").value;
      kanban.addCard(card, boardIndex);
      renderUI();
    })
  })

  configureSubmenues();
}

function configureSubmenues() {
  const moreButtons = document.querySelectorAll(".more-options");
  moreButtons.forEach( button => {
    button.addEventListener("click", showMoreOptions);
  })

  const editBoardButton = document.querySelectorAll(".board-submenu-edit");
  const deleteBoardButton = document.querySelectorAll(".board-submenu-delete");
  const editCardButton = document.querySelectorAll(".card-submenu-edit");
  const deleteCardButton = document.querySelectorAll(".card-submenu-delete");

  editBoardButton.forEach( button => {
    button.addEventListener("click", editBoard);
  })
  deleteBoardButton.forEach( button => {
    button.addEventListener("click", deleteBoard);
  })
  editCardButton.forEach( button => {
    button.addEventListener("click", editCard);
  })
  deleteCardButton.forEach( button => {
    button.addEventListener("click", deleteCard);
  })
}

function showMoreOptions(e) {
  const submenu = e.target.nextElementSibling;
  submenu.classList.toggle("submenu-active");
}

window.addEventListener("click", e => {
  if(!e.target.matches(".more-options")) {
    const menus = Array.from(document.querySelectorAll(".submenu-active"));
    menus.forEach( menu => {
      if(menu.classList.contains("submenu-active")) {
        menu.classList.remove("submenu-active");
      }
    })
  }
})

function editBoard(e) {
  const id = e.target.getAttribute("data-id");
  const index = e.target.getAttribute("data-index");
  const currentTitle = kanban.getBoard(index).title;
  const title = prompt("New Board Title:", currentTitle);

  if (title) {
    kanban.updateBoard(id, index, title);
    renderUI();
  }
}

function deleteBoard(e) {
  const index = e.target.getAttribute("data-index");
  kanban.removeBoard(index);
  renderUI();
}

function editCard(e) {
  const cardIndex = e.target.getAttribute("data-index");
  const boardIndex = e.target.getAttribute("data-board-index");
  const currentTitle = kanban.getBoard(boardIndex).get(cardIndex).title;
  const title = prompt("New Card Title:", currentTitle);

  if (title) {
    kanban.updateCard(boardIndex, cardIndex, title);
    renderUI();
  }
}

function deleteCard(e) {
  const cardIndex = e.target.getAttribute("data-index");
  const boardIndex = e.target.getAttribute("data-board-index");
  kanban.removeCard(boardIndex, cardIndex);
  renderUI();
}

//Drag and Drop.

const classes = {
  hide: 'hide',
  placeholder: 'placeholder',
  active: 'placeholder-active'
}

function enableDragAndDropEvents() {
  const cards = document.querySelectorAll(".card");

  cards.forEach( card => {
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);
  });

  const boards = document.querySelectorAll(".board");
  boards.forEach(board => {
    board.addEventListener('dragenter', dragEnter);
    board.addEventListener('dragover', dragOver);
    board.addEventListener('dragleave', dragLeave);
    board.addEventListener('drop', drop);
  })
}

function dragStart(e) {
  const boardId = e.target.getAttribute("data-board-id");
  const cardId = e.target.id;

  e.dataTransfer.setData("text/plain", JSON.stringify({ boardId, cardId }))
  e.target.classList.add(classes.hide);
}

function dragEnd(e) {
  e.target.classList.remove(classes.hide);
}

function dragEnter(e) {
  e.preventDefault();
  const item = e.target;
  dropOk = true;

  if (item.classList.contains(classes.placeholder)) {
    item.classList.add(classes.active);
  }
}

function dragOver(e) {
  e.preventDefault();

  const item = e.target;

  if (item.classList.contains(classes.placeholder) || item.classList.contains("board")) {
    item.classList.add(classes.active);
  } else if (item.getAttribute('data-id') != undefined) {
    const id = item.getAttribute('data-id');
    document.querySelector('#' + id).querySelector('.placeholder').classList.add(classes.active);
  }
}

function dragLeave(e) {
  document.querySelectorAll("." + classes.active).forEach( item => item.classList.remove(classes.active));
}

function drop(e) {
  e.preventDefault();

  let target, id;

  if (e.target.getAttribute('data-id') == undefined) {
    target = e.target;
  } else {
    id = e.target.getAttribute('data-id');
    target = document.querySelector('#' + id);
  }

  if (!dropOk) return false;

  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
  const draggable = document.querySelector('#' + data.cardId);

  let targetBoardId, targetCardId;

  if (target.classList.contains('card')) {
    targetBoardId = target.parentElement.parentElement.id;
    targetCardId = target.id;
    target.insertAdjacentElement('afterend', draggable);
  } else if (target.classList.contains('board')) {
    targetBoardId = target.id;
    targetCardId = undefined;
    target.querySelector('.items').appendChild(draggable);
  }

  if (!targetCardId && !targetBoardId) return false;

  targetBoardId = targetBoardId.split('--')[1];
  targetCardId = targetCardId?.split('--')[1] ?? -1;
  data.cardId = data.cardId.split('--')[1];
  data.boardId = data.boardId.split('--')[1];

  const indexBoardSrc = kanban.getIndex(data.boardId);
  const indexBoardTarget = kanban.getIndex(targetBoardId);
  const indexCardSrc = kanban.getBoard(indexBoardSrc).getIndex(data.cardId);
  const indexCardTarget = (targetCardId === -1) ? kanban.getBoard(indexBoardTarget).length : kanban.getBoard(indexBoardTarget).getIndex(targetCardId);

  kanban.moveCard(indexBoardSrc, indexCardSrc, indexBoardTarget, indexCardTarget);

  draggable.classList.remove(classes.hide);
  renderUI();
  console.log(kanban);
}
