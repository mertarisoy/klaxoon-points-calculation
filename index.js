
const sprint1 = {
  from: {
    left: 972.143,
    top: -13580.984
  },
  to: {
    left: 1484.143,
    top: -11685
  },
};

const sprint2 = {
  from: {
    left: 1484.143,
    top:-13580.984
  },
  to: {
    left: 2050,
    top: -11685
  },
};

const sprint3 = {
  from: {
    left: 2050,
    top:-13580.984,
  },
  to: {
    left: 2605.571,
    top: -11685
  },
};

const sprint4 = {
  from: {
    left: 2605.571,
    top:-13580.984
  },
  to: {
    left: 3227.857,
    top: -11685
  },
};

const sprint5 = {
  from: {
    left: 3227.857,
    top:-13580.984
  },
  to: {
    left: 3795,
    top: -11685
  },
};

const sprint6 = {
  from: {
    left: 3795,
    top:-13580.984
  },
  to: {
    left: 4560.45,
    top: -11685
  },
};

const board = {
    POSTIT_WIDTH: 200,
    SHARED_ERROR_RATE: 0.05,
    data: [],
    sprints: {},
    async update() {
        const data = await fetch('https://app.klaxoon.com/manager/api/brainstorms/aa453a15-b494-48bc-b7bc-b5ab0f792ba7/state?isOnBoard=true')
        .then(response => response.json());

        this.data = data.objects;
        console.log(data);
    },
    addSprint(id, sprint) {
        this.sprints[id] = sprint;
    },
    getSprint(sprintId) {
      return this.sprints[sprintId];
    },
    getSprintCards(sprintId) {
        return this.data.filter(card => card.type === 'postit' && this.isInSprint(sprintId, card));
    },
    isInSprint(sprintId, card) {
        const sprint = this.getSprint(sprintId)
        const cardMiddleX = card.data.coords.left + (this.POSTIT_WIDTH * card.data.scale.scaleX)/2;
        const margin = this.POSTIT_WIDTH * card.data.scale.scaleX * this.SHARED_ERROR_RATE;

        return cardMiddleX >= sprint.from.left - margin
            && cardMiddleX < sprint.to.left + margin
            && card.data.coords.top >= sprint.from.top
            && card.data.coords.top < sprint.to.top;
    },
    calculateStoryPointsForSprint(sprintId) {
        const cards = this.getSprintCards(sprintId);
        console.log(cards);
        const sps = cards.map(card => {
          var sp = this.extractStoryPoints(card);

          if(this.isSharedTask(card, this.getSprint(sprintId))){
            console.log(card.data.text + " -> shared")
            return sp/2;
          }

          return sp;
        });

        return sps.reduce((acc, item) => acc + item, 0);
    },
    extractStoryPoints(card) {
        if (!card) {
            return 0;
        }

        var content = card.data.contentHtml || card.data.text;
        if(!content) {
          return 0;
        }

        var sps = this.searchStoryPoints(content);

        //console.log(sps);

        let totalSp = sps.reduce((acc, item) => {
            let rgx = /\d+/g;
            var match = item.match(rgx);

            if (!match) {
                return acc;
            }

            let sp = parseInt(match);
            return acc + sp;
        }, 0);

        return totalSp;
    },
    searchStoryPoints(str) {
        let rgx = /\d+[ ]*sp/gi;
        let matches = str.match(rgx);

        if (!matches) {
            return [];
        }

        return [matches[matches.length - 1]];
    },
    printStoryPointReport() {
      var total = 0;
      for(var sprintId in this.sprints) {
        const sprintSp = this.calculateStoryPointsForSprint(sprintId);
        total += sprintSp;
        console.log("Sprint #" + sprintId, sprintSp);
      }

      console.log("Total -> ", total);
    },

    isSharedTask(item, sprint) {
      const width = this.POSTIT_WIDTH * item.data.scale.scaleX;
      const postMiddlePos = item.data.coords.left + width/2;
      const margin = this.POSTIT_WIDTH * this.SHARED_ERROR_RATE;

      if((postMiddlePos + margin > sprint.to.left && postMiddlePos - margin < sprint.to.left) ||
        (postMiddlePos + margin > sprint.from.left && postMiddlePos - margin < sprint.from.left)) {
          return true;
        }

      return false;
    }
}

board.addSprint("1", sprint1);
board.addSprint("2", sprint2);
board.addSprint("3", sprint3);
board.addSprint("4", sprint4);
board.addSprint("5", sprint5);
board.addSprint("6", sprint6);

await board.update();
board.printStoryPointReport();