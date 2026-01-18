import fs from 'node:fs'

export class Notified {
  private path: string
  private notified: string[] = []

  constructor(path: string) {
    this.path = path

    if (fs.existsSync(path)) {
      this.load()
    }
  }

  public isNotified(id: string): boolean {
    return this.notified.includes(id)
  }

  /**
   * 通知済み ID を追加する（保存なし）
   * バッチ処理用。複数件を追加した後、明示的に save() を呼ぶこと。
   * @param id ツイート ID
   */
  public addWithoutSave(id: string): void {
    if (!this.notified.includes(id)) {
      this.notified.push(id)
    }
  }

  /**
   * 通知済み ID を追加し、即座に保存する
   * @param id ツイート ID
   */
  public add(id: string): void {
    this.addWithoutSave(id)
    this.save()
  }

  public isFirst(): boolean {
    return !fs.existsSync(this.path)
  }

  public load(): void {
    this.notified = JSON.parse(fs.readFileSync(this.path, 'utf8'))
  }

  public save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.notified, null, 2))
  }

  public get length(): number {
    return this.notified.length
  }
}
