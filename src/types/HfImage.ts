export interface HfFileInfo {
  offset: number;
  size: number;
}

export interface HfImageData {
  id: number;
  url: string;
  keyStr: string;
  fileInfo: HfFileInfo;
}

export interface HfIndexData {
  files: Record<string, HfFileInfo>;
} 