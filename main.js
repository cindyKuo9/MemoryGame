const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return number;
    }
  },

  getCardContent(index) {
    number = this.transformNumber((index % 13) + 1);
    symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
    <img src="${symbol}">
    <p>${number}</p>`;
  },

  getCardElement(index) {
    return `  <div class="card back" data-index="${index}"></div>`;
  },

  displayCards(indexArray) {
    cards = document.querySelector("#cards");
    cards.innerHTML = indexArray.map(index => this.getCardElement(index)).join('');
  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(card.dataset.index);
        return;
      }
      card.classList.add("back");
      card.innerHTML = null;
      return;
    })

  },

  pairCards(...cards) {
    cards.map(card => card.classList.add("paired"))
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong");
      card.addEventListener("animationend", event => {
        event.target.classList.remove("wrong")
      }, { once: true });
    })

  },
  showGameFinshed() {
    const div = document.createElement('div');
    div.classList.add('completed');
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>`;

    const header = document.querySelector("#header");
    header.before(div);
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const model = {
  revealCards: [],
  score: 0,
  triedTimes: 0,

  isRevealCardsMatched() {
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13;
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCard() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  dispatchCardAction(card) {

    if (!card.classList.contains("back")) {
      return;
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card);
        model.revealCards.push(card);
        view.renderTriedTimes(++model.triedTimes);

        if (model.isRevealCardsMatched()) {
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealCards);
          view.renderScore(model.score += 10)

          model.revealCards = [];
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinshed();
          } else {
            this.currentState = GAME_STATE.FirstCardAwaits;
          }
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealCards)
          setTimeout(this.resetCards, 1000);
        }
        break;
    }

    console.log(this.currentState);
    console.log(model.revealCards.map(card => card.dataset.index));
  },
  resetCards() {
    view.flipCards(...model.revealCards);
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
}

controller.generateCard();

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", function cardOnClick(event) {
    controller.dispatchCardAction(card);
  })
})