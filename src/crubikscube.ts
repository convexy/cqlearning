// 32 33 34
// 35  B 36
// 37 38 39
//  0  1  2  8  9 10 16 17 18 24 25 26
//  3  W  4 11  R 12 19  Y 20 27  O 28
//  5  6  7 13 14 15 21 22 23 29 30 31
// 40 41 42
// 43  G 44
// 45 46 47
import { State, Action, CQLearning, CGame } from "./cqleaning";

class CVirtualRubiksCube implements CGame {
  actions: Action[] = ["Wr", "Wl", "Rr", "Rl", "Yr", "Yl", "Or", "Ol", "Br", "Bl", "Gr", "Gl"];
  private state: { [k: string]: number; };
  constructor() {
    this.state = Object.fromEntries(Array.from({ length: 48 }, (_, i) => [i, i]));
  }
  getState() {
    return CVirtualRubiksCube.convertStateToStrState(this.getRawState());
  }
  getRawState() {
    return { ...this.state };
  }
  getReward() {
    return this.point;
  }
  get isGoal() {
    return Object.entries(this.state).every(([key, value]) => key === value.toString());
  }
  get point() {
    return Object.entries(this.state).filter(([key, value]) => key === value.toString()).length / 48;
  }
  updateState(action: Action) {
    const transformation = CVirtualRubiksCube.getTransformation(action);
    this.state = Object.fromEntries(Object.keys(this.state).map(k => [k, transformation[this.state[k]]]));
  }
  static convertStateToStrState(state: { [k: string]: number; }) {
    return Object.entries(state).sort(([key1, key2]) => Number(key1) - Number(key2)).map(([_, value]) => value).join("|");
  }
  static getTransformation(action: Action) {
    let transformation = Object.fromEntries(Array.from({ length: 48 }, (_, i) => [i, i]));
    let diff = {};
    switch (action) {
      case "Wr":
        diff = {
          0: 2, 2: 7, 7: 5, 5: 0,
          1: 4, 4: 6, 6: 3, 3: 1,
          37: 8, 8: 42, 42: 31, 31: 37,
          38: 11, 11: 41, 41: 28, 28: 38,
          39: 13, 13: 40, 40: 26, 26: 39,
        };
        break;
      case "Wl":
        diff = {
          0: 5, 5: 7, 7: 2, 2: 0,
          1: 3, 3: 6, 6: 4, 4: 1,
          37: 31, 31: 42, 42: 8, 8: 37,
          38: 28, 28: 41, 41: 11, 11: 38,
          39: 26, 26: 40, 40: 13, 13: 39,
        };
        break;
      case "Yr":
        diff = {
          16: 18, 18: 23, 23: 21, 21: 16,
          17: 20, 20: 22, 22: 19, 19: 17,
          34: 24, 24: 45, 45: 15, 15: 34,
          33: 27, 27: 46, 46: 12, 12: 33,
          32: 29, 29: 47, 47: 10, 10: 32,
        };
        break;
      case "Yl":
        diff = {
          16: 21, 21: 23, 23: 18, 18: 16,
          17: 19, 19: 22, 22: 20, 20: 17,
          34: 15, 15: 45, 45: 24, 24: 34,
          33: 12, 12: 46, 46: 27, 27: 33,
          32: 10, 10: 47, 47: 29, 29: 32,
        };
        break;
      case "Br":
        diff = {
          32: 34, 34: 39, 39: 37, 37: 32,
          33: 36, 36: 38, 38: 35, 35: 33,
          26: 18, 18: 10, 10: 2, 2: 26,
          25: 17, 17: 9, 9: 1, 1: 25,
          24: 16, 16: 8, 8: 0, 0: 24,
        };
        break;
      case "Bl":
        diff = {
          32: 37, 37: 39, 39: 34, 34: 32,
          33: 35, 35: 38, 38: 36, 36: 33,
          26: 2, 2: 10, 10: 18, 18: 26,
          25: 1, 1: 9, 9: 17, 17: 25,
          24: 0, 0: 8, 8: 16, 16: 24,
        };
        break;
      case "Rr":
        diff = {
          8: 10, 10: 15, 15: 13, 13: 8,
          9: 12, 12: 14, 14: 11, 11: 9,
          39: 16, 16: 47, 47: 7, 7: 39,
          36: 19, 19: 44, 44: 4, 4: 36,
          34: 21, 21: 42, 42: 2, 2: 34,
        };
        break;
      case "Rl":
        diff = {
          8: 13, 13: 15, 15: 10, 10: 8,
          9: 11, 11: 14, 14: 12, 12: 9,
          39: 7, 7: 47, 47: 16, 16: 39,
          36: 4, 4: 44, 44: 19, 19: 36,
          34: 2, 2: 42, 42: 21, 21: 34,
        };
        break;
      case "Gr":
        diff = {
          40: 42, 42: 47, 47: 45, 45: 40,
          41: 44, 44: 46, 46: 43, 43: 41,
          5: 13, 13: 21, 21: 29, 29: 5,
          6: 14, 14: 22, 22: 30, 30: 6,
          7: 15, 15: 23, 23: 31, 31: 7,
        };
        break;
      case "Gl":
        diff = {
          40: 45, 45: 47, 47: 42, 42: 40,
          41: 43, 43: 46, 46: 44, 44: 41,
          5: 29, 29: 21, 21: 13, 13: 5,
          6: 30, 30: 22, 22: 14, 14: 6,
          7: 31, 31: 23, 23: 15, 15: 7,
        };
        break;
      case "Or":
        diff = {
          24: 26, 26: 31, 31: 29, 29: 24,
          25: 28, 28: 30, 30: 27, 27: 25,
          32: 0, 0: 40, 40: 23, 23: 32,
          35: 3, 3: 43, 43: 20, 20: 35,
          37: 5, 5: 45, 45: 18, 18: 37,
        };
        break;
      case "Ol":
        diff = {
          24: 29, 29: 31, 31: 26, 26: 24,
          25: 27, 27: 30, 30: 28, 28: 25,
          32: 23, 23: 40, 40: 0, 0: 32,
          35: 20, 20: 43, 43: 3, 3: 35,
          37: 18, 18: 45, 45: 5, 5: 37,
        };
        break;
    }
    Object.assign(transformation, diff);
    return transformation;
  }
  generateRandomActions(complexity: number) {
    return Array.from({ length: complexity }, () => { return this.actions[Math.floor(Math.random() * this.actions.length)]; });
  }
  reset() {
    this.state = Object.fromEntries(Array.from({ length: 48 }, (_, i) => [i, i]));
  }
  setRandomState(complexity: number) {
    this.reset();
    for (const action of this.generateRandomActions(complexity)) this.updateState(action);
  }
  setInitState(initActions: Action[]) {
    this.reset();
    for (const action of initActions) this.updateState(action);
  }
}


function learn() {
  const cqlearning = new CQLearning();
  const cvrc = new CVirtualRubiksCube();

  cqlearning.loadFileToQ("test");

  for (let complexity = 1; complexity <= 8; complexity += 1) {
    console.log(complexity);
    let num = 10000 + complexity ** 2;
    let maxSteps = complexity * 3;
    let countGoal = 0;
    for (let i = 0; i < num; i += 1) {
      cvrc.setRandomState(complexity);
      const isGoal = cqlearning.learnOnce(cvrc, maxSteps);
      if (isGoal) countGoal++;
    }
    console.log((countGoal / num) * 100 + "%");
  }

  cqlearning.saveQToFile("test");

  const complexity = 3;
  const maxSteps = complexity * 3;
  cvrc.setRandomState(complexity);
  cqlearning.evaluate(cvrc, maxSteps);
  if (cvrc.isGoal) console.log("Goal!");
  console.log(cvrc.point);
}

learn();