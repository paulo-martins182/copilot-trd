import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stripDataUrlPrefix } from "@shared/utils/base64";

export class SnapshotStorage {
  public constructor(private readonly baseDir: string) {}

  public async save(dataUrl: string, id: string): Promise<string> {
    const dir = join(this.baseDir, "snapshots");
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, `${id}.png`);
    await writeFile(filePath, Buffer.from(stripDataUrlPrefix(dataUrl), "base64"));
    return filePath;
  }
}
