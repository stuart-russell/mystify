import { TBoxTable } from "./schema";

export class API {
  async fetchBoxTableData(): Promise<TBoxTable[]> {
    return Promise.resolve([
      {
        id: "mock-box-1",
        boxName: "Cluedo Sauce",
        type: "bundle",
        status: "active",
        amount: 100,
      },
      {
        id: "mock-box-2",
        boxName: "Mystery Gamble Sauce",
        type: "item",
        status: "active",
        amount: 50,
      },
      {
        id: "mock-box-3",
        boxName: "Black Friday Deal",
        type: "bundle",
        status: "draft",
        amount: 1,
      },
    ]);
  }
}
