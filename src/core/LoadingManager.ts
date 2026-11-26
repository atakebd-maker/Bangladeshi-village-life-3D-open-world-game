export interface LoadingProgress {
  percent: number;
  stage: string;
}

export class GameLoadingManager {
  private onProgress: (p: LoadingProgress) => void;

  constructor(onProgress: (p: LoadingProgress) => void) {
    this.onProgress = onProgress;
  }

  public report(percent: number, stage: string): void {
    this.onProgress({ percent: Math.min(100, Math.max(0, percent)), stage });
  }
}
