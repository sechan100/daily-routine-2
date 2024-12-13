/* eslint-disable @typescript-eslint/no-explicit-any */
import { stringifyYaml } from "obsidian";
import { RoutineGroupDto } from "../types";
import { JsonConvertible } from "@shared/JsonConvertible";


type Properties = RoutineGroupDto['properties'];


const getGroupPropertiesError = (propertyName: string, value: any): Error => {
  return new Error(`Group properties error: ${propertyName} is '${value}'`);
}


export class GroupProperties implements JsonConvertible<Properties> {
  private order: number; // unsigned int

  constructor(properties?: Properties){
    const p = properties ?? {
      order: 0,
    }
    this.order = p.order;
  }

  /**
   * @param frontmatter frontmatter를 해석한 js object
   */
  static fromJsonObj(jsonObj: any): GroupProperties {
    if(typeof jsonObj !== 'object'){
      throw new Error('Group frontmatter is not object.');
    }
    const fm = new GroupProperties();

    if(
      'order' in jsonObj &&
      typeof jsonObj.order === 'number'
    ){
      fm.setOrder(jsonObj.order);
    } else throw getGroupPropertiesError('order', jsonObj.order);

    return fm;
  }

  serialize(): string {
    const frontmatter = [
      "---",
      stringifyYaml(this.toJSON()),
      "---"
    ].join('\n');
    return frontmatter;
  }

  toJSON(): Properties {
    return {
      order: this.order,
    }
  }

  setOrder(order: number){
    if(order < 0){
      throw new Error('Order must be a non-negative integer.');
    }
    this.order = order;
    return this;
  }

  getOrder(){
    return this.order;
  }

}
