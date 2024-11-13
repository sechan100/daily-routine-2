import _moment from "moment";



export abstract class TAbstractFile {
  path: string;
  name: string;
}

export class TFile extends TAbstractFile {
  basename: string;
}

export class TFolder extends TAbstractFile {
  children: TAbstractFile[];
}



export const moment = _moment;