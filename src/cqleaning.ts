import * as fs from "fs";
import * as zlib from 'zlib';

export type State = string;
export type Action = string;
export interface CGame {
  actions: Action[];
  getState(): State;
  getReward(): number;
  get isGoal(): boolean;
  updateState(action: Action): void;
}
export class CQLearning {
  private alpha: number;
  private gamma: number;
  private epsilon: number;
  private Q: { [key: string]: number };
  private usedQ: { [key: string]: number };
  constructor(alpha: number = 0.1, gamma: number = 0.9, epsilon: number = 0.2) {
    this.alpha = alpha;
    this.gamma = gamma;
    this.epsilon = epsilon;
    this.Q = {};
    this.usedQ = {};
  }
  getQValue(state: State, action: Action) {
    return this.Q[JSON.stringify([state, action])] ?? Math.random();
  }
  setQValue(state: State, action: Action, value: number) {
    this.Q[JSON.stringify([state, action])] = value;
    this.usedQ[JSON.stringify([state, action])] = value;
  }
  chooseBestAction(state: State, actions: Action[]) {
    return actions.reduce((bestAction, action) => {
      return this.getQValue(state, action) > this.getQValue(state, bestAction) ? action : bestAction;
    });
  }
  chooseAction(state: State, actions: Action[]) {
    if (Math.random() < this.epsilon) {
      return actions[Math.floor(Math.random() * actions.length)];
    }
    else {
      return this.chooseBestAction(state, actions);
    }
  }
  update(state: State, action: Action, reward: number, nextState: State, actions: Action[]) {
    const oldQValue = this.getQValue(state, action);
    let maxNextQValue = Math.max(...actions.map(a => this.getQValue(nextState, a)));
    const newQValue = oldQValue + this.alpha * (reward + this.gamma * maxNextQValue - oldQValue);
    this.setQValue(state, action, newQValue);
  }
  saveQToFile(name: string) {
    fs.writeFileSync("./models/" + name + ".json.gz", zlib.gzipSync(JSON.stringify(this.Q)), "utf-8");
  }
  saveUsedQToFile(name: string) {
    fs.writeFileSync("./models/" + name + ".json.gz", zlib.gzipSync(JSON.stringify(this.usedQ)), "utf-8");
  }
  loadFileToQ(name: string) {
    if (fs.existsSync("./models/" + name + ".json.gz")) {
      const Q = JSON.parse(zlib.gunzipSync(fs.readFileSync("./models/" + name + ".json.gz")).toString());
      Object.assign(this.Q, Q);
    }
  }
  learnOnce(cgame: CGame, maxStep: number = 100) {
    for (let i = 0; i < maxStep; i++) {
      const state = cgame.getState();
      const action = this.chooseAction(state, cgame.actions);
      cgame.updateState(action);
      const reward = cgame.getReward();
      const nextState = cgame.getState();
      this.update(state, action, reward, nextState, cgame.actions);
      if (cgame.isGoal) return true;
    }
    return false;
  }
  evaluate(cgame: CGame, maxStep: number = 100) {
    for (let i = 0; i < maxStep; i++) {
      const state = cgame.getState();
      const action = this.chooseBestAction(state, cgame.actions);
      cgame.updateState(action);
      const reward = cgame.getReward();
      const nextState = cgame.getState();
      this.update(state, action, reward, nextState, cgame.actions);
      if (cgame.isGoal) return true;
    }
    return false;
  }
}


