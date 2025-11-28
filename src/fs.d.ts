// lightning-fs.d.ts
declare module '@isomorphic-git/lightning-fs' {
  interface FSOptions {
    wipe?: boolean
    base?: string
    storeName?: string
    size?: number
  }

  interface FSFile {
    name: string
    type: string
    data: Uint8Array | string
  }

  class LightningFS {
    constructor(name?: string, opts?: FSOptions)
    readonly name: string

    // Promises API
    promises: {
      writeFile(path: string, data: string | Uint8Array, options?: any): Promise<void>
      readFile(path: string, options?: any): Promise<Uint8Array | string>
      mkdir(path: string, options?: any): Promise<void>
      readdir(path: string): Promise<string[]>
      unlink(path: string): Promise<void>
      rmdir(path: string, options?: any): Promise<void>
      stat(path: string): Promise<any>
      exists(path: string): Promise<boolean>
    }

    // callback API
    writeFile(path: string, data: string | Uint8Array, cb: (err?: Error) => void): void
    readFile(path: string, cb: (err?: Error, data?: Uint8Array) => void): void
    mkdir(path: string, cb: (err?: Error) => void): void
    readdir(path: string, cb: (err?: Error, entries?: string[]) => void): void
    unlink(path: string, cb: (err?: Error) => void): void
    rmdir(path: string, cb: (err?: Error) => void): void
    exists(path: string, cb: (exists: boolean) => void): void
    stat(path: string, cb: (err?: Error, stat?: any) => void): void
  }

  export default LightningFS
}
