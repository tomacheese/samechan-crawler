import fs from 'node:fs'

/**
 * 通知済みツイート ID を JSON ファイルで管理するクラス
 */
export class Notified {
  private path: string
  private notified: string[] = []

  /**
   * @param path 保存先ファイルのパス。存在する場合は読み込む
   */
  constructor(path: string) {
    this.path = path

    if (fs.existsSync(path)) {
      this.load()
    }
  }

  /**
   * 通知済みかどうかを返す
   * @param id ツイート ID
   */
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

  /**
   * 保存先ファイルが存在しない (初回実行) かどうかを返す
   */
  public isFirst(): boolean {
    return !fs.existsSync(this.path)
  }

  /**
   * 保存先ファイルから通知済み ID を読み込む
   * @throws 文字列の配列でない場合
   */
  public load(): void {
    const data: unknown = JSON.parse(fs.readFileSync(this.path, 'utf8'))
    if (!Array.isArray(data) || data.some((item) => typeof item !== 'string')) {
      throw new Error(
        `${this.path} の形式が不正です: 文字列の配列である必要があります`
      )
    }
    this.notified = data
  }

  /**
   * 通知済み ID を保存先ファイルに書き込む
   */
  public save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.notified, null, 2))
  }

  /**
   * 通知済み ID の件数
   */
  public get length(): number {
    return this.notified.length
  }
}
