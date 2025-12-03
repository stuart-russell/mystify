import { TBoxTable } from "./schema";

export class API {
  async fetchBoxTableData(): Promise<TBoxTable[]> {
    return Promise.resolve([
      {
        boxName: "Cluedo Sauce",
        type: "bundle",
        status: "active",
        amount: 100,
      },
      {
        boxName: "Mystery Gamble Sauce",
        type: "item",
        status: "active",
        amount: 50,
      },
      {
        boxName: "Black Friday Deal",
        type: "bundle",
        status: "draft",
        amount: 0,
      },
    ]);
  }
}
