/* eslint-disable @typescript-eslint/no-explicit-any */


export type BaseDndItem = {
  id: string;
}

export const isBaseDndItem = (item: any): item is BaseDndItem => {
  return item && typeof item.id === 'string';
}