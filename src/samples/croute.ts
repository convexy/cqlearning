import { State, Action, CQLearning, CGame } from "../cqleaning";

class CRoute implements CGame {
  actions: Action[] = ["u", "l", "r", "d"];
  public columns: number;
  public rows: number;
  public start: number;
  public goal: number;
  public wall: number[];
  private state: number;
  private penalty: number;
  constructor(columns: number, rows: number, startPosition: { column: number, row: number }, goalPostion: { column: number, row: number }, wall: number[] = []) {
    this.columns = columns;
    this.rows = rows;
    this.start = this.convertPositionToState(startPosition);
    this.goal = this.convertPositionToState(goalPostion);
    this.wall = wall;
    this.state = this.start;
    this.penalty = 0;
  }
  convertStateToPosition(state: number) {
    return { column: Math.floor(state / this.columns), row: state % this.columns }
  }
  convertPositionToState(position: { column: number, row: number }) {
    return this.columns * position.row + position.column;
  }
  reset() {
    this.state = this.start;
  }
  get isGoal() {
    return this.state == this.goal;
  }
  getState() {
    return this.state.toString();
  }
  getReward() {
    return this.isGoal ? 1 : this.penalty;
    const goalPostion = this.convertStateToPosition(this.goal);
    const statePosition = this.convertStateToPosition(this.state);
    const x = goalPostion.column - statePosition.column;
    const y = goalPostion.row - statePosition.row;
    return this.isGoal ? 1 : 1 / (2 * Math.sqrt(x ** 2 + y ** 2));
  }
  updateState(action: Action) {
    this.penalty = 0;
    let transition = 0;
    switch (action) {
      case "u":
        if (this.state >= this.columns) transition = -this.columns;
        break;
      case "l":
        if (this.state % this.columns != 0) transition = -1;
        break;
      case "r":
        if (this.state % this.columns != this.columns - 1) transition = +1;
        break;
      case "d":
        if (this.state < this.columns * (this.rows - 1)) transition = +this.columns;
        break;
    }
    if (!this.wall.includes(this.state + transition)) this.state += transition;
    else this.penalty = -1;
  }
}

function learn() {
  const cqleaning = new CQLearning();

  const croute = new CRoute(5, 5, { column: 1, row: 1 }, { column: 4, row: 0 }, [2, 7, 9, 12, 16, 18]);
  cqleaning.loadFileToQ(croute.columns + "-" + croute.rows + "-" + croute.goal + "-" + croute.wall.join(","));
  // const croute = new CRoute(5, 5, { column: 0, row: 0 }, { column: 4, row: 4 }, [5, 6, 7, 8, 16, 17, 18, 19]);
  const numLearn = 100000;
  let countGoal = 0;
  for (let i = 0; i < numLearn; i++) {
    croute.reset();
    const isGoal = cqleaning.learnOnce(croute, croute.columns * croute.rows * 10);
    if (isGoal) countGoal++;
    if ((i + 1) % (numLearn / 10) == 0) {
      console.clear();
      console.log("|" + "*".repeat(i / numLearn * 10) + " ".repeat(10 - i / numLearn * 10) + "|");
    }
  }
  console.clear();
  // cqleaning.saveQToFile(croute.columns + "-" + croute.rows + "-" + croute.goal + "-" + croute.wall.join(","));

  const numEvaluate = 1000;
  countGoal = 0;
  for (let i = 0; i < numEvaluate; i++) {
    croute.reset();
    const isGoal = cqleaning.evaluate(croute, croute.columns * croute.rows * 10);
    if (isGoal) countGoal++;
  }
  console.log((countGoal / numEvaluate) * 100 + "%");

  console.log("S: Start, G: Goal, *: Wall")
  console.log("【Field】")
  const field = [];
  for (let row = 0; row < croute.rows; row++) {
    const field_row = [];
    for (let column = 0; column < croute.columns; column++) {
      const stateNumber = croute.columns * row + column;
      const state = stateNumber.toString();
      const action = cqleaning.chooseBestAction(state, croute.actions);
      let thing = " ";
      if (croute.start == stateNumber) thing = "S";
      else if (croute.goal == stateNumber) thing = "G";
      else if (croute.wall.includes(stateNumber)) thing = "*";
      else thing = " ";
      field_row.push(thing);
    }
    field.push(field_row);
  }
  console.log(field);
  console.log("【Result】")
  const result = [];
  for (let row = 0; row < croute.rows; row++) {
    const result_row = [];
    for (let column = 0; column < croute.columns; column++) {
      const stateNumber = croute.columns * row + column;
      const state = stateNumber.toString();
      const action = cqleaning.chooseBestAction(state, croute.actions);
      let thing = " ";
      if (croute.start == stateNumber) thing = "S";
      else if (croute.goal == stateNumber) thing = "G";
      else if (croute.wall.includes(stateNumber)) thing = "*";
      else {
        switch (action) {
          case "u":
            thing = "↑";
            break;
          case "l":
            thing = "←";
            break;
          case "r":
            thing = "→";
            break;
          case "d":
            thing = "↓";
            break;
        }
      }
      result_row.push(thing);
    }
    result.push(result_row);
  }
  console.log(result);
}

learn()