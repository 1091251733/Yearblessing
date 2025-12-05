
export enum AppStage {
  SPLASH = 'SPLASH',
  INPUT_NAME = 'INPUT_NAME',
  SHAKE = 'SHAKE',
  RESULT = 'RESULT'
}

export interface Blessing {
  id: number;
  keyword: string;
  text: string;
  desc: string;
}

export interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  rotation: number;
  color: string;
}
