import { AttachmentAPI } from "@/types/api";
import { randomUUID } from "crypto";
import createMockURL from "../createMockURL";

interface AttachmentMockConstructor {
  messageId?: string | null;
  subType: "JPEG" | "PNG" | "GIF";
  height?: number;
  width?: number;
  url: string;
  thumbnailUrl: string;
}

class AttachmentMock implements AttachmentAPI {
  id: string;
  messageId: string | null;
  type: "IMAGE";
  subType: "JPEG" | "PNG" | "GIF";
  height: number;
  width: number;
  url: string;
  thumbnailUrl: string;

  constructor({
    messageId,
    subType,
    width = 320,
    height = 320,
    url,
    thumbnailUrl,
  }: AttachmentMockConstructor) {
    this.id = randomUUID();
    this.messageId = messageId ? messageId : null;
    this.type = "IMAGE";
    this.subType = subType;
    this.width = width;
    this.height = height;
    this.url = createMockURL(url);
    this.thumbnailUrl = createMockURL(thumbnailUrl);
  }

  updateMessageId(id: string | null) {
    this.messageId = id;
  }
}

export default AttachmentMock;
