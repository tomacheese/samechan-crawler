import fs from 'node:fs'

export class Notified {
  private path: string
  private notified: string[] = []
  // 初回実行かどうかをコンストラクタ時点で確定させるフラグ
  private isFirstRun: boolean

  constructor(path: string) {
    this.path = path
    // ファイルが存在しない場合は初回実行とみなす
    this.isFirstRun = !fs.existsSync(path)

    if (!this.isFirstRun) {
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
    return this.isFirstRun
  }

  public load(): void {
    const data: unknown = JSON.parse(fs.readFileSync(this.path, 'utf8'))
    // 型検証: 文字列の配列であることを確認
    if (
      !Array.isArray(data) ||
      !data.every((item) => typeof item === 'string')
    ) {
      throw new Error(
        'notified.json の形式が不正です: 文字列の配列である必要があります'
      )
    }
    this.notified = data
  }

  public save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.notified, null, 2))
  }

  public get length(): number {
    return this.notified.length
  }
}
