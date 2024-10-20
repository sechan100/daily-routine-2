

export class FileNotFoundError extends Error {
  constructor(path: string){
    super(`File not found: ${path}`);
  }
}
